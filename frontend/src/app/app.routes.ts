import { Routes } from '@angular/router';
import { adminWorkspaceGuard, authGuard, readerPagesGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'external-news',
    pathMatch: 'full',
  },
  {
    path: 'articles/create',
    loadComponent: () => import('./features/articles/create-article/create-article').then(m => m.CreateArticleComponent),
    canActivate: [roleGuard(['JOURNALIST'])],
  },
  {
    path: 'articles/my-articles',
    loadComponent: () => import('./features/articles/my-articles/my-articles').then(m => m.MyArticlesComponent),
    canActivate: [roleGuard(['JOURNALIST'])],
  },
  {
    path: 'articles/:id',
    loadComponent: () => import('./features/articles/article-detail/unified-article-detail').then(m => m.UnifiedArticleDetailComponent),
    canActivate: [adminWorkspaceGuard],
  },
  {
    path: 'articles/:id/edit',
    loadComponent: () => import('./features/articles/edit-article/edit-article').then(m => m.EditArticleComponent),
    canActivate: [roleGuard(['JOURNALIST'])],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [readerPagesGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    canActivate: [readerPagesGuard],
  },
  {
    path: 'auth/verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email').then(m => m.VerifyEmailComponent),
    canActivate: [readerPagesGuard],
  },
  {
    path: 'saved',
    loadComponent: () => import('./features/saved/saved').then(m => m.SavedComponent),
    canActivate: [readerPagesGuard, authGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin').then(m => m.AdminComponent),
    canActivate: [roleGuard(['ADMIN'])],
  },
  {
    path: 'external-news',
    loadComponent: () => import('./features/external-news/external-news.component').then(m => m.ExternalNewsComponent),
    canActivate: [readerPagesGuard],
  },
  {
    path: 'external-news/detail',
    loadComponent: () => import('./features/external-news/external-news-detail.component').then(m => m.ExternalNewsDetailComponent),
    canActivate: [readerPagesGuard],
  },
  { path: '**', redirectTo: '' },
];
