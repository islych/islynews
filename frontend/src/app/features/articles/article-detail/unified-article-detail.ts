import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Article } from '../../../core/models/article.model';
import { Comment } from '../../../core/models/comment.model';
import { AuthService } from '../../../core/services/auth.service';
import { ArticleService } from '../../../core/services/article.service';
import { CommentService } from '../../../core/services/comment.service';
import { ArticleAnalysis } from '../../../core/services/external-news.service';
import { LikeService } from '../../../core/services/like.service';
import { SavedArticleService } from '../../../core/services/saved-article.service';

@Component({
  selector: 'app-unified-article-detail', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <main class="min-h-screen bg-[#fffaf5] px-4 pb-24 pt-24 text-[#272220]">
    @if (loading()) { <div class="mx-auto max-w-6xl py-24 text-center text-[#887e79]">Loading…</div> }
    @else if (article()) { <article class="mx-auto max-w-[1180px]">
      <a routerLink="/external-news" class="mb-5 inline-flex text-sm font-medium text-[#d8566d]">← &nbsp;Back to all news</a>
      <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
        <div class="relative">
          <header class="mb-6"><div class="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#77706d]"><span class="text-[#cf5367]">Isly News</span><span>•</span><span>{{ article()!.createdAt | date:'longDate' }}</span><span>•</span><span>{{ readingTime(article()!.content) }} min read</span></div><h1 class="font-serif text-4xl font-black leading-[1.05] md:text-6xl">{{ article()!.title }}</h1></header>
          @if (article()!.imageUrl) { <div class="mb-5 h-72 overflow-hidden rounded-2xl md:h-[31rem]"><img [src]="article()!.imageUrl" [alt]="article()!.title" class="h-full w-full object-cover"></div> }
          <section class="rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm md:p-8"><p class="whitespace-pre-wrap text-[17px] leading-8 text-[#4f4946]">{{ article()!.content }}</p>
            @if (article()!.author?.bio) { <div class="mt-8 border-t border-[#f0e5df] pt-6"><p class="text-xs font-bold uppercase tracking-widest text-[#d8566d]">About the author</p><div class="mt-3 flex items-start gap-3"><div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#df6578] font-bold text-white">{{ article()!.author.username.charAt(0).toUpperCase() }}</div><div><h3 class="font-serif text-lg font-bold">{{ article()!.author.username }}</h3><p class="mt-1 text-sm leading-6 text-[#766d68]">{{ article()!.author.bio }}</p></div></div></div> }
            @if (canManage()) { <div class="mt-6 flex gap-3"><a [routerLink]="['/articles', article()!.id, 'edit']" class="rounded-lg border border-[#df8794] px-4 py-2 text-sm text-[#c84d61]">Edit</a><button (click)="deleteArticle()" class="rounded-lg border border-[#eadfd8] px-4 py-2 text-sm text-[#887e79]">Delete</button></div> }
          </section>
          <section class="mt-6 rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm"><h2 class="font-serif text-2xl font-bold">Comments ({{ comments().length }})</h2>@if (auth.isLoggedIn()) { <textarea [(ngModel)]="newComment" rows="3" placeholder="Share your thoughts…" class="mt-4 w-full rounded-xl border border-[#eadfd8] bg-[#fffaf5] p-4 text-sm outline-none"></textarea><button (click)="submitComment()" [disabled]="!newComment.trim()" class="mt-3 rounded-lg bg-[#df6578] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">Post comment</button> }<div class="mt-5 space-y-3">@for (comment of comments(); track comment.id) { <div class="rounded-xl bg-[#fffaf5] p-4"><div class="flex justify-between"><b class="text-sm">{{ comment.user?.username }}</b><span class="text-xs text-[#9b918c]">{{ comment.createdAt | date:'MMM d' }}</span></div><p class="mt-2 text-sm leading-6 text-[#625a56]">{{ comment.content }}</p></div> }</div></section>
        </div>
        <aside class="space-y-6">
          <section class="panel"><div class="mb-5 flex items-center justify-between"><h2 class="font-serif text-2xl font-bold">Related articles</h2><span class="grid h-8 w-8 place-items-center rounded-full bg-[#fff0ee] text-[#df5d73]">→</span></div><div class="space-y-5">@for (item of related(); track item.id) { <a [routerLink]="['/articles', item.id]" class="grid grid-cols-[92px_1fr] gap-4">@if (item.imageUrl) { <img [src]="item.imageUrl" [alt]="item.title" class="h-20 w-24 rounded-xl object-cover"> }<div><h3 class="line-clamp-3 font-serif text-[15px] font-bold leading-5">{{ item.title }}</h3><p class="mt-2 text-[10px] font-bold uppercase text-[#9b918c]">{{ item.createdAt | date:'MMM d, y' }}</p></div></a> }</div></section>
          <section class="panel"><div class="mb-5 flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-[#fff0ee] text-[#df5d73]">☷</span><h2 class="font-serif text-2xl font-bold">Key points</h2></div>@if (analysis()) { <ul class="space-y-4 text-sm leading-6 text-[#514a47]">@for (point of analysis()!.keyPoints; track point) { <li class="flex gap-4"><span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#df5d73]"></span><span>{{ point }}</span></li> }</ul> } @else { <p class="text-sm text-[#8b817c]">Sign in to generate the key points.</p> }</section>
          <section class="panel"><div class="mb-5 flex items-center gap-3"><span class="text-xl text-[#df5d73]">◆</span><h2 class="font-serif text-2xl font-bold">Tags</h2></div><div class="flex flex-wrap gap-2">@for (tag of analysis()?.tags ?? []; track tag) { <span class="rounded-xl bg-[#fff0ee] px-3 py-2 text-xs font-medium text-[#a94354]">{{ tag }}</span> }</div></section>
        </aside>
      </div>
    </article> }
  </main>`,
  styles: [`.action{display:grid;height:3rem;width:3rem;place-items:center;border-radius:9999px;border:1px solid #f0dcd8;background:#fff;color:#df5d73;font-size:1.25rem;box-shadow:0 1px 3px #00000012}.panel{border:1px solid #eadfd8;border-radius:1rem;background:#ffffffb3;padding:1.5rem;box-shadow:0 1px 3px #0000000d}`]
})
export class UnifiedArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null); comments = signal<Comment[]>([]); loading = signal(true); analysis = signal<ArticleAnalysis | null>(null); related = signal<Article[]>([]); newComment = ''; liked = signal(false); saved = signal(false); likeCount = signal(0);
  constructor(private route: ActivatedRoute, private router: Router, private articleService: ArticleService, private commentService: CommentService, private likeService: LikeService, private savedService: SavedArticleService, public auth: AuthService) {}
  ngOnInit(): void { const id=Number(this.route.snapshot.paramMap.get('id')); this.articleService.getById(id).subscribe({next:a=>{this.article.set(a);this.loading.set(false);this.commentService.getByArticle(id).subscribe(c=>this.comments.set(c));this.likeService.getCount(id).subscribe(c=>this.likeCount.set(c));if(this.auth.isLoggedIn()){this.articleService.getAnalysis(id).subscribe(x=>this.analysis.set(x));this.articleService.getRelated(id).subscribe(x=>this.related.set(x));this.likeService.checkIfLiked(id).subscribe(x=>this.liked.set(x));this.savedService.checkIfSaved(id).subscribe(x=>this.saved.set(x));}},error:()=>this.loading.set(false)}); }
  readingTime(text:string):number{return Math.max(1,Math.ceil(text.trim().split(/\s+/).filter(Boolean).length/200));}
  toggleLike():void{if(!this.auth.isLoggedIn())return;this.likeService.toggleLike(this.article()!.id).subscribe(r=>{this.liked.set(r.liked);this.likeCount.update(c=>r.liked?c+1:Math.max(0,c-1));});}
  toggleSave():void{if(!this.auth.isLoggedIn())return;this.savedService.toggleSave(this.article()!.id).subscribe(r=>this.saved.set(r.saved));}
  submitComment():void{if(!this.newComment.trim()||!this.auth.isLoggedIn())return;this.commentService.add({content:this.newComment,user:{id:this.auth.currentUser()!.id},article:{id:this.article()!.id}}).subscribe(c=>{this.comments.update(list=>[...list,c]);this.newComment='';});}
  canManage():boolean{const u=this.auth.currentUser(),a=this.article();return !!u&&!!a&&(u.role==='ADMIN'||a.author?.id===u.id);}
  deleteArticle():void{if(confirm('Are you sure you want to delete this article?'))this.articleService.delete(this.article()!.id).subscribe(()=>this.router.navigate(['/']));}
}
