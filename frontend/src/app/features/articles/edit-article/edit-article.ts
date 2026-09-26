import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../../core/services/article.service';
import { Observable, switchMap } from 'rxjs';
import { Article } from '../../../core/models/article.model';
import { backendUrl } from '../../../core/api.config';

@Component({
  selector: 'app-edit-article',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen pt-20 pb-16 px-4">
      <div class="max-w-3xl mx-auto">

        <div class="mb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-1 h-4 rounded-full" style="background: #06B6D4"></span>
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Editor</span>
          </div>
          <h1 class="text-3xl font-black text-white">Edit Article</h1>
        </div>

        @if (loadingArticle()) {
          <div class="text-center py-20 text-zinc-600">Loading article data...</div>
        } @else {
          <form (ngSubmit)="submit()" class="space-y-6">

            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
              <input [(ngModel)]="form.title" name="title" required
                     placeholder="Enter a compelling headline..."
                     class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500 transition-colors">
            </div>

            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Cover image</label>
              <label class="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-4 text-sm font-semibold text-zinc-300 hover:border-purple-500">
                {{ selectedFile ? selectedFile.name : 'Choose a new image from your device' }}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" (change)="onImageSelected($event)">
              </label>
              <p class="mt-2 text-xs text-zinc-500">JPG, PNG, WebP or GIF · maximum 5 MB</p>
              @if (previewUrl) {
                <img [src]="previewUrl" alt="Article cover preview" class="mt-3 h-48 w-full rounded-xl object-cover border border-zinc-800">
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Content</label>
              <textarea [(ngModel)]="form.content" name="content" required rows="14"
                        placeholder="Write your article..."
                        class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"></textarea>
            </div>

            <p class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-zinc-400">
              Editing a rejected article returns it to Draft. Submit it again from My Articles when your corrections are ready.
            </p>

            @if (error()) {
              <p class="text-red-400 text-sm">{{ error() }}</p>
            }

            <div class="flex gap-4">
              <button type="button" (click)="cancel()"
                      class="flex-1 py-3 rounded-xl font-bold text-zinc-400 text-sm border border-zinc-800 hover:bg-zinc-800 transition-all">
                Cancel
              </button>
              <button type="submit" [disabled]="submitting()"
                      class="flex-[2] py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 glow-purple"
                      style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
                {{ submitting() ? 'Saving Changes...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class EditArticleComponent implements OnInit {
  articleId: number | null = null;
  form = { title: '', content: '', imageUrl: '' };
  loadingArticle = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/']);
      return;
    }
    this.articleId = id;

    this.articleService.getById(id).subscribe({
      next: (article) => {
        this.form = {
          title: article.title,
          content: article.content,
          imageUrl: article.imageUrl || ''
        };
        this.previewUrl = article.imageUrl || null;
        this.loadingArticle.set(false);
      },
      error: () => {
        this.error.set('Could not load article.');
        this.loadingArticle.set(false);
      }
    });
  }

  submit(): void {
    if (!this.form.title.trim() || !this.form.content.trim() || !this.articleId) return;
    this.submitting.set(true);
    this.error.set(null);
    const update$: Observable<Article> = this.selectedFile
      ? this.articleService.uploadImage(this.selectedFile).pipe(
          switchMap(({ url }) => this.articleService.update(this.articleId!, { ...this.form, imageUrl: backendUrl(url) }))
        )
      : this.articleService.update(this.articleId, this.form);
    update$.subscribe({
      next: () => this.router.navigate(['/articles/my-articles']),
      error: (e) => {
        this.error.set(e.error?.message ?? 'Failed to update article.');
        this.submitting.set(false);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.error.set('Choose a JPG, PNG, WebP or GIF image smaller than 5 MB.');
      input.value = '';
      return;
    }
    if (this.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  cancel(): void {
    this.router.navigate(['/articles', this.articleId]);
  }
}
