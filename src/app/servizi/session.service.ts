import { Injectable } from '@angular/core';

interface SessionUser {
  username: string;
  ruolo: string;
}


@Injectable({ providedIn: 'root' })
export class SessionService {

  // Chiave usata per salvare il mini-utente nello storage
  private readonly USER_KEY = 'loggedUtente';


  // Salva solo username e ruolo in sessione 
  setLoggedUser(username: string, ruolo: string): void {
    try {
      const user: SessionUser = { username, ruolo };
      const safe = JSON.stringify(user);
      localStorage.setItem(this.USER_KEY, safe);
    } catch (e) {
      // In casi estremi di storage pieno o serializzazione fallita
      console.error('Impossibile salvare utente in sessione', e);
    }
  }

  // Recupera il mini-utente dallo storage o null se non presente
  getLoggedUser(): SessionUser | null {
    
    const raw = localStorage.getItem(this.USER_KEY);

    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch (e) {
      console.error('Dati utente corrotti nello storage', e);
      return null;
    }
  }

  // Rimuove l'oggetto utente dallo storage (logout)
  clearLoggedUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }


  // Helper: ritorna il ruolo dell'utente loggato, se presente
  getRuolo(): string | null {
    const ut = this.getLoggedUser();
    return ut?.ruolo ?? null;
  }

  // Helper: ritorna lo username dell'utente loggato, se presente
  getUsername(): string | null {
    const ut = this.getLoggedUser();
    return ut?.username ?? null;
  }

  /** Salva il token di autenticazione nello storage */
  setToken(token: string) {
    localStorage.setItem("token", token);
  }

  /** Recupera il token di autenticazione corrente */
  getToken(): string | null {
      return localStorage.getItem("token");
  }


  // Pulizia completa della sessione (utente)
  clearSession(): void {
    this.clearLoggedUser();
    localStorage.removeItem("token");
  }
}