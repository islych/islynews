export interface AppNotification {
  id: number;
  type: 'ARTICLE_SUBMITTED' | 'ARTICLE_APPROVED' | 'ARTICLE_REJECTED';
  message: string;
  articleId: number;
  readFlag: boolean;
  createdAt: string;
}
