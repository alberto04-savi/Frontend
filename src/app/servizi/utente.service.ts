import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { LoginResponse } from '../modelli/login-response.model';
import { Utente } from '../modelli/utente.model';

@Injectable({ providedIn: 'root' })
export class UtenteService {

  private apiUrl  = 'http://localhost:8080/api/utenti';
  
  constructor(private http: HttpClient) {}

  // ── CREATE ────────────────────────────────────────────────────────────────
  // Ritorna una LoginResponse (token, username, ruolo)
  create(utente: Utente): Observable<LoginResponse> {
   
    return this.http.post<LoginResponse>(this.apiUrl + '/create', utente);
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  // Ritorna una LoginResponse (token, username, ruolo)
  login(username: string, password: string, ruolo: string): Observable<LoginResponse> {
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password, ruolo });
  }

}