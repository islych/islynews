import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login', standalone: true, imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-page login-page fixed inset-0 z-[60] overflow-y-auto bg-[#fffaf5] text-[#252120]">
      <header class="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <a routerLink="/" class="flex items-center gap-2" aria-label="Isly News home">
          <img src="/isly-news-logo.png" alt="" class="h-12 w-12 rounded-full object-cover mix-blend-multiply">
          <span class="font-serif text-2xl font-bold">Isly <i class="not-italic text-[#d87582]">News</i></span>
        </a>
        <a routerLink="/" class="flex items-center gap-2 text-sm font-semibold text-[#625a56] hover:text-[#a94758]">← <span>Back to home</span></a>
      </header>

      <div class="grid min-h-screen md:grid-cols-2">
        <section class="relative hidden min-h-screen overflow-hidden border-r border-[#eaded7] bg-[#f8efe9] md:block" aria-label="Isly News editorial collage">
          <div class="absolute left-[8%] top-[14%] h-[40%] w-[58%] rotate-[-4deg] overflow-hidden rounded-sm border-[8px] border-[#fffaf5] shadow-[0_18px_40px_rgba(87,61,54,.18)]">
            <img src="/auth-news-1.jpg" alt="Vintage newspaper illustration of roses" class="h-full w-full object-cover object-top">
          </div>
          <div class="absolute right-[7%] top-[30%] z-10 h-[37%] w-[48%] rotate-[3deg] overflow-hidden border-[8px] border-[#fffaf5] shadow-[0_18px_40px_rgba(87,61,54,.2)]">
            <img src="/auth-news-3.jpg" alt="Woman reading a newspaper" class="h-full w-full object-cover object-top">
          </div>
          <div class="absolute bottom-[6%] left-[7%] z-20 h-[36%] w-[48%] rotate-[-1deg] overflow-hidden rounded-sm border-[8px] border-[#fffaf5] shadow-[0_18px_40px_rgba(87,61,54,.2)]">
            <img src="/auth-news-2.jpg" alt="Soft painted flowers" class="h-full w-full object-cover">
          </div>
          <div class="absolute bottom-[8%] right-[8%] z-30 -rotate-3 rounded-sm bg-[#fffdf9] px-5 py-4 text-center shadow-lg">
            <p class="handwritten text-2xl leading-tight">Same girl...<br>more knowledge ♡</p>
          </div>
        </section>

        <section class="flex min-h-screen items-center justify-center px-6 pb-10 pt-28 md:px-12">
          <div class="w-full max-w-md">
            <div class="mb-10">
              <div class="auth-mobile-teaser mb-7 flex items-center gap-3 md:hidden">
                <img src="/auth-news-3.jpg" alt="" class="h-20 w-20 rounded-xl object-cover">
                <p class="handwritten text-2xl">Read, learn, grow ♡</p>
              </div>
              <div class="mb-8 hidden items-center gap-3 md:flex">
                <span class="text-3xl text-[#d87582]">▮</span>
                <span class="font-serif text-4xl font-bold">Isly <i class="not-italic text-[#d87582]">News</i></span>
              </div>
              <h1 class="mb-2 text-4xl font-bold">Welcome back</h1>
              <p class="text-[#776e69]">Glad to see you again ✦</p>
            </div>

            <form (ngSubmit)="submit()" class="space-y-5">
              <label class="relative block">
                <span class="sr-only">Email</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">✉</span>
                <input [(ngModel)]="email" name="email" type="email" required autocomplete="email" placeholder="Email"
                  class="h-16 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 text-base shadow-sm transition focus:border-[#d87582] focus:outline-none">
              </label>
              <label class="relative block">
                <span class="sr-only">Password</span><span class="absolute left-4 top-1/2 -translate-y-1/2 text-[#776e69]">♙</span>
                <input [(ngModel)]="password" name="password" type="password" required autocomplete="current-password" placeholder="Password"
                  class="h-16 w-full border border-[#dfd3cc] bg-[#fffdf9] pl-12 pr-4 text-base shadow-sm transition focus:border-[#d87582] focus:outline-none">
              </label>
              <div class="flex items-center justify-between text-sm">
                <label class="flex cursor-pointer items-center gap-2"><input type="checkbox" class="h-4 w-4 accent-[#d87582]"> Remember me</label>
                <span class="text-[#776e69]">Forgot password?</span>
              </div>
              @if(error()){<div role="alert" class="rounded-xl border border-[#d87582]/30 bg-[#fceeed] px-4 py-3 text-sm text-[#a94758]">{{error()}}</div>}
              <button type="submit" [disabled]="loading()" class="h-16 w-full rounded-xl bg-gradient-to-r from-[#e8aaa9] to-[#d75f75] font-bold text-white shadow-[0_10px_24px_rgba(169,71,88,.2)] transition hover:-translate-y-0.5 disabled:opacity-50">
                {{loading()?'Signing in...':'Sign In'}}
              </button>
            </form>
            <p class="mt-9 text-center text-sm text-[#776e69]">Don't have an account? <a routerLink="/auth/register" class="ml-1 font-bold text-[#a94758] underline underline-offset-4">Register</a></p>
            <div class="auth-mobile-note handwritten md:hidden">Same girl...<br>more knowledge ♡</div>
          </div>
        </section>
      </div>
    </main>`
})
export class LoginComponent {
  email=''; password=''; loading=signal(false); error=signal<string|null>(null);
  constructor(private auth:AuthService,private router:Router){}
  submit(){this.loading.set(true);this.error.set(null);this.auth.login({email:this.email,password:this.password}).subscribe({next:(user)=>this.router.navigate([user.role==='ADMIN'?'/admin':user.role==='JOURNALIST'?'/articles/my-articles':'/']),error:()=>{this.error.set('Invalid email or password.');this.loading.set(false)}})}
}
