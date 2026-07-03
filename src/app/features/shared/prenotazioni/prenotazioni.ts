import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prenotazione } from '../../../modelli/prenotazione.model';
import { PrenotazioneService } from '../../../servizi/prenotazione.service';
import { ServizioService } from '../../../servizi/servizio.service';
import { SessionService } from '../../../servizi/session.service';

@Component({
  selector: 'app-prenotazioni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prenotazioni.html',
  styleUrls: ['./prenotazioni.css'],
})
export class Prenotazioni implements OnInit {

  ruolo: 'dogsitter' | 'cliente' = 'cliente';
  usernameCorrente: string = '';
  tutteLePrenotazioni: Prenotazione[] = [];
  prenotazioniFiltrate: Prenotazione[] = [];

  // Filtri Cliente
  filtroCategoriaPrenotazione: 'campo' | 'dogsitter' | '' = '';
  filtroNomeCane: string = '';
  filtroDataCliente: string = '';
  filtroOraCliente: string = '';

  // Filtri Dog Sitter
  filtroNomeCaneDogsitter: string = '';
  filtroCategoriaDogsitter: string = '';
  categorieDisponibili: string[] = [];
  filtroDataDogsitter: string = '';
  filtroOraDogsitter: string = '';

  constructor(
    private router: Router,
    private prenotazioneService: PrenotazioneService,
    private servizioService: ServizioService,
    private session: SessionService
  ) {}

  ngOnInit(): void {
    

    const username = this.session.getUsername();  
    const ruolo = this.session.getRuolo();

    // Utente non è autenticato 
    if (!username || !ruolo) {
      console.error('Utente non autenticato');
      this.router.navigate(['/login']);
      return;
    }

    this.usernameCorrente = username;

    // Type Assertion
    this.ruolo = ruolo as 'cliente' | 'dogsitter';
    
    this.caricaPrenotazioni();

    if (this.ruolo === 'dogsitter') {

      // per filtraggio
      this.servizioService.getCategorieDisponibili().subscribe(categorie => {
        this.categorieDisponibili = categorie;
      });
    }
  }

  // Recupero le prenotazioni
  caricaPrenotazioni(): void {

    // operator ternario  
    const service = this.ruolo === 'cliente' 
      ? this.prenotazioneService.getAllByCliente(this.usernameCorrente)
      : this.prenotazioneService.getAllByDogsitter(this.usernameCorrente);

    service.subscribe({
      next: (dati) => {
        this.tutteLePrenotazioni = dati;

        // spread operator 
        this.prenotazioniFiltrate = [...this.tutteLePrenotazioni];
      },
      error: (err) => console.error("Errore caricamento prenotazioni", err)
    });
  }

  // Filtra la lista in base ai criteri selezionati
  applicaFiltri(): void {
    if (this.ruolo === 'cliente') {
      
      // Cliente
      this.prenotazioniFiltrate = this.tutteLePrenotazioni.filter(p => {


        const matchTipo = !this.filtroCategoriaPrenotazione || 
                          (this.filtroCategoriaPrenotazione === 'campo' && p.categoriaPrenotazione === 'lezione') ||
                          (this.filtroCategoriaPrenotazione === 'dogsitter' && p.categoriaPrenotazione === 'dogsitter');
        const matchCane = !this.filtroNomeCane || p.nomeCane?.toLowerCase().includes(this.filtroNomeCane.toLowerCase());
        const matchData = !this.filtroDataCliente || p.dataSvolgimento === this.filtroDataCliente;
        const matchOra = !this.filtroOraCliente || p.oraSvolgimento.startsWith(this.filtroOraCliente);
        return matchTipo && matchCane && matchData && matchOra;
      });
    } else { 
      
      // Dogsitter
      this.prenotazioniFiltrate = this.tutteLePrenotazioni.filter(p => {
        const matchCane = !this.filtroNomeCaneDogsitter || p.nomeCane?.toLowerCase().includes(this.filtroNomeCaneDogsitter.toLowerCase());
        const matchCategoria = !this.filtroCategoriaDogsitter || p.categoriaServizio === this.filtroCategoriaDogsitter;
        const matchData = !this.filtroDataDogsitter || p.dataSvolgimento === this.filtroDataDogsitter;
        const matchOra = !this.filtroOraDogsitter || p.oraSvolgimento.startsWith(this.filtroOraDogsitter);
        return matchCane && matchCategoria && matchData && matchOra;
      });
    }
  }


  resetFiltri(): void {

    // Reset filtri cliente
    this.filtroCategoriaPrenotazione = '';
    this.filtroNomeCane = '';
    this.filtroDataCliente = '';
    this.filtroOraCliente = '';
    // Reset filtri dogsitter
    this.filtroNomeCaneDogsitter = '';
    this.filtroCategoriaDogsitter = '';
    this.filtroDataDogsitter = '';
    this.filtroOraDogsitter = '';
    
    this.prenotazioniFiltrate = [...this.tutteLePrenotazioni];
  }
  
  
  modifica(prenotazione: Prenotazione): void {
    
    const base = this.ruolo === 'cliente' ? '/home-cliente' : '/home-dogsitter';

    this.router.navigate([`${base}/modifica-prenotazione`, prenotazione.codiceId], {
      state: {  
        prenotazione: prenotazione,
      }
    });
  }
  

  // Gestisce il processo di eliminazione con conferma
  elimina(prenotazione: Prenotazione): void {
    if (confirm(`Sei sicuro di voler eliminare la prenotazione #${prenotazione.codiceId}?`)) {
      this.prenotazioneService.delete(prenotazione.codiceId).subscribe({
        next: () => {

          // arrow function
          this.tutteLePrenotazioni = this.tutteLePrenotazioni.filter(p => p.codiceId !== prenotazione.codiceId);
          this.applicaFiltri();
        },
        error: (err) => alert('Errore durante l\'eliminazione della prenotazione.')
      });
    }
  }

  // Formatta la data in formato leggibile italiano
  formattaData(data: string): string {
    if (!data) return '';

    // prendo la stringa in formato "YYYY-MM-DD", la divido in 3 parti usando il trattino 
    // come separatore, e poi riassemblo la data in formato "DD/MM/YYYY"
    const [anno, mese, giorno] = data.split('-');
    return `${giorno}/${mese}/${anno}`;
  }

}
