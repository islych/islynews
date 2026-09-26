import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../../../core/services/article.service';
import { Observable, switchMap } from 'rxjs';
import { Article } from '../../../core/models/article.model';
import { backendUrl } from '../../../core/api.config';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="create-article-page min-h-screen pt-20 pb-16 px-4">
      <div class="max-w-3xl mx-auto">

        <div class="mb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-1 h-4 rounded-full" style="background: #8B5CF6"></span>
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Editorial workspace</span>
          </div>
          <h1 class="text-3xl font-black text-white">New Article</h1>
          <p class="create-subtitle">Share your story with the world.</p>
        </div>

        <form (ngSubmit)="submit(false)" class="space-y-6">

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Title</label>
            <input [(ngModel)]="form.title" name="title" required
                   placeholder="Enter a compelling headline..."
                   class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500 transition-colors">
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Cover image</label>
            <label class="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900 px-4 py-4 text-sm font-semibold text-zinc-300 hover:border-purple-500">
              <span>{{ selectedFile ? selectedFile.name : 'Choose an image from your device' }}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden"
                     (change)="onImageSelected($event)">
            </label>
            <p class="mt-2 text-xs text-zinc-500">JPG, PNG, WebP or GIF · maximum 5 MB</p>
            @if (previewUrl) {
              <img [src]="previewUrl" alt="Selected cover preview"
                   class="mt-3 h-48 w-full rounded-xl object-cover border border-zinc-800">
            }
          </div>

          <div>
            <label class="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">Content</label>
            <textarea [(ngModel)]="form.content" name="content" required rows="14"
                      placeholder="Write your article..."
                      class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"></textarea>
          </div>

          <p class="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm text-zinc-400">
            Save your work as a draft, or submit it to an administrator for editorial review. It will only appear publicly after approval.
          </p>

          @if (error()) {
            <p class="text-red-400 text-sm">{{ error() }}</p>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" (click)="submit(false)" [disabled]="loading()"
                    class="w-full py-3 rounded-xl border border-zinc-700 font-bold text-zinc-300 text-sm hover:bg-zinc-800 disabled:opacity-50">
              Save Draft
            </button>
            <button type="button" (click)="submit(true)" [disabled]="loading()"
                    class="w-full py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 glow-purple"
                    style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
              {{ loading() ? 'Submitting...' : 'Submit for Review' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateArticleComponent {
  form = { title: '', content: '', imageUrl: '' };
  loading = signal(false);
  error = signal<string | null>(null);
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(private articleService: ArticleService, private router: Router) {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.error.set(null);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      this.error.set('Choose a JPG, PNG, WebP or GIF image.');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('The image must be smaller than 5 MB.');
      input.value = '';
      return;
    }
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  submit(sendForReview: boolean): void {
    if (!this.form.title.trim() || !this.form.content.trim()) return;
    this.loading.set(true);
    this.error.set(null);
    const createArticle$: Observable<Article> = this.selectedFile
      ? this.articleService.uploadImage(this.selectedFile).pipe(
          switchMap(({ url }) => this.articleService.create({ ...this.form, imageUrl: backendUrl(url) }))
        )
      : this.articleService.create(this.form);

    createArticle$.subscribe({
      next: (article) => {
        if (!sendForReview) {
          this.router.navigate(['/articles/my-articles']);
          return;
        }
        this.articleService.submitForReview(article.id).subscribe({
          next: () => this.router.navigate(['/articles/my-articles']),
          error: (e) => {
            this.error.set(e.error?.message ?? 'The article was saved, but submission failed.');
            this.loading.set(false);
          }
        });
      },
      error: (e) => {
        this.error.set(e.error?.message ?? 'Failed to save article.');
        this.loading.set(false);
      },
    });
  }
}
