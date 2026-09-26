import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArticleAnalysis, ExternalNewsService, NewsArticle } from '../../core/services/external-news.service';
import { AuthService } from '../../core/services/auth.service';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/models/article.model';
import { SavedArticleService } from '../../core/services/saved-article.service';

@Component({
  selector: 'app-external-news',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './external-news.component.html',
  styleUrls: ['./external-news.component.css']
})
export class ExternalNewsComponent implements OnInit {
  articles: NewsArticle[] = [];
  journalistArticles: Article[] = [];
  sourceFilter: 'all' | 'isly' | 'world' = 'all';
  loading = false;
  searchQuery = '';
  selectedCategory = 'general';
  selectedCountry = '';
  selectedContinent = '';
  selectedLanguage = 'en';
  currentPage = 1;
  pageSize = 50;
  totalResults = 0;
  savedArticles: Map<string, boolean> = new Map();
  savingArticles: Set<string> = new Set();
  savedJournalistArticles: Map<number, boolean> = new Map();
  savingJournalistArticles: Set<number> = new Set();
  analyses: Map<string, ArticleAnalysis> = new Map();
  analyzingArticles: Set<string> = new Set();
  analysisErrors: Map<string, string> = new Map();
  loginRequiredVisible = false;
  filtersOpen = false;

  categories = [
    { id: 'general', label: 'All' },
    { id: 'business', label: 'Business' },
    { id: 'technology', label: 'Tech' },
    { id: 'science', label: 'Science' },
    { id: 'health', label: 'Health' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Culture' }
  ];

  continents = [
    { id: 'africa', label: 'Africa', countries: 'ma,za,eg,ng' },
    { id: 'asia', label: 'Asia', countries: 'in,jp,cn,sg' },
    { id: 'europe', label: 'Europe', countries: 'fr,gb,de,it,nl' },
    { id: 'north-america', label: 'North America', countries: 'us,ca,mx' },
    { id: 'south-america', label: 'South America', countries: 'br,ar,co' },
    { id: 'oceania', label: 'Oceania', countries: 'au,nz' }
  ];

  countries = [
    { code: 'ma', label: 'Morocco' },
    { code: 'us', label: 'United States' },
    { code: 'ca', label: 'Canada' },
    { code: 'mx', label: 'Mexico' },
    { code: 'fr', label: 'France' },
    { code: 'gb', label: 'United Kingdom' },
    { code: 'de', label: 'Germany' },
    { code: 'it', label: 'Italy' },
    { code: 'nl', label: 'Netherlands' },
    { code: 'in', label: 'India' },
    { code: 'jp', label: 'Japan' },
    { code: 'cn', label: 'China' },
    { code: 'sg', label: 'Singapore' },
    { code: 'za', label: 'South Africa' },
    { code: 'eg', label: 'Egypt' },
    { code: 'ng', label: 'Nigeria' },
    { code: 'br', label: 'Brazil' },
    { code: 'ar', label: 'Argentina' },
    { code: 'co', label: 'Colombia' },
    { code: 'au', label: 'Australia' },
    { code: 'nz', label: 'New Zealand' }
  ];

  languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' }
  ];

  constructor(
    private newsService: ExternalNewsService,
    private authService: AuthService,
    private articleService: ArticleService,
    private savedArticleService: SavedArticleService
  ) {}

  ngOnInit(): void {
    this.loadJournalistArticles();
    this.loadTopHeadlines();
  }

  loadJournalistArticles(): void {
    this.articleService.getAll().subscribe({
      next: articles => {
        this.journalistArticles = articles;
        this.checkJournalistSavedStatus();
      },
      error: err => console.error('Error fetching Isly News articles', err)
    });
  }

  checkJournalistSavedStatus(): void {
    if (!this.authService.isLoggedIn()) {
      this.savedJournalistArticles.clear();
      return;
    }

    this.journalistArticles.forEach(article => {
      this.savedArticleService.checkIfSaved(article.id).subscribe({
        next: isSaved => this.savedJournalistArticles.set(article.id, isSaved),
        error: err => console.error('Error checking Isly article saved status', err)
      });
    });
  }

