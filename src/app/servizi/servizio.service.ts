import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServizioOfferto } from '../modelli/servizio.model';

@Injectable({
  providedIn: 'root'
})
export class ServizioService {
  private apiUrl = 'http://localhost:8080/api/servizi'; 

  constructor(private http: HttpClient) {}

  // Recupera SOLO i nomi delle categorie per popolare la tendina
  getCategorieDisponibili(): Observable<string[]> {    
    return this.http.get<string[]>(`${this.apiUrl}/categorie`);
  }

  // Ottieni la lista dei servizi (già "montati" con durata e categoria) per il profilo
  getServiziBySitter(username: string): Observable<ServizioOfferto[]> {
    return this.http.get<ServizioOfferto[]>(`${this.apiUrl}/dogsitter/${username}`);
  }

  // Crea/Aggiunge il servizio
  aggiungiServizio(servizio: ServizioOfferto): Observable<ServizioOfferto> {
    return this.http.post<ServizioOfferto>(`${this.apiUrl}`, servizio);
  }

  // Modifica un servizio esistente
  modificaServizio(servizio: ServizioOfferto): Observable<ServizioOfferto> {
    return this.http.put<ServizioOfferto>(`${this.apiUrl}/id`, servizio);
  }

  // Rimuove l'associazione del servizio al dogsitter
  rimuoviServizio(id: number, username: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}?username=${username}`);
  }
}