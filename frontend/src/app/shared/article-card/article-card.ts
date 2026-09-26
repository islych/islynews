import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Article } from '../../core/models/article.model';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <a [routerLink]="['/articles', article.id]"
       class="group block paper-card overflow-hidden hover:-translate-y-1 transition-all duration-300">

      <!-- Image -->
      <div class="relative h-44 overflow-hidden bg-[#eee3dc]">
        @if (article.imageUrl) {
          <img [src]="article.imageUrl" [alt]="article.title"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        } @else {
          <div class="w-full h-full flex items-center justify-center"
               style="background:#f3e4df">
            <svg class="w-12 h-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </div>
        }
        <!-- Status badge -->
        @if (article.status === 'HIDDEN') {
          <span class="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-400 border border-zinc-700">
            Hidden
          </span>
        }
        <!-- Gradient overlay -->
        <div class="absolute inset-0" style="background:linear-gradient(to top,rgba(37,33,32,.14),transparent 60%)"></div>
      </div>

      <!-- Content -->
      <div class="p-4">
        <span class="text-[10px] font-bold uppercase tracking-widest text-[#a94758]">Story</span>
        <h3 class="font-bold text-[#252120] text-base leading-snug mt-1 mb-2 line-clamp-2 group-hover:text-[#a94758] transition-colors">
          {{ article.title }}
        </h3>
        <p class="text-[#776e69] text-xs leading-relaxed line-clamp-2 mb-3">
          {{ article.content | slice:0:120 }}{{ (article.content || '').length > 120 ? '...' : '' }}
        </p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                 style="background:#f7dedd;color:#752f40">
              {{ article.author?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <span class="text-xs text-zinc-500">{{ article.author?.username }}</span>
          </div>
          <span class="text-xs text-zinc-600">{{ article.createdAt | date:'MMM d' }}</span>
        </div>
      </div>
    </a>
  `,
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;
}
