import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../core/services/article.service';
import { CommentService } from '../../../core/services/comment.service';
import { LikeService } from '../../../core/services/like.service';
import { SavedArticleService } from '../../../core/services/saved-article.service';
import { AuthService } from '../../../core/services/auth.service';
import { Article } from '../../../core/models/article.model';
import { Comment } from '../../../core/models/comment.model';
import { ArticleAnalysis } from '../../../core/services/external-news.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen pt-20 pb-16">
      @if (loading()) {
        <div class="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-600">Loading...</div>
      } @else if (article()) {
        <article class="max-w-4xl mx-auto px-4">

          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
                {{ article()!.author?.role }}
              </span>
              <span class="text-zinc-700">·</span>
              <span class="text-xs text-zinc-500">{{ article()!.createdAt | date:'MMMM d, y' }}</span>
            </div>
            <h1 class="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
              {{ article()!.title }}
            </h1>
            <div class="flex items-center justify-between flex-wrap gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                     style="background: linear-gradient(135deg, #8B5CF6, #06B6D4);">
                  {{ article()!.author?.username?.charAt(0)?.toUpperCase() }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">{{ article()!.author?.username }}</p>
                  <p class="text-xs text-zinc-500">{{ article()!.author?.role }}</p>
                </div>
              </div>
              <!-- Actions -->
              @if (auth.isLoggedIn()) {
                <div class="flex items-center gap-3">
                  @if (canManage()) {
                    <a [routerLink]="['/articles', article()!.id, 'edit']"
                       class="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-purple-500/50 hover:text-purple-400 transition-all text-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Edit
                    </a>
                    <button (click)="deleteArticle()"
                            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400 transition-all text-sm">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Delete
                    </button>
                    <div class="w-px h-6 bg-zinc-800 mx-1"></div>
                  }
                  <button (click)="toggleLike()"
                          class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm"
                          [class]="liked() ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400'">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {{ likeCount() }}
                  </button>
                  <button (click)="toggleSave()"
                          class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm"
                          [class]="saved() ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-zinc-700 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400'">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    {{ saved() ? 'Saved' : 'Save' }}
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Hero Image -->
          @if (article()!.imageUrl) {
            <div class="rounded-2xl overflow-hidden mb-10 h-72 md:h-96">
              <img [src]="article()!.imageUrl" [alt]="article()!.title"
                   class="w-full h-full object-cover opacity-90">
            </div>
          }

          <!-- Content -->
          <div class="prose prose-invert max-w-none mb-12">
            <p class="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">{{ article()!.content }}</p>
          </div>

          @if (article()!.author?.bio) {
            <aside class="mb-12 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
              <p class="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-rose-400">About the author</p>
              <div class="flex items-start gap-4">
                <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
                     style="background: linear-gradient(135deg, #d87582, #8B5CF6);">
                  {{ article()!.author.username.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h2 class="font-serif text-xl font-bold text-zinc-900">{{ article()!.author.username }}</h2>
                  <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{{ article()!.author.bio }}</p>
                </div>
              </div>
            </aside>
          }

          @if (auth.isLoggedIn() && analysis()) {
            <section class="mb-12 grid gap-5 md:grid-cols-[1.35fr_.65fr]">
              <div class="card-bg rounded-2xl border border-purple-500/20 p-6">
                <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-purple-300">Key points</h2>
                <ul class="space-y-3 text-sm leading-6 text-zinc-300">
                  @for (point of analysis()!.keyPoints; track point) {
                    <li class="flex gap-3"><span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-400"></span><span>{{ point }}</span></li>
                  }
                </ul>
              </div>
              <div class="card-bg rounded-2xl border border-purple-500/20 p-6">
                <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-purple-300">Tags</h2>
                <div class="flex flex-wrap gap-2">
                  @for (tag of analysis()!.tags; track tag) {
                    <span class="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-300">{{ tag }}</span>
                  }
                </div>
              </div>
            </section>

            @if (related().length) {
              <section class="mb-12">
                <h2 class="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">Related articles</h2>
                <div class="grid gap-4 md:grid-cols-3">
                  @for (item of related(); track item.id) {
                    <a [routerLink]="['/articles', item.id]" class="card-bg overflow-hidden rounded-2xl border border-zinc-800 transition hover:border-purple-500/40">
                      @if (item.imageUrl) { <img [src]="item.imageUrl" [alt]="item.title" class="h-28 w-full object-cover"> }
                      <div class="p-4"><h3 class="line-clamp-3 text-sm font-bold text-white">{{ item.title }}</h3><p class="mt-2 text-xs text-zinc-500">{{ item.createdAt | date:'MMM d, y' }}</p></div>
                    </a>
                  }
                </div>
              </section>
            }
          }

          <!-- AI Summary (members only) -->
          @if (auth.isLoggedIn()) {
          <div class="card-bg rounded-2xl p-6 mb-12 border border-purple-500/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                   style="background: linear-gradient(135deg, #8B5CF6, #06B6D4);">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">AI Summary</h3>
                <p class="text-xs text-zinc-500">A concise reading companion from Isly News</p>
              </div>
            </div>
            @if (summary()) {
              <p class="text-zinc-300 text-sm leading-relaxed">{{ summary() }}</p>
            } @else {
              <p class="text-zinc-600 text-sm mb-4">Generate an AI-powered summary of this article.</p>
              <button (click)="loadSummary()"
                      [disabled]="summaryLoading()"
                      class="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                      style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
                {{ summaryLoading() ? 'Generating...' : 'Generate Summary' }}
              </button>
            }
          </div>
          }

          <!-- Comments -->
          <section>
            <div class="flex items-center gap-2 mb-6">
              <span class="w-1 h-4 rounded-full" style="background: #06B6D4"></span>
              <h2 class="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                Comments ({{ comments().length }})
              </h2>
            </div>

            @if (auth.isLoggedIn()) {
              <div class="card-bg rounded-xl p-4 mb-6">
                <textarea [(ngModel)]="newComment" rows="3" placeholder="Share your thoughts..."
                          class="w-full bg-transparent text-sm text-zinc-300 placeholder-zinc-600 resize-none outline-none"></textarea>
                <div class="flex justify-end mt-3">
                  <button (click)="submitComment()" [disabled]="!newComment.trim()"
                          class="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40 transition-all"
                          style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
                    Post Comment
                  </button>
                </div>
              </div>
            }

            <div class="space-y-4">
              @for (comment of comments(); track comment.id) {
                <div class="card-bg rounded-xl p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                           style="background: linear-gradient(135deg, #8B5CF6, #06B6D4);">
                        {{ comment.user?.username?.charAt(0)?.toUpperCase() }}
                      </div>
                      <span class="text-sm font-medium text-white">{{ comment.user?.username }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-zinc-600">{{ comment.createdAt | date:'MMM d' }}</span>
                      @if (auth.hasRole('ADMIN')) {
                        <button (click)="deleteComment(comment.id)"
                                class="text-xs text-zinc-600 hover:text-red-400 transition-colors">✕</button>
                      }
                    </div>
                  </div>
                  <p class="text-sm text-zinc-400">{{ comment.content }}</p>
                </div>
              }
              @if (comments().length === 0) {
                <p class="text-center text-zinc-600 py-8 text-sm">No comments yet. Be the first.</p>
              }
            </div>
          </section>
        </article>
      }
    </div>
  `,
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  summary = signal<string | null>(null);
  summaryLoading = signal(false);
  analysis = signal<ArticleAnalysis | null>(null);
  related = signal<Article[]>([]);
  newComment = '';
  liked = signal(false);
  saved = signal(false);
  likeCount = signal(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private commentService: CommentService,
    private likeService: LikeService,
    private savedService: SavedArticleService,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.articleService.getById(id).subscribe({
      next: (a) => {
        this.article.set(a);
        this.loading.set(false);
        this.loadComments(id);
        this.loadLikeCount(id);
        this.checkLikeAndSaveStatus(id);
        if (this.auth.isLoggedIn()) this.loadInsights(id);
      },
      error: () => this.loading.set(false),
    });
  }

  loadInsights(id: number): void {
    this.articleService.getAnalysis(id).subscribe(result => {
      this.analysis.set(result);
      this.summary.set(result.summary);
    });
    this.articleService.getRelated(id).subscribe(items => this.related.set(items));
  }

  checkLikeAndSaveStatus(articleId: number): void {
    if (!this.auth.isLoggedIn()) return;
    
    this.likeService.checkIfLiked(articleId).subscribe(isLiked => {
      this.liked.set(isLiked);
    });
    
    this.savedService.checkIfSaved(articleId).subscribe(isSaved => {
      this.saved.set(isSaved);
    });
  }

  loadComments(id: number): void {
    this.commentService.getByArticle(id).subscribe(c => this.comments.set(c));
  }

  loadLikeCount(id: number): void {
    this.likeService.getCount(id).subscribe(c => this.likeCount.set(c));
  }

  loadSummary(): void {
    const id = this.article()!.id;
    this.summaryLoading.set(true);
    this.articleService.getSummary(id).subscribe({
      next: (s) => { this.summary.set(s); this.summaryLoading.set(false); },
      error: () => this.summaryLoading.set(false),
    });
  }

  toggleLike(): void {
    if (!this.auth.isLoggedIn()) return;
    const articleId = this.article()!.id;
    
    this.likeService.toggleLike(articleId).subscribe({
      next: (response) => {
        this.liked.set(response.liked);
        if (response.liked) {
          this.likeCount.update(c => c + 1);
        } else {
          this.likeCount.update(c => Math.max(0, c - 1));
        }
      },
      error: (err) => {
        console.error('Error toggling like:', err);
      }
    });
  }

  toggleSave(): void {
    if (!this.auth.isLoggedIn()) return;
    const articleId = this.article()!.id;
    
    this.savedService.toggleSave(articleId).subscribe({
      next: (response) => {
        this.saved.set(response.saved);
      },
      error: (err) => {
        console.error('Error toggling save:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.auth.isLoggedIn()) return;
    const user = this.auth.currentUser()!;
    this.commentService.add({
      content: this.newComment,
      user: { id: user.id },
      article: { id: this.article()!.id },
    }).subscribe(c => {
      this.comments.update((list: Comment[]) => [...list, c]);
      this.newComment = '';
    });
  }

  deleteComment(id: number): void {
    this.commentService.delete(id).subscribe(() => {
      this.comments.update((list: Comment[]) => list.filter((c: Comment) => c.id !== id));
    });
  }

  canManage(): boolean {
    const user = this.auth.currentUser();
    const article = this.article();
    if (!user || !article) return false;
    return user.role === 'ADMIN' || article.author?.id === user.id;
  }

  deleteArticle(): void {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const article = this.article();
    if (!article) return;

    this.articleService.delete(article.id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error deleting article:', err);
        alert('Failed to delete article.');
      }
    });
  }
}
