import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.model';
import { Subscription, interval, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="site-navbar fixed top-0 left-0 right-0 z-50 border-b" style="background:rgba(255,250,245,.94);border-color:#eaded7;backdrop-filter:blur(16px)">
      <div class="site-navbar-inner max-w-7xl mx-auto px-5 h-18 flex items-center justify-between">

        <!-- Logo -->
        <a [routerLink]="workspaceRoute()" class="flex items-center gap-2 group" aria-label="Isly News home">
          <img src="/isly-news-logo.png" alt="" class="w-12 h-12 rounded-full object-cover mix-blend-multiply" />
          <span class="font-serif font-bold text-2xl tracking-tight hidden sm:inline" style="color:#252120">Isly <i style="color:#d87582;font-style:normal">News</i></span>
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-6">
          @if (auth.hasRole('ADMIN')) {
            <a routerLink="/admin" routerLinkActive="text-purple-400"
               class="relative text-sm text-zinc-400 hover:text-white transition-colors">
              Application Management
              @if (unreadCount() > 0) { <span class="absolute -right-5 -top-2 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{{ badgeCount() }}</span> }
            </a>
          } @else if (auth.hasRole('JOURNALIST')) {
            <a routerLink="/articles/my-articles" routerLinkActive="text-purple-400"
               class="relative text-sm text-zinc-400 hover:text-white transition-colors">
              My Articles
              @if (unreadCount() > 0) { <span class="absolute -right-5 -top-2 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">{{ badgeCount() }}</span> }
            </a>
            <a routerLink="/articles/create" routerLinkActive="text-purple-400"
               class="text-sm text-zinc-400 hover:text-white transition-colors">New Article</a>
          } @else {
            <a routerLink="/external-news" routerLinkActive="text-purple-400"
               class="text-sm text-zinc-400 hover:text-white transition-colors">News</a>
            @if (auth.isLoggedIn()) {
              <a routerLink="/saved" routerLinkActive="text-purple-400"
                 class="text-sm text-zinc-400 hover:text-white transition-colors">Saved</a>
            }
          }
        </div>

        <!-- Auth -->
        <div class="flex items-center gap-3">
          @if (auth.isLoggedIn()) {
            <div class="flex items-center gap-3">
              <div class="relative">
                <button (click)="toggleNotifications()" aria-label="Notifications"
                        class="relative flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-zinc-600 hover:bg-rose-50">
                  <svg class="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  @if (unreadCount() > 0) {
                    <span class="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-5 text-white">{{ badgeCount() }}</span>
                  }
                </button>
                @if (notificationsOpen()) {
                  <div class="absolute right-0 top-12 z-[70] w-80 overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl sm:w-96">
                    <div class="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                      <p class="font-serif text-lg font-bold text-zinc-900">Notifications</p>
                      <button (click)="notificationsOpen.set(false)" class="text-zinc-400">×</button>
                    </div>
                    <div class="max-h-96 overflow-y-auto">
                      @for (notification of notifications(); track notification.id) {
                        <a [routerLink]="notificationRoute(notification)" (click)="notificationsOpen.set(false)"
                           class="block border-b border-zinc-100 px-4 py-3 hover:bg-rose-50/60"
                           [class.bg-rose-50]="!notification.readFlag">
                          <p class="text-sm leading-5 text-zinc-800">{{ notification.message }}</p>
                          <p class="mt-1 text-xs text-zinc-400">{{ notification.createdAt | date:'short' }}</p>
                        </a>
                      } @empty {
                        <p class="px-4 py-8 text-center text-sm text-zinc-400">No notifications yet.</p>
                      }
                    </div>
                  </div>
                }
              </div>
              <div class="hidden sm:flex items-center gap-2">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                     style="background:#f7dedd;color:#752f40">
                  {{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() }}
                </div>
                <span class="text-xs text-zinc-400">{{ auth.currentUser()?.username }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="roleBadgeClass()">
                  {{ auth.role() }}
                </span>
              </div>
              <button (click)="auth.logout()"
                      class="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:border-red-500 hover:text-red-400 transition-all">
                Logout
              </button>
            </div>
          } @else {
            <a routerLink="/auth/login"
               class="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
              Login
            </a>
            <a routerLink="/auth/register"
               class="text-xs px-4 py-1.5 rounded-lg font-medium text-white transition-all glow-purple"
               style="background:#d87582">
              Register
            </a>
          }
        </div>
      </div>
    </nav>

    @if (auth.isLoggedIn() && auth.hasRole('JOURNALIST')) {
      <nav class="mobile-bottom-nav" aria-label="Journalist navigation">
        <a routerLink="/articles/my-articles" routerLinkActive="active">
          <svg viewBox="0 0 24 24"><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h4"/></svg>
          <span>My Articles</span>
        </a>
        <a routerLink="/articles/create" routerLinkActive="active">
          <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
          <span>New Article</span>
        </a>
      </nav>
    } @else if (auth.isLoggedIn() && !auth.hasRole('ADMIN')) {
      <nav class="mobile-bottom-nav" aria-label="Mobile navigation">
        <a routerLink="/external-news" routerLinkActive="active">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4.5 6 4.5 9S15 18 12 21M12 3c-3 3-4.5 6-4.5 9S9 18 12 21"/></svg>
          <span>News</span>
        </a>
        <a routerLink="/saved" routerLinkActive="active">
          <svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>
          <span>Saved</span>
        </a>
        <a [routerLink]="profileRoute()" routerLinkActive="active">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg>
          <span>{{ auth.hasRole('ADMIN') ? 'Admin' : (auth.hasRole('JOURNALIST') ? 'Articles' : 'Profile') }}</span>
        </a>
      </nav>
    }
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  unreadCount = signal(0);
  notifications = signal<AppNotification[]>([]);
  notificationsOpen = signal(false);
  private polling?: Subscription;

  constructor(public auth: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.polling = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.auth.isLoggedIn()
        ? this.notificationService.getUnreadCount()
        : of({ count: 0 }))
    ).subscribe(({ count }) => this.unreadCount.set(count));
  }

  ngOnDestroy(): void {
    this.polling?.unsubscribe();
  }

  badgeCount(): string {
    return this.unreadCount() > 9 ? '9+' : String(this.unreadCount());
  }

  toggleNotifications(): void {
    const willOpen = !this.notificationsOpen();
    this.notificationsOpen.set(willOpen);
    if (!willOpen) return;
    this.notificationService.getMine().subscribe(items => {
      this.notifications.set(items);
      if (this.unreadCount() > 0) {
        this.notificationService.markAllRead().subscribe(() => {
          this.unreadCount.set(0);
          this.notifications.update(list => list.map(item => ({ ...item, readFlag: true })));
        });
      }
    });
  }

  notificationRoute(notification: AppNotification): string[] {
    return this.auth.hasRole('ADMIN') ? ['/admin'] : ['/articles', String(notification.articleId)];
  }

  roleBadgeClass(): string {
    const role = this.auth.role();
    if (role === 'ADMIN') return 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (role === 'JOURNALIST') return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  }

  profileRoute(): string {
    if (this.auth.hasRole('ADMIN')) return '/admin';
    if (this.auth.hasRole('JOURNALIST')) return '/articles/my-articles';
    return '/saved';
  }

  workspaceRoute(): string {
    if (this.auth.hasRole('ADMIN')) return '/admin';
    if (this.auth.hasRole('JOURNALIST')) return '/articles/my-articles';
    return '/external-news';
  }
}
