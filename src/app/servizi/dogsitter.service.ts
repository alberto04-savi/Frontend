import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dogsitter } from '../modelli/dogsitter.model';

@Injectable({ providedIn: 'root' })
export class DogsitterService {

  private apiUrl = 'http://localhost:8080/api/dogsitter';

  constructor(private http: HttpClient) {}

  /* Recupera tutti gli elementi */
  getAll(): Observable<Dogsitter[]> {
    return this.http.get<Dogsitter[]>(this.apiUrl);
  }

  /* Recupera i dettagli associati a un utente */
  getByUser(username: string): Observable<Dogsitter> {
    return this.http.get<Dogsitter>(`${this.apiUrl}/${username}`);
  }

  /* Aggiorna i dati esistenti */
  update(dogsitter: Dogsitter): Observable<Dogsitter> {
    return this.http.put<Dogsitter>(
      `${this.apiUrl}/${dogsitter.username}`,
      dogsitter
    );
  }

  /* Elimina un elemento tramite identificatore */
  delete(username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${username}`);
  }


}