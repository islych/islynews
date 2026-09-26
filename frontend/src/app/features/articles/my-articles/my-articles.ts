import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../core/services/article.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Article } from '../../../core/models/article.model';

@Component({
  selector: 'app-my-articles',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen pt-20 pb-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="mb-8 flex justify-between items-center">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-1 h-4 rounded-full" style="background: #8B5CF6"></span>
              <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">My Content</span>
            </div>
            <h1 class="text-3xl font-black text-white">My Articles</h1>
          </div>
          <a routerLink="/articles/create"
            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
            + New Article
          </a>
        </div>

        <section class="mb-8 rounded-2xl border border-purple-500/15 bg-zinc-900/60 p-5">
          <div class="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 class="font-serif text-xl font-bold text-white">Author bio</h2>
              <p class="mt-1 text-xs text-zinc-500">This introduction appears on your published articles.</p>
            </div>
            <span class="text-xs" [class.text-red-400]="bio.length > 500" [class.text-zinc-500]="bio.length <= 500">
              {{ bio.length }}/500
            </span>
          </div>
          <textarea [(ngModel)]="bio" maxlength="500" rows="4"
                    placeholder="Tell readers about your expertise, interests and editorial focus..."
                    class="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-200 outline-none focus:border-purple-500"></textarea>
          <div class="mt-3 flex items-center justify-between gap-4">
            <p class="text-xs" [class.text-green-400]="bioMessage() === 'Bio saved.'" [class.text-red-400]="bioMessage() !== 'Bio saved.'">
              {{ bioMessage() }}
            </p>
            <button (click)="saveBio()" [disabled]="bioSaving() || bio.length > 500"
                    class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50">
              {{ bioSaving() ? 'Saving...' : 'Save bio' }}
            </button>
          </div>
        </section>

        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="card-bg rounded-xl h-24 animate-pulse"></div>
            }
          </div>
        } @else if (articles().length === 0) {
          <div class="text-center py-24">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                 style="background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.2)">
              <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H6m0 0H0"/>
              </svg>
            </div>
            <p class="text-zinc-500 text-sm mb-4">No articles yet.</p>
            <a routerLink="/articles/create" class="inline-block text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Create your first article →
            </a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (article of articles(); track article.id) {
              <div class="card-bg rounded-xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition-all group">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {{ article.title }}
                    </h3>
                    <p class="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {{ article.content }}
                    </p>
                    <div class="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{{ article.createdAt | date:'short' }}</span>
                      <span [ngClass]="statusClass(article.status)">
                        {{ statusLabel(article.status) }}
                      </span>
                    </div>
                    @if (article.status === 'REJECTED' && article.rejectionReason) {
                      <p class="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                        Editorial feedback: {{ article.rejectionReason }}
                      </p>
                    }
                  </div>
                  <div class="flex gap-2">
                    @if (article.status === 'DRAFT' || article.status === 'REJECTED') {
                      <button (click)="submitForReview(article)"
                        class="px-4 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-colors text-sm font-semibold">
                        Submit for review
                      </button>
                    }
                    <a [routerLink]="['/articles', article.id]"
                      class="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white transition-colors text-sm font-semibold">
                      View
                    </a>
                    <a [routerLink]="['/articles', article.id, 'edit']"
                      class="px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-colors text-sm font-semibold">
                      Edit
                    </a>
                    <button (click)="deleteArticle(article)"
                      class="px-4 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors text-sm font-semibold">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class MyArticlesComponent implements OnInit {
  articles = signal<Article[]>([]);
  loading = signal(true);
  bio = '';
  bioSaving = signal(false);
  bioMessage = signal('');

  constructor(
    private articleService: ArticleService,
    private userService: UserService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.bio = this.auth.currentUser()?.bio ?? '';
    this.loadMyArticles();
  }

  saveBio(): void {
    if (this.bio.length > 500) return;
    this.bioSaving.set(true);
    this.bioMessage.set('');
    this.userService.updateMyBio(this.bio).subscribe({
      next: user => {
        this.auth.updateCurrentUser(user);
        this.bio = user.bio ?? '';
        this.bioSaving.set(false);
        this.bioMessage.set('Bio saved.');
      },
      error: error => {
        this.bioSaving.set(false);
        this.bioMessage.set(error.error?.message ?? 'Unable to save the bio.');
      },
    });
  }

  loadMyArticles(): void {
    this.articleService.getMyArticles().subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading articles', err);
        this.loading.set(false);
      }
    });
  }

  deleteArticle(article: Article): void {
    if (confirm(`Delete "${article.title}"?`)) {
      this.articleService.delete(article.id).subscribe({
        next: () => {
          this.articles.update(list => list.filter(a => a.id !== article.id));
        },
        error: (err) => console.error('Error deleting article', err)
      });
    }
  }

  submitForReview(article: Article): void {
    this.articleService.submitForReview(article.id).subscribe({
      next: updated => this.articles.update(list => list.map(item => item.id === updated.id ? updated : item)),
      error: err => console.error('Error submitting article', err)
    });
  }

  statusLabel(status: Article['status']): string {
    return status.replace('_', ' ');
  }

  statusClass(status: Article['status']): string {
    if (status === 'PUBLISHED' || status === 'ACTIVE') return 'text-green-400';
    if (status === 'REJECTED') return 'text-red-400';
    if (status === 'PENDING_REVIEW') return 'text-cyan-400';
    return 'text-yellow-400';
  }
}
