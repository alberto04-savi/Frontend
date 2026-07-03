import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cane } from '../modelli/cane.model';

@Injectable({
  providedIn: 'root'
})
export class CaneService {

  private apiUrl = 'http://localhost:8080/api/cani';

  constructor(private http: HttpClient) {}

  // Restituisce tutti i cani associati a un cliente
  getByCliente(usernameCliente: string): Observable<Cane[]> {
    return this.http.get<Cane[]>(`${this.apiUrl}/cliente/${usernameCliente}`);
  }

  // Restituisce i numeri di microchip dei cani associati a un cliente
  getMicrochipByCliente(usernameCliente: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/cliente/${usernameCliente}/microchip`);
  } 

  // Crea un nuovo cane
  create(cane: Cane): Observable<void> {
    return this.http.post<void>(this.apiUrl, cane);
  }

  // Aggiorna i dati di un cane esistente
  update(cane: Cane): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${cane.nMicrochip}`, cane);
  }

  // Elimina un cane tramite il suo microchip
  delete(nMicrochip: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${nMicrochip}`);
  }
}