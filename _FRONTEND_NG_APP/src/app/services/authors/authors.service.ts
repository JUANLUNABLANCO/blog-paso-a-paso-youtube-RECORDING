import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.API_URL;

export interface IAuthor {
  id: number;
  userName: string;
  profileImage: string;
  bio?: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthorsService {
  constructor(private http: HttpClient) {}

  getAuthorById(id: number): Observable<IAuthor> {
    return this.http.get<IAuthor>(`${BASE_URL}/api/authors/${id}`);
  }

  getAllAuthors(): Observable<IAuthor[]> {
    return this.http.get<IAuthor[]>(`${BASE_URL}/api/authors`);
  }
}
