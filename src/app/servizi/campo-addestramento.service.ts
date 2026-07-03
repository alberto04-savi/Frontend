import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CampoAddestramento } from '../modelli/campo-addestramento.model';


@Injectable({ providedIn: 'root' })
export class CampoAddestramentoService {

  private apiUrl = 'http://localhost:8080/api/campi';

  constructor(private http: HttpClient) {}

  /* Recupera tutti i Campi di Addestramento */
  getAll(): Observable<CampoAddestramento[]> {
    
    return this.http.get<CampoAddestramento[]>(this.apiUrl);
  }

  /* Recupera un elemento tramite il suo nome */
  getByNome(nome: string): Observable<CampoAddestramento> {
    
    return this.http.get<CampoAddestramento>(`${this.apiUrl}/${nome}`);
  }

  /* Aggiorna i dati esistenti */
  update(campo: CampoAddestramento): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${campo.nome}`,
      campo
    );
  }

  /* Elimina un elemento tramite identificatore */
  delete(nome: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${nome}`);
  }

  // Crea un nuovo campo di addestramento
  create(campo: CampoAddestramento): Observable<void> {
    return this.http.post<void>(this.apiUrl, campo);
  }


}