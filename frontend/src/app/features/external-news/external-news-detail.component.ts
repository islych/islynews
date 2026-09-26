import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleAnalysis, ExternalNewsService, NewsArticle } from '../../core/services/external-news.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-external-news-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="min-h-screen bg-[#fffaf5] px-4 pb-24 pt-24 text-[#272220]">
      <article *ngIf="article() as story" class="mx-auto max-w-[1180px]">
        <a routerLink="/external-news" class="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#d8566d]">← &nbsp;Back to all news</a>
        <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div class="relative">
            <header class="mb-6">
              <div class="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#77706d]"><span class="text-[#cf5367]">{{ story.source.name }}</span><span>•</span><span>{{ story.publishedAt | date:'longDate' }}</span><span>•</span><span>{{ readingTime(extractedText() || story.content || story.description) }} min read</span></div>
              <h1 class="max-w-4xl font-serif text-4xl font-black leading-[1.05] md:text-6xl">{{ story.title }}</h1>
            </header>

            <div *ngIf="story.urlToImage" class="mb-5 h-72 overflow-hidden rounded-2xl bg-zinc-100 md:h-[31rem]"><img [src]="story.urlToImage" [alt]="story.title" class="h-full w-full object-cover"></div>

            <section class="rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm md:p-8">
              <div *ngIf="extracting()" class="mb-5 rounded-xl bg-[#fff4f1] px-4 py-3 text-sm text-[#776e69]">Reading the public article page…</div>
              <p class="whitespace-pre-wrap text-[17px] leading-8 text-[#4f4946]">{{ extractedText() || story.description || story.content }}</p>
              <div class="mt-7 flex gap-3 rounded-xl bg-[#fff2ef] p-4 text-sm text-[#756b67]"><span class="text-xl text-[#dc5c72]">ⓘ</span><span><ng-container *ngIf="extractedText(); else previewOnly">Development-only preview extracted from the public page of {{ story.source.name }}. The publisher remains the original source.</ng-container><ng-template #previewOnly>This publisher did not expose a readable full text, so this page shows the API preview.</ng-template></span></div>
              <div class="mt-6 flex flex-wrap gap-3"><a [href]="story.url" target="_blank" rel="noopener noreferrer" class="rounded-lg bg-[#df6578] px-5 py-3 text-sm font-bold text-white">Read the original article ↗</a><button *ngIf="auth.isLoggedIn()" (click)="toggleSave()" class="rounded-lg border border-[#df8794] px-5 py-3 text-sm font-semibold text-[#c84d61]">{{ saved() ? 'Saved' : 'Save' }}</button></div>
            </section>
          </div>

          <aside class="space-y-6 lg:pt-1">
            <section class="rounded-2xl border border-[#eadfd8] bg-white/70 p-5 shadow-sm">
              <div class="mb-5 flex items-center justify-between"><h2 class="font-serif text-2xl font-bold">Related articles</h2><span class="grid h-8 w-8 place-items-center rounded-full bg-[#fff0ee] text-[#df5d73]">→</span></div>
              <div *ngIf="related().length; else noRelated" class="space-y-5"><a *ngFor="let item of related()" [href]="item.url" target="_blank" class="grid grid-cols-[92px_1fr] gap-4"><img *ngIf="item.urlToImage" [src]="item.urlToImage" class="h-20 w-24 rounded-xl object-cover"><div><h3 class="line-clamp-3 font-serif text-[15px] font-bold leading-5">{{ item.title }}</h3><p class="mt-2 text-[10px] font-bold uppercase text-[#9b918c]">{{ item.publishedAt | date:'MMM d, y' }}</p></div></a></div>
              <ng-template #noRelated><p class="text-sm leading-6 text-[#8b817c]">No sufficiently similar article was found in the latest news feed.</p></ng-template>
            </section>

            <section class="rounded-2xl border border-[#eadfd8] bg-white/70 p-6 shadow-sm">
              <div class="mb-5 flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-[#fff0ee] text-[#df5d73]">☷</span><h2 class="font-serif text-2xl font-bold">Key points</h2></div>
              <ng-container *ngIf="analysis() as result; else analysisLoading"><ul class="space-y-4 text-sm leading-6 text-[#514a47]"><li *ngFor="let point of result.keyPoints" class="flex gap-4"><span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#df5d73]"></span><span>{{ point }}</span></li></ul></ng-container>
              <ng-template #analysisLoading><button *ngIf="auth.isLoggedIn()" (click)="analyze()" [disabled]="analyzing()" class="rounded-lg bg-[#272220] px-4 py-2.5 text-sm font-bold text-white">{{ analyzing() ? 'Analyzing…' : 'Analyze with AI' }}</button><p *ngIf="!auth.isLoggedIn()" class="text-sm text-[#8b817c]">Sign in to generate the key points.</p></ng-template>
            </section>

            <section class="rounded-2xl border border-[#eadfd8] bg-white/70 p-6 shadow-sm"><div class="mb-5 flex items-center gap-3"><span class="text-xl text-[#df5d73]">◆</span><h2 class="font-serif text-2xl font-bold">Tags</h2></div><div *ngIf="analysis() as result" class="flex flex-wrap gap-2"><span *ngFor="let tag of result.tags" class="rounded-xl bg-[#fff0ee] px-3 py-2 text-xs font-medium text-[#a94354]">{{ tag }}</span></div><p *ngIf="!analysis()" class="text-sm text-[#8b817c]">Tags will appear after the AI analysis.</p></section>
          </aside>
        </div>
      </article>
    </main>
  `,
})
export class ExternalNewsDetailComponent implements OnInit {
  article = signal<NewsArticle | null>(null);
  saved = signal(false);
  saving = signal(false);
  analyzing = signal(false);
  analysis = signal<ArticleAnalysis | null>(null);
  analysisError = signal('');
  extracting = signal(false);
  extractedText = signal('');
  related = signal<NewsArticle[]>([]);

  constructor(
    private newsService: ExternalNewsService,
    private router: Router,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const article = this.newsService.getRememberedArticle();
    if (!article) {
      this.router.navigate(['/external-news']);
      return;
    }
    this.article.set(article);
    this.loadRelated([]);
    this.loadExtractedText(article);
    if (this.auth.isLoggedIn()) {
      this.newsService.checkIfSaved(article.url).subscribe(value => this.saved.set(value));
    }
  }

  private loadExtractedText(article: NewsArticle): void {
    this.extracting.set(true);
    this.newsService.extractArticle(article.url).subscribe({
      next: result => {
        this.extractedText.set(result.text);
        this.extracting.set(false);
        if (this.auth.isLoggedIn()) this.analyze();
      },
      error: () => {
        this.extracting.set(false);
        if (this.auth.isLoggedIn()) this.analyze();
      },
    });
  }

  readingTime(text: string | null | undefined): number {
    const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  toggleSave(): void {
    const article = this.article();
    if (!article || !this.auth.isLoggedIn()) return;
    this.saving.set(true);
    this.newsService.toggleSaveImported(article, this.analysis()).subscribe({
      next: response => { this.saved.set(response.saved); this.saving.set(false); },
      error: () => this.saving.set(false),
    });
  }

  analyze(): void {
    const article = this.article();
    if (!article) return;
    this.analyzing.set(true);
    this.analysisError.set('');
    const articleForAnalysis = this.extractedText()
      ? { ...article, content: this.extractedText() }
      : article;
    this.newsService.analyzeArticle(articleForAnalysis, 'en').subscribe({
      next: result => {
        this.analysis.set(result);
        this.analyzing.set(false);
        this.loadRelated(result.tags);
      },
      error: () => { this.analysisError.set('AI analysis is temporarily unavailable.'); this.analyzing.set(false); },
    });
  }

  private loadRelated(tags: string[]): void {
    const current = this.article();
    if (!current) return;
    const feed = this.newsService.getRememberedFeed();
    if (feed.length < 50) {
      this.newsService.getTopHeadlines('', undefined, 'en', 1, 50).subscribe(response => {
        this.newsService.rememberFeed(response.articles);
        this.rankRelated(this.newsService.getRememberedFeed(), current, tags);
      });
      return;
    }
    this.rankRelated(feed, current, tags);
  }

  private rankRelated(feed: NewsArticle[], current: NewsArticle, tags: string[]): void {
    const targetTerms = new Set([...tags.flatMap(tag => this.words(tag)), ...this.words(`${current.title} ${current.description ?? ''}`)]);
    const ranked = feed.filter(item => item.url !== current.url).map(item => {
      const titleTerms = this.words(item.title);
      const bodyTerms = this.words(`${item.description ?? ''} ${item.content ?? ''}`);
      const titleMatches = titleTerms.filter(term => targetTerms.has(term)).length;
      const bodyMatches = bodyTerms.filter(term => targetTerms.has(term)).length;
      const sameSource = item.source?.name === current.source?.name ? 1 : 0;
      return { item, score: titleMatches * 3 + bodyMatches + sameSource };
    }).filter(entry => entry.score >= 3).sort((a, b) => b.score - a.score).slice(0, 4).map(entry => entry.item);
    this.related.set(ranked);
  }

  private words(text: string): string[] {
    const stop = new Set(['this','that','with','from','have','will','about','their','they','pour','dans','avec','cette','mais','plus','sont','être','une','des','les','the','and','for']);
    return (text ?? '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word.length >= 4 && !stop.has(word));
  }
}
