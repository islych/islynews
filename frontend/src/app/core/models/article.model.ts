import { User } from './user.model';
import { Comment } from './comment.model';

export type ArticleStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ACTIVE' | 'HIDDEN';

export interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  status: ArticleStatus;
  author: User;
  comments: Comment[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  imageUrl: string;
}
