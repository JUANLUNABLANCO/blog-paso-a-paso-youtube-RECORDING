import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IBlogEntriesPageable } from 'src/app/interfaces/blog-entries.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  constructor(private http: HttpClient) {}

  indexAll(page: number, limit: number): Observable<IBlogEntriesPageable> {
    let params = new HttpParams();
    params = params.append('page', String(page));
    params = params.append('limit', String(limit));

    // `${environment.API_URL}/api/blog-entries?page=${page}&limit=${limit}`;
    return this.http.get<IBlogEntriesPageable>(
      `${environment.API_URL}/api/blog-entries`,
      { params },
    );
  }
}
