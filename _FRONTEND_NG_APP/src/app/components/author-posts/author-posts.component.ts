import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { IBlogEntry } from 'src/app/interfaces/blog-entries.interface';
import { AuthorsService } from 'src/app/services/authors/authors.service';
import { BlogService } from 'src/app/services/blog/blog.service';

@Component({
  selector: 'app-author-posts',
  templateUrl: './author-posts.component.html',
  styleUrls: ['./author-posts.component.scss'],
})
export class AuthorPostsComponent implements OnInit, OnDestroy {
  authorId!: number;
  posts: IBlogEntry[] = [];
  authorName = '';
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private authorsService: AuthorsService,
  ) {}

  ngOnInit(): void {
    const idParam = Number(this.route.snapshot.paramMap.get('id'));

    if (!idParam || isNaN(Number(idParam))) {
      this.errorMessage = 'El id del autor no es válido';
      this.isLoading = false;
      return;
    }

    this.authorId = idParam;
    this.getAuthorName();
    this.getPostsByAuthor();
  }

  getAuthorName() {
    this.authorsService
      .getAuthorById(this.authorId)
      .pipe(takeUntil(this.destroy$))
      .pipe(take(1))
      .subscribe({
        next: (author) => {
          if (author && author.userName) {
            this.authorName = author.userName;
          } else {
            this.errorMessage = 'El autor no tiene nombre disponible.';
          }
        },
        error: (err) => {
          console.error('Error al obtener el autor:', err);
          this.errorMessage = 'No se pudo cargar el nombre del autor.';
        },
      });
  }

  getPostsByAuthor() {
    this.blogService
      .getPostsByAuthor(this.authorId)
      .pipe(takeUntil(this.destroy$))
      .pipe(take(1))
      .subscribe({
        next: (posts) => {
          this.posts = posts;
          console.log('posts del autor: ', this.posts);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al obtener las entradas del autor:', err);
          this.errorMessage = 'No se pudieron cargar las entradas del autor.';
          this.isLoading = false;
        },
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
