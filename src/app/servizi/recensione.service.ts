import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recensione } from '../modelli/recensione.model';

@Injectable({
  providedIn: 'root'
})
export class RecensioneService {

  private apiUrl = 'http://localhost:8080/api/recensioni';

  constructor(private http: HttpClient) {}

  /** Recupera la lista delle recensioni di un dogsitter */
  getRecensioniByDogsitter(username: string): Observable<Recensione[]> {
    return this.http.get<Recensione[]>(`${this.apiUrl}/dogsitter/${username}`);
  }

  /** Crea un nuovo elemento */
  create(recensione: Recensione): Observable<void> {
 
    return this.http.post<void>(this.apiUrl, recensione);
  }

  //otteniamo le recensioni di un cliente specifico
  getRecensioniByCliente(username: string): Observable<Recensione[]> {
    return this.http.get<Recensione[]>(`${this.apiUrl}/cliente/${username}`);
  }

  /* Aggiorna i dati esistenti */
  update(recensione: Recensione): Observable<void> {

    return this.http.put<void>(this.apiUrl, recensione);
  }

  /* Elimina un elemento tramite identificatore */
  delete(recensione :Recensione): Observable<void> {

    //invio sia username cliente sia quello del dogsitter per identificare univocamente la recensione da eliminare
    return this.http.delete<void>(`${this.apiUrl}/${recensione.usernameDogsitter}/${recensione.usernameCliente}`);
  }

  //recuperiamo i dogsitter disponibili per popolare la select del form
  getDogsitterDisponibili(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/dogsitter-disponibili`);
  }
}
