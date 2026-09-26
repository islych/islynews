import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SavedArticleService } from '../../core/services/saved-article.service';
import { ImportedArticleService, ImportedArticle } from '../../core/services/imported-article.service';
import { AuthService } from '../../core/services/auth.service';
import { SavedArticle } from '../../core/models/saved-article.model';
import { ArticleCardComponent } from '../../shared/article-card/article-card';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent],
  template: `
    <div class="saved-page min-h-screen pt-20 pb-16 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="saved-heading mb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="w-1 h-4 rounded-full" style="background: #06B6D4"></span>
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Library</span>
          </div>
          <h1 class="text-3xl font-black text-white">Saved Articles</h1>
          <p class="saved-subtitle">Your collection of stories that matter.</p>
        </div>

        <div class="saved-tabs">
          <span class="active">All ({{ saved().length + imported().length }})</span>
          <span>Isly News ({{ saved().length }})</span>
          <span>External ({{ imported().length }})</span>
        </div>

        @if (loading()) {
          <div class="saved-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3]; track i) {
              <div class="card-bg rounded-xl h-72 animate-pulse"></div>
            }
          </div>
        } @else if (saved().length === 0 && imported().length === 0) {
          <div class="text-center py-24">
            <div class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                 style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2)">
              <svg class="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
              </svg>
            </div>
            <p class="text-zinc-500 text-sm">No saved articles yet.</p>
            <a routerLink="/" class="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Browse the feed →
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Local Saved Articles -->
            @for (item of saved(); track item.id) {
              <div class="relative group">
                <app-article-card [article]="item.article" />
                <button (click)="removeSaved(item)"
                        class="absolute top-3 left-3 w-7 h-7 rounded-lg bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }

            <!-- Imported Articles -->
            @for (item of imported(); track item.id) {
              <div class="relative group card-bg rounded-2xl overflow-hidden flex flex-col border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                <!-- Article Image -->
                <div class="h-48 overflow-hidden relative bg-zinc-900">
                  <img *ngIf="item.imageUrl" [src]="item.imageUrl" [alt]="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80">
                  <div *ngIf="!item.imageUrl" class="w-full h-full flex items-center justify-center text-zinc-800"
                    style="background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(6,182,212,0.1))">
                    <span class="text-4xl">📰</span>
                  </div>
                  <div class="absolute top-4 left-4">
                    <span class="bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded font-bold uppercase tracking-widest border border-white/10">
                      {{ item.source }}
                    </span>
                  </div>
                </div>

                <!-- Article Info -->
                <div class="p-6 flex flex-col flex-1">
                  <div class="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    {{ item.publishedAt | date:'mediumDate' }}
                  </div>
                  <h3 class="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                    {{ item.title }}
                  </h3>
                  <p class="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {{ item.description }}
                  </p>
                  <div class="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                    <a [href]="item.url" target="_blank"
                      class="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                      READ FULL STORY
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                    <button (click)="removeImported(item)"
                      class="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 19V5z" />
                      </svg>
                      REMOVE
                    </button>
                  </div>
                </div>

                <!-- Delete Button -->
                <button (click)="removeImported(item)"
                        class="absolute top-3 right-3 w-7 h-7 rounded-lg bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-all opacity-0 group-hover:opacity-100">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class SavedComponent implements OnInit {
  saved = signal<SavedArticle[]>([]);
  imported = signal<ImportedArticle[]>([]);
  loading = signal(true);

  constructor(
    private savedService: SavedArticleService,
    private importedService: ImportedArticleService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (!user) return;
    
    this.savedService.getByUser(user.id).subscribe({
      next: (data) => this.saved.set(data),
      error: () => {},
    });

    this.importedService.getMyImported().subscribe({
      next: (data) => { this.imported.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  removeSaved(item: SavedArticle): void {
    this.savedService.remove(item.id).subscribe(() => {
      this.saved.update(list => list.filter(s => s.id !== item.id));
    });
  }

  removeImported(item: ImportedArticle): void {
    this.importedService.remove(item.id).subscribe(() => {
      this.imported.update(list => list.filter(i => i.id !== item.id));
    });
  }
}
