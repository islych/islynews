import { User } from './user.model';

export interface Like {
  id: number;
  user: User;
  article: { id: number };
}

export interface CreateLikeRequest {
  user: { id: number };
  article: { id: number };
}
