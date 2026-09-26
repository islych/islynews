import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { UserService } from '../../core/services/user.service';
import { ArticleService } from '../../core/services/article.service';
import { AdminStats } from '../../core/models/admin.model';
import { User } from '../../core/models/user.model';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page min-h-screen pt-20 pb-16 px-4">
      <div class="max-w-7xl mx-auto">

        <!-- Header -->
        <div class="mb-10">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-1 h-4 rounded-full" style="background: #F43F5E"></span>
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Control Center</span>
          </div>
          <h1 class="text-3xl font-black text-white">Admin Dashboard</h1>
          <p class="admin-subtitle">Manage users, review articles, and keep Isly News safe.</p>
        </div>

        <!-- Stats -->
        @if (stats()) {
          <div class="admin-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            @for (stat of statCards(); track stat.label) {
              <div class="card-bg rounded-2xl p-5 border"
                   [style]="'border-color: ' + stat.color + '30'">
                <p class="text-xs text-zinc-500 uppercase tracking-widest mb-1">{{ stat.label }}</p>
                <p class="text-3xl font-black" [style]="'color: ' + stat.color">{{ stat.value }}</p>
              </div>
            }
          </div>
        }

        <div class="admin-sections grid md:grid-cols-2 gap-8">

          <!-- Users Management -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="w-1 h-4 rounded-full" style="background: #8B5CF6"></span>
                <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Users</h2>
              </div>
              <button (click)="showCreateUser = !showCreateUser"
                      class="text-xs px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 transition-all">
                + New Journalist
              </button>
            </div>

            @if (showCreateUser) {
              <div class="card-bg rounded-xl p-4 mb-4 border border-purple-500/20">
                <div class="space-y-3">
                  <input [(ngModel)]="newUser.username" placeholder="Username"
                         class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                  <input [(ngModel)]="newUser.email" placeholder="Email" type="email"
                         class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                  <input [(ngModel)]="newUser.password" placeholder="Password" type="password"
                         class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                  <button (click)="createJournalist()"
                          class="w-full py-2 rounded-lg text-sm font-medium text-white"
                          style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
                    Create Journalist
                  </button>
                </div>
              </div>
            }

            <!-- Search Bar -->
            <div class="mb-4">
              <input [(ngModel)]="userSearchQuery" placeholder="Search journalists..."
                     class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto">
              @if (usersLoading()) {
                <div class="text-center py-8 text-zinc-600 text-sm">Loading...</div>
              }
              @for (user of filteredUsers(); track user.id) {
                @if (editingUserId() === user.id) {
                  <!-- Edit Mode -->
                  <div class="card-bg rounded-xl p-4 border border-purple-500/20">
                    <div class="space-y-3">
                      <input [(ngModel)]="editingUser.username" placeholder="Username"
                             class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                      <input [(ngModel)]="editingUser.email" placeholder="Email" type="email"
                             class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                      <input [(ngModel)]="editingUser.password" placeholder="Password (leave empty to keep current)" type="password"
                             class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500">
                      <div class="flex gap-2">
                        <button (click)="saveUserEdit(user.id)"
                                class="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                                style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
                          Save
                        </button>
                        <button (click)="editingUserId.set(null)"
                                class="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- View Mode -->
                  <div class="card-bg rounded-xl px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                           style="background: linear-gradient(135deg, #8B5CF6, #06B6D4);">
                        {{ user.username?.charAt(0)?.toUpperCase() }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-white">{{ user.username }}</p>
                        <p class="text-xs text-zinc-500">{{ user.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-0.5 rounded-full"
                            [class]="roleBadge(user.role)">{{ user.role }}</span>
                      @if (user.role !== 'ADMIN') {
                        <button (click)="startEditUser(user)"
                                class="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button (click)="deleteUser(user.id)"
                                class="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </section>

          <!-- Articles Management -->
          <section>
            <div class="flex items-center gap-2 mb-4">
              <span class="w-1 h-4 rounded-full" style="background: #06B6D4"></span>
              <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-widest">Articles</h2>
            </div>

            @if (reviewQueue().length > 0) {
              <div class="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                <div class="mb-3 flex items-center justify-between">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-amber-300">Awaiting editorial review</h3>
                  <span class="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">{{ reviewQueue().length }}</span>
                </div>
                <div class="space-y-3">
                  @for (article of reviewQueue(); track article.id) {
                    <div class="overflow-hidden rounded-xl border border-amber-500/20 bg-white shadow-sm">
                      @if (article.imageUrl) {
                        <img [src]="article.imageUrl" [alt]="article.title" class="h-32 w-full object-cover">
                      }
                      <div class="p-4">
                        <div class="mb-2 flex items-center gap-2 text-xs text-zinc-500">
                          <span class="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-700">To review</span>
                          <span>{{ article.author.username }}</span>
                          <span>·</span>
                          <span>{{ article.createdAt | date:'mediumDate' }}</span>
                        </div>
                        <p class="text-base font-bold text-zinc-900">{{ article.title }}</p>
                        <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600">{{ article.content }}</p>
                        <button (click)="openReview(article)"
                          class="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800">
                          Consult article before deciding →
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Search Bar -->
            <div class="mb-4">
              <input [(ngModel)]="articleSearchQuery" placeholder="Search articles..."
                     class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500">
            </div>

            <div class="space-y-2 max-h-[480px] overflow-y-auto">
              @if (articlesLoading()) {
                <div class="text-center py-8 text-zinc-600 text-sm">Loading...</div>
              }
              @for (article of filteredArticles(); track article.id) {
                @if (editingArticleId() === article.id) {
                  <!-- Edit Mode -->
                  <div class="card-bg rounded-xl p-4 border border-cyan-500/20">
                    <div class="space-y-3">
                      <input [(ngModel)]="editingArticle.title" placeholder="Title"
                             class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500">
                      <textarea [(ngModel)]="editingArticle.content" placeholder="Content" rows="4"
                                class="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"></textarea>
                      <div class="flex gap-2">
                        <button (click)="saveArticleEdit(article.id)"
                                class="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                                style="background: linear-gradient(135deg, #06B6D4, #0891B2);">
                          Save
                        </button>
                        <button (click)="editingArticleId.set(null)"
                                class="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- View Mode -->
                  <div class="card-bg rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-white truncate">{{ article.title }}</p>
                      <p class="text-xs text-zinc-500">{{ article.author?.username }} · {{ article.createdAt | date:'MMM d' }}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="text-xs px-2 py-0.5 rounded-full"
                            [class]="articleStatusClass(article.status)">
                        {{ article.status }}
                      </span>
                      <button (click)="openReview(article)"
                              class="rounded-lg px-2 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">
                        View
                      </button>
                      <button (click)="startEditArticle(article)"
                              class="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button (click)="deleteArticle(article.id)"
                              class="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>
          </section>
        </div>
      </div>

      @if (reviewingArticle(); as article) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm"
             (click)="closeReview()">
          <article class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[#fffaf6] shadow-2xl"
                   (click)="$event.stopPropagation()">
            @if (article.imageUrl) {
              <img [src]="article.imageUrl" [alt]="article.title" class="h-64 w-full object-cover sm:h-80">
            }
            <div class="p-6 sm:p-9">
              <div class="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Editorial review</p>
                  <h2 class="font-serif text-3xl font-black leading-tight text-zinc-950">{{ article.title }}</h2>
                  <p class="mt-3 text-sm text-zinc-500">By {{ article.author.username }} · {{ article.createdAt | date:'medium' }}</p>
                </div>
                <button (click)="closeReview()" aria-label="Close article preview"
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-600 hover:bg-zinc-200">×</button>
              </div>

              <div class="whitespace-pre-line border-y border-zinc-200 py-6 text-base leading-8 text-zinc-700">
                {{ article.content }}
              </div>

              @if (article.status !== 'PENDING_REVIEW') {
                <div class="mt-6 flex justify-end">
                  <button (click)="closeReview()" class="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white">Close preview</button>
                </div>
              } @else if (showRejectionForm()) {
                <div class="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                  <label class="mb-2 block text-sm font-bold text-red-800">What should the journalist correct?</label>
                  <textarea [(ngModel)]="rejectionReason" rows="3" placeholder="Give a clear and constructive reason..."
                            class="w-full rounded-lg border border-red-200 bg-white p-3 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-300"></textarea>
                  <div class="mt-3 flex justify-end gap-2">
                    <button (click)="showRejectionForm.set(false)" class="rounded-lg px-4 py-2 text-sm text-zinc-600">Cancel</button>
                    <button (click)="confirmRejection(article)" [disabled]="!rejectionReason.trim()"
                            class="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Confirm rejection</button>
                  </div>
                </div>
              } @else {
                <div class="mt-6 grid gap-3 sm:grid-cols-2">
                  <button (click)="showRejectionForm.set(true)"
                          class="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-100">
                    Reject with feedback
                  </button>
                  <button (click)="approveArticle(article)"
                          class="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                    Approve & publish
                  </button>
                </div>
              }
            </div>
          </article>
        </div>
      }
    </div>
  `,
})
export class AdminComponent implements OnInit {
  stats = signal<AdminStats | null>(null);
  users = signal<User[]>([]);
  articles = signal<Article[]>([]);
  reviewQueue = signal<Article[]>([]);
  usersLoading = signal(true);
  articlesLoading = signal(true);
  showCreateUser = false;
  newUser = { username: '', email: '', password: '' };
  userSearchQuery = signal('');
  articleSearchQuery = signal('');
  editingUserId = signal<number | null>(null);
  editingArticleId = signal<number | null>(null);
  reviewingArticle = signal<Article | null>(null);
  showRejectionForm = signal(false);
  rejectionReason = '';
  editingUser = { username: '', email: '', password: '' };
  editingArticle = { title: '', content: '' };

  filteredUsers = computed(() => {
    const query = this.userSearchQuery().toLowerCase();
    return this.users().filter(u =>
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  });

  filteredArticles = computed(() => {
    const query = this.articleSearchQuery().toLowerCase();
    return this.articles().filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.author?.username.toLowerCase().includes(query)
    );
  });

  constructor(
    private adminService: AdminService,
    private userService: UserService,
    private articleService: ArticleService,
  ) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe(s => this.stats.set(s));
    this.userService.getAll().subscribe({ next: u => { this.users.set(u); this.usersLoading.set(false); }, error: () => this.usersLoading.set(false) });
    this.articleService.getAdminArticles().subscribe({ next: a => { this.articles.set(a); this.articlesLoading.set(false); }, error: () => this.articlesLoading.set(false) });
    this.articleService.getReviewQueue().subscribe({ next: queue => this.reviewQueue.set(queue) });
  }

  statCards() {
    const s = this.stats()!;
    return [
      { label: 'Users', value: s.totalUsers, color: '#8B5CF6' },
      { label: 'Articles', value: s.totalArticles, color: '#06B6D4' },
      { label: 'Comments', value: s.totalComments, color: '#F59E0B' },
      { label: 'Likes', value: s.totalLikes, color: '#F43F5E' },
    ];
  }

  roleBadge(role: string): string {
    if (role === 'ADMIN') return 'bg-red-500/20 text-red-400';
    if (role === 'JOURNALIST') return 'bg-cyan-500/20 text-cyan-400';
    return 'bg-purple-500/20 text-purple-400';
  }

  articleStatusClass(status: Article['status']): string {
    if (status === 'PUBLISHED' || status === 'ACTIVE') return 'bg-green-500/20 text-green-400';
    if (status === 'PENDING_REVIEW') return 'bg-amber-500/20 text-amber-300';
    if (status === 'REJECTED') return 'bg-red-500/20 text-red-300';
    return 'bg-zinc-700 text-zinc-400';
  }

  approveArticle(article: Article): void {
    this.articleService.approve(article.id).subscribe(updated => {
      this.reviewQueue.update(list => list.filter(item => item.id !== article.id));
      this.articles.update(list => list.map(item => item.id === updated.id ? updated : item));
      this.closeReview();
    });
  }

  openReview(article: Article): void {
    this.reviewingArticle.set(article);
    this.showRejectionForm.set(false);
    this.rejectionReason = '';
  }

  closeReview(): void {
    this.reviewingArticle.set(null);
    this.showRejectionForm.set(false);
    this.rejectionReason = '';
  }

  confirmRejection(article: Article): void {
    const reason = this.rejectionReason.trim();
    if (!reason) return;
    this.articleService.reject(article.id, reason).subscribe(updated => {
      this.reviewQueue.update(list => list.filter(item => item.id !== article.id));
      this.articles.update(list => list.map(item => item.id === updated.id ? updated : item));
      this.closeReview();
    });
  }

  createJournalist(): void {
    this.userService.createJournalist(this.newUser).subscribe(u => {
      this.users.update(list => [...list, u]);
      this.newUser = { username: '', email: '', password: '' };
      this.showCreateUser = false;
    });
  }

  deleteUser(id: number): void {
    this.userService.delete(id).subscribe(() => {
      this.users.update(list => list.filter(u => u.id !== id));
    });
  }

  deleteArticle(id: number): void {
    this.articleService.delete(id).subscribe(() => {
      this.articles.update(list => list.filter(a => a.id !== id));
    });
  }

  startEditUser(user: User): void {
    this.editingUserId.set(user.id);
    this.editingUser = { username: user.username, email: user.email, password: '' };
  }

  saveUserEdit(id: number): void {
    const user = this.users().find(u => u.id === id);
    if (user) {
      const updatedUser = { ...user, ...this.editingUser };
      this.userService.update(id, updatedUser).subscribe(u => {
        this.users.update(list => list.map(usr => usr.id === id ? u : usr));
        this.editingUserId.set(null);
      });
    }
  }

  startEditArticle(article: Article): void {
    this.editingArticleId.set(article.id);
    this.editingArticle = { title: article.title, content: article.content };
  }

  saveArticleEdit(id: number): void {
    const article = this.articles().find(a => a.id === id);
    if (article) {
      const updatedArticle = { ...article, ...this.editingArticle };
      this.articleService.update(id, updatedArticle).subscribe(a => {
        this.articles.update(list => list.map(art => art.id === id ? a : art));
        this.editingArticleId.set(null);
      });
    }
  }
}
