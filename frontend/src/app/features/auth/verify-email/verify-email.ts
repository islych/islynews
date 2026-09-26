import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-page verify-email-page fixed inset-0 z-[60] overflow-y-auto bg-[#fffaf5] text-[#252120]">
      <header class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <a routerLink="/" class="flex items-center gap-2" aria-label="Isly News home">
          <img src="/isly-news-logo.png" alt="" class="h-12 w-12 rounded-full object-cover mix-blend-multiply">
          <span class="font-serif text-2xl font-bold">Isly <i class="not-italic text-[#d87582]">News</i></span>
        </a>
        <a routerLink="/auth/register" class="text-sm font-semibold text-[#625a56]">← <span>Change email</span></a>
      </header>

      <section class="flex min-h-screen items-center justify-center px-6 py-28">
        <div class="w-full max-w-md text-center">
          <div class="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#f7dedd] text-3xl text-[#a94758]">✉</div>
          <h1 class="mb-3 text-4xl font-bold">Verify your email</h1>
          <p class="mb-8 text-sm leading-relaxed text-[#776e69]">
            We sent a 4-digit code to<br><strong class="text-[#252120]">{{ maskedEmail }}</strong>
          </p>

          <form (ngSubmit)="verify()" class="space-y-5">
            <input [(ngModel)]="code" name="code" inputmode="numeric" autocomplete="one-time-code"
              maxlength="4" pattern="[0-9]{4}" required aria-label="Four-digit verification code"
              placeholder="• • • •"
              class="verification-code h-20 w-full border border-[#dfd3cc] bg-[#fffdf9] text-center text-3xl tracking-[1.1rem] shadow-sm focus:border-[#d87582] focus:outline-none">
            @if (error()) { <div role="alert" class="rounded-xl border border-[#d87582]/30 bg-[#fceeed] px-4 py-3 text-sm text-[#a94758]">{{ error() }}</div> }
            <button type="submit" [disabled]="loading() || code.length !== 4"
              class="h-14 w-full rounded-xl bg-gradient-to-r from-[#e8aaa9] to-[#d75f75] font-bold text-white shadow-[0_10px_24px_rgba(169,71,88,.2)] disabled:opacity-50">
              {{ loading() ? 'Verifying...' : 'Verify Email' }}
            </button>
          </form>

          <button type="button" (click)="resend()" [disabled]="resendSeconds() > 0 || resending()"
            class="mt-6 text-sm font-semibold text-[#a94758] disabled:text-[#ad9f98]">
            {{ resending() ? 'Sending...' : (resendSeconds() > 0 ? 'Resend code in ' + resendSeconds() + 's' : 'Resend code') }}
          </button>
          <p class="mt-3 text-xs text-[#776e69]">The code expires after 10 minutes.</p>
        </div>
      </section>
    </main>
  `
})
export class VerifyEmailComponent implements OnDestroy {
  email = sessionStorage.getItem('pending_registration_email') ?? '';
  maskedEmail = sessionStorage.getItem('pending_registration_masked_email') ?? this.email;
  code = '';
  loading = signal(false);
  resending = signal(false);
  resendSeconds = signal(60);
  error = signal<string | null>(null);
  private timer = window.setInterval(() => this.resendSeconds.update(value => Math.max(0, value - 1)), 1000);

  constructor(private auth: AuthService, private router: Router) {
    if (!this.email) this.router.navigate(['/auth/register']);
  }

  verify(): void {
    if (!/^\d{4}$/.test(this.code)) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.verifyRegistration(this.email, this.code).subscribe({
      next: () => {
        sessionStorage.removeItem('pending_registration_email');
        sessionStorage.removeItem('pending_registration_masked_email');
        this.router.navigate(['/auth/login'], { queryParams: { verified: 'true' } });
      },
      error: err => {
        this.error.set(err.error?.detail ?? err.error?.message ?? 'Invalid or expired verification code.');
        this.loading.set(false);
      }
    });
  }

  resend(): void {
    if (!this.email || this.resendSeconds() > 0) return;
    this.resending.set(true);
    this.error.set(null);
    this.auth.resendRegistrationCode(this.email).subscribe({
      next: response => {
        this.maskedEmail = response.maskedEmail;
        this.resendSeconds.set(60);
        this.resending.set(false);
      },
      error: err => {
        this.error.set(err.error?.detail ?? err.error?.message ?? 'Could not resend the code.');
        this.resending.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    window.clearInterval(this.timer);
  }
}
