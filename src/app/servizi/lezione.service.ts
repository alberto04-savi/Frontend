import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lezione } from '../modelli/lezioni.model'; 

@Injectable({
  providedIn: 'root'
})
export class LezioneService {

  private apiUrl = 'http://localhost:8080/api/lezioni';

  constructor(private http: HttpClient) { }

  // Recupera tutte le lezioni associate a uno specifico campo di addestramento
  getByCampo(nomeCampo: string): Observable<Lezione[]> {
    
    return this.http.get<Lezione[]>(`${this.apiUrl}/campo/${nomeCampo}`);
  }

  // Modifica una lezione esistente sul database
  update(lezione: Lezione): Observable<Lezione> {
    
    return this.http.put<Lezione>(this.apiUrl, lezione);
  }

  // Elimina una lezione specifica dal database
  delete(nomeCampo: string, ora: string, data: string): Observable<void> {

    // encode se ci sono caratteri speciali negli argomenti della query (&, ?, =, ecc.)
    return this.http.delete<void>(`${this.apiUrl}?nomeCampo=${encodeURIComponent(nomeCampo)}&ora=${encodeURIComponent(ora)}&data=${encodeURIComponent(data)}`);
  }

  // Crea una nuova lezione nel database
  create(lezione: Lezione): Observable<Lezione> {
    return this.http.post<Lezione>(this.apiUrl, lezione);
  }

  // Recupera il dizionario delle tipologie e dei relativi costi
  getTipologieLezioni(): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.apiUrl}/tipologie`);
  }
}