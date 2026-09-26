import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector:'app-register', standalone:true, imports:[FormsModule,RouterLink],
  template:`
  <main class="auth-page register-page fixed inset-0 z-[60] overflow-y-auto bg-[#fffaf5] text-[#252120]">
    <header class="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 md:px-12">
      <a routerLink="/" class="flex items-center gap-2" aria-label="Isly News home">
        <img src="/isly-news-logo.png" alt="" class="h-12 w-12 rounded-full object-cover mix-blend-multiply">
        <span class="font-serif text-2xl font-bold">Isly <i class="not-italic text-[#d87582]">News</i></span>
      </a>
      <a routerLink="/" class="flex items-center gap-2 text-sm font-semibold text-[#625a56] hover:text-[#a94758]">← <span>Back to home</span></a>
    </header>

    <div class="grid min-h-screen md:grid-cols-2">
      <section class="relative hidden min-h-screen overflow-hidden border-r border-[#eaded7] bg-[#f8efe9] md:block" aria-label="Isly News inspiration collage">
        <div class="absolute left-[7%] top-[13%] h-[44%] w-[56%] -rotate-3 overflow-hidden border-[8px] border-[#fffaf5] shadow-[0_18px_40px_rgba(87,61,54,.2)]">
          <img src="/register-news-2.png" alt="Vintage flowers over handwritten letters" class="h-full w-full object-cover">
        </div>
        <div class="absolute right-[7%] top-[23%] z-10 h-[34%] w-[46%] rotate-3 overflow-hidden border-[8px] border-[#fffaf5] shadow-[0_18px_40px_rgba(87,61,54,.2)]">
          <img src="/register-news-1.png" alt="Newspaper on a table" class="h-full w-full object-cover">
        </div>
        <div class="absolute bottom-[7%] left-[9%] z-20 h-[34%] w-[48%] rotate-2 overflow-hidden border-[8px] border-[#fffaf5] bg-white shadow-[0_18px_40px_rgba(87,61,54,.2)]">
          <img src="/register-news-3.png" alt="We're not gossiping, we're networking illustration" class="h-full w-full object-cover object-top">
        </div>
        <div class="absolute bottom-[10%] right-[7%] z-30 -rotate-2 rounded-sm bg-[#fffdf9] px-6 py-5 shadow-lg">
          <p class="handwritten text-3xl leading-tight">A curious mind<br>is a beautiful mind ♡</p>
        </div>
      </section>

      <section class="flex min-h-screen items-center justify-center px-6 pb-10 pt-28 md:px-12">
        <div class="w-full max-w-md">
          <div class="mb-8">
            <div class="auth-mobile-teaser mb-7 flex items-center gap-3 md:hidden">
              <img src="/register-news-2.png" alt="" class="h-20 w-20 rounded-xl object-cover">
              <p class="handwritten text-2xl">A beautiful, curious mind ♡</p>
            </div>
            <div class="mb-5 flex items-center gap-3">
              <span class="grid h-9 w-9 place-items-center rounded-full bg-[#f7dedd] font-bold text-[#a94758]">✿</span>
              <h1 class="text-4xl font-bold">Create your account</h1>
            </div>
            <p class="text-[#776e69]">Join a community that cares about real stories.</p>
          </div>

          <form (ngSubmit)="submit()" class="space-y-4">
            <label class="relative block"><span class="sr-only">Username</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">♙</span><input [(ngModel)]="username" name="username" required autocomplete="username" placeholder="Username" class="h-14 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 shadow-sm focus:border-[#d87582] focus:outline-none"></label>
            <label class="relative block"><span class="sr-only">Email</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">✉</span><input [(ngModel)]="email" name="email" type="email" required autocomplete="email" placeholder="Email" class="h-14 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 shadow-sm focus:border-[#d87582] focus:outline-none"></label>
            <label class="relative block"><span class="sr-only">Password</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">♙</span><input [(ngModel)]="password" name="password" type="password" required autocomplete="new-password" placeholder="Password" class="h-14 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 shadow-sm focus:border-[#d87582] focus:outline-none"></label>
            <label class="relative block"><span class="sr-only">Confirm password</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">♙</span><input [(ngModel)]="confirmPassword" name="confirmPassword" type="password" required autocomplete="new-password" placeholder="Confirm Password" [class.border-red-400]="confirmPassword&&password!==confirmPassword" [class.border-green-500]="confirmPassword&&password===confirmPassword" class="h-14 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 shadow-sm focus:border-[#d87582] focus:outline-none"></label>
            @if(confirmPassword&&password!==confirmPassword){<p class="text-xs text-[#a94758]">Passwords do not match</p>}
            @if(error()){<div role="alert" class="rounded-xl border border-[#d87582]/30 bg-[#fceeed] px-4 py-3 text-sm text-[#a94758]">{{error()}}</div>}
            @if(success()){<div role="status" class="rounded-xl border border-green-500/30 bg-green-50 px-4 py-3 text-sm text-green-700">Account created! Redirecting to login...</div>}
            <button type="submit" [disabled]="loading()||success()" class="mt-3 h-14 w-full rounded-xl bg-gradient-to-r from-[#e8aaa9] to-[#d75f75] font-bold text-white shadow-[0_10px_24px_rgba(169,71,88,.2)] transition hover:-translate-y-0.5 disabled:opacity-50">{{loading()?'Creating...':'Create Account'}}</button>
          </form>
          <p class="mt-8 text-center text-sm text-[#776e69]">Already have an account? <a routerLink="/auth/login" class="ml-1 font-bold text-[#a94758] underline underline-offset-4">Sign In</a></p>
          <div class="auth-mobile-note handwritten md:hidden">A curious mind<br>is a beautiful mind ♡</div>
        </div>
      </section>
    </div>
  </main>`
})
export class RegisterComponent{
  username='';email='';password='';confirmPassword='';loading=signal(false);error=signal<string|null>(null);success=signal(false);
  constructor(private auth:AuthService,private router:Router){}
  submit(){if(this.password!==this.confirmPassword){this.error.set('Passwords do not match.');return}if(this.password.length<6){this.error.set('Password must be at least 6 characters.');return}this.loading.set(true);this.error.set(null);this.auth.startRegistration({username:this.username,email:this.email,password:this.password}).subscribe({next:(response)=>{sessionStorage.setItem('pending_registration_email',this.email);sessionStorage.setItem('pending_registration_masked_email',response.maskedEmail);this.router.navigate(['/auth/verify-email'])},error:(err)=>{this.error.set(err.error?.detail??err.error?.message??'Registration failed. Email verification may not be configured yet.');this.loading.set(false)}})}
}
