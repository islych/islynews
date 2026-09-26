import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  source: {
    id: string;
    name: string;
  };
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface ArticleAnalysis {
  summary: string;
  keyPoints: string[];
  category: string;
  entities: string[];
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  language: string;
  model: string;
  processingTimeMs: number;
  analyzedAt: string;
  sourceUrl: string;
}

export interface ExtractedArticle {
  text: string;
  wordCount: number;
  sourceUrl: string;
}

export interface SavedExternalArticle {
  id: number;
  title: string;
  imageUrl: string;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
  keyPoints: string[];
}

@Injectable({ providedIn: 'root' })
export class ExternalNewsService {
  private readonly API = `${API_BASE_URL}/api/external-news`;
  private readonly IMPORTED_API = `${API_BASE_URL}/imported-articles`;
  private readonly SELECTED_ARTICLE_KEY = 'isly_selected_external_article';
  private readonly NEWS_FEED_KEY = 'isly_external_news_feed';

  constructor(private http: HttpClient) {}

  rememberArticle(article: NewsArticle): void {
    sessionStorage.setItem(this.SELECTED_ARTICLE_KEY, JSON.stringify(article));
  }

  rememberFeed(articles: NewsArticle[]): void {
    const merged = [...articles, ...this.getRememberedFeed()]
      .filter((article, index, all) => article.url && all.findIndex(item => item.url === article.url) === index)
      .slice(0, 200);
    sessionStorage.setItem(this.NEWS_FEED_KEY, JSON.stringify(merged));
  }

  getRememberedFeed(): NewsArticle[] {
    try { return JSON.parse(sessionStorage.getItem(this.NEWS_FEED_KEY) ?? '[]') as NewsArticle[]; }
    catch { return []; }
  }

  getRememberedArticle(): NewsArticle | null {
    const raw = sessionStorage.getItem(this.SELECTED_ARTICLE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as NewsArticle;
    } catch {
      return null;
    }
  }

  getTopHeadlines(country: string = 'us', category?: string, language: string = 'en', page: number = 1, pageSize: number = 50): Observable<NewsApiResponse> {
    let params = new HttpParams()
      .set('country', country)
      .set('language', language)
      .set('page', page)
      .set('pageSize', pageSize);
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<NewsApiResponse>(`${this.API}/top-headlines`, { params });
  }

  searchNews(query: string, language: string = 'en', page: number = 1, pageSize: number = 50): Observable<NewsApiResponse> {
    const params = new HttpParams()
      .set('q', query)
      .set('language', language)
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<NewsApiResponse>(`${this.API}/search`, { params });
  }

  extractArticle(url: string): Observable<ExtractedArticle> {
    return this.http.get<ExtractedArticle>(`${this.API}/extract`, {
      params: new HttpParams().set('url', url)
    });
  }

  analyzeArticle(article: NewsArticle, language: string): Observable<ArticleAnalysis> {
    return this.http.post<ArticleAnalysis>(`${API_BASE_URL}/api/ai/analyze`, {
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      source: article.source?.name,
      language
    });
  }

  saveImportedArticle(article: NewsArticle, analysis?: ArticleAnalysis | null): Observable<any> {
    const importedArticle = {
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.urlToImage,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      tags: analysis?.tags ?? [],
      keyPoints: analysis?.keyPoints ?? []
    };
    return this.http.post(`${this.IMPORTED_API}`, importedArticle);
  }

  checkIfSaved(url: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.IMPORTED_API}/check?url=${encodeURIComponent(url)}`);
  }

  getSavedArticles(): Observable<SavedExternalArticle[]> {
    return this.http.get<SavedExternalArticle[]>(`${this.IMPORTED_API}/me`);
  }

  toggleSaveImported(article: NewsArticle, analysis?: ArticleAnalysis | null): Observable<any> {
    const importedArticle = {
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.urlToImage,
      source: article.source.name,
      url: article.url,
      publishedAt: article.publishedAt,
      tags: analysis?.tags ?? [],
      keyPoints: analysis?.keyPoints ?? []
    };
    return this.http.post(`${this.IMPORTED_API}/toggle?url=${encodeURIComponent(article.url)}`, importedArticle);
  }
}
