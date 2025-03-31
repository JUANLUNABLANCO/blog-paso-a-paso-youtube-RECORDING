import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { BlogService } from '../../../services/blog/blog.service';
import { IBlogEntry } from '../../../interfaces/blog-entries.interface';

const BASE_URL = `${environment.API_URL}`;
@Component({
  selector: 'app-view-blog-entry',
  templateUrl: './view-blog-entry.component.html',
  styleUrls: ['./view-blog-entry.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewBlogEntryComponent implements OnInit, OnDestroy {
  blogEntryId: number | null = null;
  private subscription: Subscription;
  protected baseUrl: string = BASE_URL;

  blogEntry: IBlogEntry = null;
  constructor(
    private activatedRoute: ActivatedRoute,
    private blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.subscription = this.activatedRoute.params.subscribe((params) => {
      this.blogEntryId = parseInt(params['id']);
      this.blogService
        .getBlogEntryById(this.blogEntryId)
        .pipe(
          map((blogEntry: IBlogEntry) => {
            if (blogEntry) {
              this.blogEntry = blogEntry;
            } else {
              console.log(
                '#### No existe el blogEntry con id: ',
                this.blogEntryId,
              );
            }
          }),
        )
        .subscribe();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
