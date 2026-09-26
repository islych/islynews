import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/models/article.model';
import { ArticleCardComponent } from '../../../shared/article-card/article-card';

@Component({
  selector: 'app-home', standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent],
  template: `
  <main class="min-h-screen pt-24 pb-20">
    <section class="max-w-7xl mx-auto px-5">
      @if (featured()) {
        <div class="grid lg:grid-cols-[160px_1fr] gap-7 mb-14 items-center">
          <aside class="hidden lg:block handwritten text-2xl leading-relaxed -rotate-2">
            News<br>Ideas<br>People<br>A better<br>Tomorrow ♡
          </aside>
          <a [routerLink]="['/articles',featured()!.id]" class="group grid md:grid-cols-[1.35fr_1fr] paper-card overflow-hidden min-h-[390px]">
            <div class="relative min-h-72 overflow-hidden">
              @if(featured()!.imageUrl){<img [src]="featured()!.imageUrl" [alt]="featured()!.title" class="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition duration-700">}
              @else{<div class="absolute inset-0" style="background:#e9d9cf"></div>}
              <span class="absolute top-5 left-5 rounded-md bg-neutral-900 text-white px-3 py-2 text-[10px] font-bold tracking-widest">FEATURED ★</span>
              <span class="absolute bottom-4 left-5 handwritten text-white text-2xl drop-shadow">good news for a brighter you ♡</span>
            </div>
            <div class="p-7 md:p-10 flex flex-col justify-center bg-[#fffdf9]">
              <span class="text-[11px] font-bold uppercase tracking-widest text-[#a94758]">Editor's pick</span>
              <h1 class="text-3xl md:text-4xl font-bold leading-[1.08] mt-3 mb-4">{{featured()!.title}}</h1>
              <p class="text-[#776e69] leading-relaxed line-clamp-3 mb-7">{{featured()!.content}}</p>
              <div class="mt-auto flex flex-wrap items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-[#f7dedd] text-[#752f40] grid place-items-center font-bold">{{featured()!.author?.username?.charAt(0)?.toUpperCase()}}</span>
                <b class="text-xs">{{featured()!.author?.username}}</b><span class="text-xs text-[#776e69]">{{featured()!.createdAt|date:'MMM d, y'}}</span>
              </div>
            </div>
          </a>
        </div>
      }
      <div class="flex items-end justify-between border-b border-[#eaded7] pb-4 mb-6">
        <div><p class="handwritten text-xl">Freshly picked for you</p><h2 class="text-3xl font-bold">Latest Stories</h2></div>
        <span class="text-sm text-[#776e69]">Thoughtful stories, beautifully told →</span>
      </div>
      @if(loading()){<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">@for(i of [1,2,3,4];track i){<div class="paper-card h-72 animate-pulse"></div>}</div>}
      @else if(articles().length===0){<div class="paper-card text-center py-20 text-[#776e69]">No published stories yet.</div>}
      @else{<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">@for(article of rest();track article.id){<app-article-card [article]="article"/>}</div>}
    </section>
  </main>`
})
export class HomeComponent implements OnInit {
  articles=signal<Article[]>([]); loading=signal(true);
  featured=()=>this.articles()[0]??null; rest=()=>this.articles().slice(1);
  constructor(private articleService:ArticleService){}
  ngOnInit(){this.articleService.getAll().subscribe({next:data=>{this.articles.set(data);this.loading.set(false)},error:()=>this.loading.set(false)})}
}
