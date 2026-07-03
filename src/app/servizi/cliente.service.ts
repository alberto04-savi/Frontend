import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../modelli/cliente.model';

@Injectable({providedIn: 'root'})
export class ClienteService {

  private apiUrl = 'http://localhost:8080/api/clienti';
  
  constructor(private http: HttpClient) {}

  /* Recupera tutti i Clienti */
  getAll(): Observable<Cliente[]> {
    
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  /* Recupera un elemento tramite il suo ID */
  getById(username: string): Observable<Cliente> {
    
    return this.http.get<Cliente>(`${this.apiUrl}/${username}`);
  }

  /* Aggiorna i dati esistenti */
  update(cliente: Cliente): Observable<Cliente> {
    
    return this.http.put<Cliente>(`${this.apiUrl}/${cliente.username}`,cliente);
  }

  /* Elimina un elemento tramite identificatore */
  delete(username: string): Observable<void> {
    
    return this.http.delete<void>(`${this.apiUrl}/${username}`);
  }


}