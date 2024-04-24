import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { IBlogEntriesPageable } from 'src/app/interfaces/blog-entries.interface';
import { BlogService } from 'src/app/services/blog/blog.service';

@Component({
  selector: 'app-blog-entries',
  templateUrl: './blog-entries.component.html',
  styleUrls: ['./blog-entries.component.scss'],
})
export class BlogEntriesComponent {
  dataSource: Observable<IBlogEntriesPageable>;
  pageEvent: PageEvent;
  pageSizeOptions = [3, 5, 10, 25];

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.dataSource = this.blogService.indexAll(1, 5);
  }

  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    const limit = event.pageSize;

    page = page + 1;
    this.dataSource = this.blogService.indexAll(page, limit);
  }
}
