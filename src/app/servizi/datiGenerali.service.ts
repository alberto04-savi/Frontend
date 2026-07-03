import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DatiGeneraliService {
  
  private apiUrl = 'http://localhost:8080/api/province';
  
  constructor(private http: HttpClient) { }
  
  getProvince(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl);
  }
}