  toggleJournalistSave(article: Article, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.loginRequiredVisible = true;
      return;
    }

    this.savingJournalistArticles.add(article.id);
    this.savedArticleService.toggleSave(article.id).subscribe({
      next: response => {
        this.savedJournalistArticles.set(article.id, response.saved);
        this.savingJournalistArticles.delete(article.id);
      },
      error: err => {
        console.error('Error saving Isly article', err);
        this.savingJournalistArticles.delete(article.id);
        if (err.status === 401 || err.status === 403) {
          this.loginRequiredVisible = true;
        }
      }
    });
  }

  isJournalistArticleSaved(article: Article): boolean {
    return this.savedJournalistArticles.get(article.id) ?? false;
  }

  isJournalistArticleSaving(article: Article): boolean {
    return this.savingJournalistArticles.has(article.id);
  }

  selectSource(source: 'all' | 'isly' | 'world'): void {
    this.sourceFilter = source;
    if (source === 'isly') this.filtersOpen = false;
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  get activeFilterCount(): number {
    return [this.selectedContinent, this.selectedCountry, this.selectedLanguage !== 'en' ? this.selectedLanguage : '']
      .filter(Boolean).length;
  }

  readingTime(text: string | null | undefined): number {
    const words = (text ?? '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  rememberExternalArticle(article: NewsArticle): void {
    this.newsService.rememberArticle(article);
  }

  categoryLabel(categoryId = this.selectedCategory): string {
    return this.categories.find(category => category.id === categoryId)?.label ?? 'World';
  }

  journalistCategory(article: Article): string {
    const text = `${article.title} ${article.content}`.toLowerCase();
    if (/tech|digital|internet|software|intelligence artificielle|\bai\b/.test(text)) return 'Tech';
    if (/business|économie|finance|market|entreprise/.test(text)) return 'Business';
    if (/science|research|recherche|space|espace/.test(text)) return 'Science';
    if (/health|santé|médecin|medical/.test(text)) return 'Health';
    if (/sport|football|tennis|match/.test(text)) return 'Sports';
    if (/culture|cinéma|music|musique|art/.test(text)) return 'Culture';
    return 'Editorial';
  }

  get filteredJournalistArticles(): Article[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return this.journalistArticles;
    return this.journalistArticles.filter(article =>
      article.title.toLowerCase().includes(query)
      || article.content.toLowerCase().includes(query)
      || article.author.username.toLowerCase().includes(query));
  }

  get hasVisibleArticles(): boolean {
    const hasIsly = this.sourceFilter !== 'world' && this.filteredJournalistArticles.length > 0;
    const hasWorld = this.sourceFilter !== 'isly' && this.articles.length > 0;
    return hasIsly || hasWorld;
  }

  loadTopHeadlines(): void {
    this.loading = true;
    this.newsService.getTopHeadlines(this.countryFilter, this.selectedCategory, this.selectedLanguage, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.articles = response.articles.filter(a => a.title !== '[Removed]');
        this.newsService.rememberFeed(this.articles);
        this.totalResults = response.totalResults;
        this.checkSavedStatus();
        this.loading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Error fetching headlines', err);
        this.loading = false;
      }
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.searchQuery = '';
    this.currentPage = 1;
    this.loadTopHeadlines();
  }

  selectCountry(): void {
    this.selectedContinent = '';
    this.currentPage = 1;
    this.searchQuery = '';
    this.loadTopHeadlines();
  }

  selectContinent(): void {
    this.selectedCountry = '';
    this.currentPage = 1;
    this.searchQuery = '';
    this.loadTopHeadlines();
  }

  selectLanguage(): void {
    this.currentPage = 1;
    if (this.searchQuery.trim()) {
      this.search();
      return;
    }
    this.loadTopHeadlines();
  }

  get countryFilter(): string {
    if (this.selectedContinent) {
      return this.continents.find(continent => continent.id === this.selectedContinent)?.countries ?? '';
    }
    return this.selectedCountry;
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.currentPage = 1;
      this.loadTopHeadlines();
      return;
    }

    this.loading = true;
    this.selectedCategory = '';
    this.currentPage = 1;
    this.newsService.searchNews(this.searchQuery, this.selectedLanguage, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.articles = response.articles.filter(a => a.title !== '[Removed]');
        this.newsService.rememberFeed(this.articles);
        this.totalResults = response.totalResults;
        this.checkSavedStatus();
        this.loading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        console.error('Error searching news', err);
        this.loading = false;
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
    if (this.searchQuery) {
      this.loading = true;
      this.newsService.searchNews(this.searchQuery, this.selectedLanguage, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.articles = response.articles.filter(a => a.title !== '[Removed]');
          this.newsService.rememberFeed(this.articles);
          this.totalResults = response.totalResults;
          this.checkSavedStatus();
          this.loading = false;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => {
          console.error('Error searching news', err);
          this.loading = false;
        }
      });
    } else {
      this.loadTopHeadlines();
    }
  }

  checkSavedStatus(): void {
    if (!this.authService.isLoggedIn()) {
      this.savedArticles.clear();
      return;
    }
    this.articles.forEach(article => {
      this.newsService.checkIfSaved(article.url).subscribe({
        next: (isSaved) => {
          this.savedArticles.set(article.url, isSaved);
        },
        error: (err) => console.error('Error checking saved status', err)
      });
    });
  }



  toggleSave(article: NewsArticle, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.loginRequiredVisible = true;
      return;
    }
    
    this.savingArticles.add(article.url);
    this.newsService.toggleSaveImported(article).subscribe({
      next: (response) => {
        this.savedArticles.set(article.url, response.saved);
        this.savingArticles.delete(article.url);
      },
      error: (err) => {
        console.error('Error saving article', err);
        this.savingArticles.delete(article.url);
        if (err.status === 401 || err.status === 403) {
          this.loginRequiredVisible = true;
        }
      }
    });
  }

  get loginRequiredMessage(): string {
    if (this.selectedLanguage === 'ar') return 'يجب تسجيل الدخول لحفظ المقالات.';
    if (this.selectedLanguage === 'fr') return 'Vous devez vous connecter pour sauvegarder un article.';
    return 'You must sign in to save an article.';
  }

  get loginLabel(): string {
    if (this.selectedLanguage === 'ar') return 'تسجيل الدخول';
    if (this.selectedLanguage === 'fr') return 'Se connecter';
    return 'Sign in';
  }

  isSaved(article: NewsArticle): boolean {
    return this.savedArticles.get(article.url) ?? false;
  }

  isSaving(article: NewsArticle): boolean {
    return this.savingArticles.has(article.url);
  }

  analyzeArticle(article: NewsArticle, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.analyses.has(article.url)) {
      this.analyses.delete(article.url);
      return;
    }
    this.analyzingArticles.add(article.url);
    this.analysisErrors.delete(article.url);
    this.newsService.analyzeArticle(article, this.selectedLanguage).subscribe({
      next: analysis => {
        this.analyses.set(article.url, analysis);
        this.analyzingArticles.delete(article.url);
      },
      error: () => {
        this.analysisErrors.set(article.url, 'AI analysis is temporarily unavailable.');
        this.analyzingArticles.delete(article.url);
      }
    });
  }

  analysisFor(article: NewsArticle): ArticleAnalysis | undefined {
    return this.analyses.get(article.url);
  }

  isAnalyzing(article: NewsArticle): boolean {
    return this.analyzingArticles.has(article.url);
  }

  analysisError(article: NewsArticle): string | undefined {
    return this.analysisErrors.get(article.url);
  }

  get totalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize);
  }

  get isArabic(): boolean {
    return this.selectedLanguage === 'ar';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get canPublish(): boolean {
    return this.authService.hasRole('JOURNALIST');
  }
}
