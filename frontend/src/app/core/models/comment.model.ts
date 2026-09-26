import { User } from './user.model';

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
  article: { id: number };
}

export interface CreateCommentRequest {
  content: string;
  user: { id: number };
  article: { id: number };
}
