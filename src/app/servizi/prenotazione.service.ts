import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prenotazione } from '../modelli/prenotazione.model';

@Injectable({
  providedIn: 'root'
})
export class PrenotazioneService {

  private apiUrl = 'http://localhost:8080/api/prenotazioni';

  constructor(private http: HttpClient) {}

  /* Recupera un elemento tramite il suo ID */
  getById(id: number): Observable<Prenotazione> {
    return this.http.get<Prenotazione>(`${this.apiUrl}/${id}`);
  }

  /* Recupera tutte le occorrenze associate al cliente specificato */
  getAllByCliente(username: string): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(`${this.apiUrl}/cliente/${username}`);
  }

  /* Recupera tutte le occorrenze associate al dogsitter specificato */
  getAllByDogsitter(username: string): Observable<Prenotazione[]> {
    return this.http.get<Prenotazione[]>(`${this.apiUrl}/dogsitter/${username}`);
  }

  /* Aggiorna i dati esistenti */
  update(prenotazione: Prenotazione): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${prenotazione.codiceId}`, prenotazione);
  }

  /* Elimina un elemento tramite identificatore */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /* Crea un nuovo elemento */
  create(prenotazione: Prenotazione): Observable<Prenotazione> {
    return this.http.post<Prenotazione>(this.apiUrl, prenotazione);
  }
}
