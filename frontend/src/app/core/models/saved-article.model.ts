import { User } from './user.model';
import { Article } from './article.model';

export interface SavedArticle {
  id: number;
  user: User;
  article: Article;
}

export interface CreateSavedArticleRequest {
  user: { id: number };
  article: { id: number };
}
