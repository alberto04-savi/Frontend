import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Recensione } from '../../../modelli/recensione.model';
import { RecensioneService } from '../../../servizi/recensione.service';
import { SessionService } from '../../../servizi/session.service';


@Component({
  selector: 'app-recensioni',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recensioni.html',
  styleUrl: './recensioni.css'
})
export class Recensioni implements OnInit {

  recensioni: Recensione[] = [];
  caricamento: boolean = true;
  errore: string | null = null;

  constructor(
    private recensioneSrv: RecensioneService,
    private session: SessionService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadRecensioni();
  }


  // Carica le recensioni dal backend
  loadRecensioni(): void {

    this.caricamento = true;
    this.errore = null;

    const utente = this.session.getLoggedUser();

    if (utente?.username) {

      this.recensioneSrv.getRecensioniByCliente(utente.username).subscribe({
        next: (data) => {
          this.recensioni = data;
          this.caricamento = false;
        },
        error: (err) => {
          this.errore = 'Impossibile caricare le recensioni. Riprova più tardi.';
          console.error(err);
          this.caricamento = false;
        }
      });
    } else {
      this.errore = 'Utente non loggato.';
      this.caricamento = false;
    }   
  }

  // Apre il form per aggiungere una nuova recensione
  aggiungiRecensione(): void {
    this.router.navigate(['/home-cliente/add-recensione']);
  }

  // Apre il form in modalità modifica per una recensione
  modificaRecensione(recensione: Recensione): void {
    this.router.navigate(['/home-cliente/add-recensione'], { state: { recensioneDaModificare: recensione} });
  }

  
  eliminaRecensione(recensione: Recensione): void {

    if (confirm('Sei sicuro di voler eliminare questa recensione?')) {
      
      this.recensioneSrv.delete(recensione).subscribe({
        next: () => {
          this.loadRecensioni(); 
        },
        error: (err) => {
          this.errore = 'Impossibile eliminare la recensione.';
          console.error(err);
        }
      });
    }
  }
}