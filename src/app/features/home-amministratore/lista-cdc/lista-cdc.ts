import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../modelli/cliente.model';
import { Dogsitter } from '../../../modelli/dogsitter.model';
import { CampoAddestramento } from '../../../modelli/campo-addestramento.model';
import { ClienteService } from '../../../servizi/cliente.service';
import { DogsitterService } from '../../../servizi/dogsitter.service';
import { CampoAddestramentoService } from '../../../servizi/campo-addestramento.service';
import { DatiGeneraliService } from '../../../servizi/datiGenerali.service';

// union type
type Entita = Cliente | Dogsitter | CampoAddestramento ;

@Component({
  selector: 'app-lista-cdc',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cdc.html',
  styleUrl: './lista-cdc.css',
})
export class ListaCDC implements OnInit {
  
  tipo: string = '';
  termineDiRicerca: string = '';
  provinciaFiltro: string = '';
  tutteLeEntita: Entita[] = [];
  entitaFiltrate: Entita[] = [];
  caricamento: boolean = false;

  // Eventuale messaggio di errore da mostrare all'utente
  errore: string = '';

  // Lista delle province disponibili per il filtro (per ora fisse)
  province: string[] = [];

  // Dependency Injection
  constructor(
    private route: ActivatedRoute,
    private router: Router,       
    private clienteService: ClienteService,
    private dogsitterService: DogsitterService,
    private campoService: CampoAddestramentoService,
    private datiGeneraliService: DatiGeneraliService
  ) { }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe(params => {
      this.tipo = params['tipo'] || '';

      this.caricaEntita();
      this.caricaProvinceDalDatabase();

    });

  }

  // Carica i dati in base al tipo selezionato
  caricaEntita(): void {


    this.caricamento = true;
    this.errore = '';
    this.tutteLeEntita = [];
    this.entitaFiltrate = [];


    switch (this.tipo) {
     
      case 'campo':
        
      
        this.campoService.getAll().subscribe({

          next: (campi) => {
            this.tutteLeEntita = campi;
            this.entitaFiltrate = [...campi];
            this.caricamento = false;

          },
    
          error: (err) => {
            this.errore = 'Errore nel caricamento dei campi';
            this.caricamento = false;
            console.error(err);
          }
        });
        break;

      case 'dogsitter':
        this.dogsitterService.getAll().subscribe({
          next: (dogsitter) => {
            this.tutteLeEntita = dogsitter;
            this.entitaFiltrate = [...dogsitter];
            this.caricamento = false;
          },
          error: (err) => {
            this.errore = 'Errore nel caricamento dei dogsitter';
            this.caricamento = false;
            console.error(err);
          }
        });
        break;

      case 'cliente':
        this.clienteService.getAll().subscribe({
          next: (clienti) => {
            this.tutteLeEntita = clienti;
            this.entitaFiltrate = [...clienti];
            this.caricamento = false;
          },
          error: (err) => {
            this.errore = 'Errore nel caricamento degli utenti';
            this.caricamento = false;
            console.error(err);
          }
        });
        break;
    }
  }   

  // carico le province per filtro 
  caricaProvinceDalDatabase(): void {
    this.datiGeneraliService.getProvince().subscribe({
      next: (provinceDalBackend) => {
        
        this.province = provinceDalBackend;
      },
      error: (err) => {
        console.error('Errore durante il recupero delle province:', err);
      }
    });
  }

  
  elimina(entita: Entita): void {
    const nome = this.getNome(entita);
    const conferma = confirm(`Sei sicuro di voler eliminare "${nome}"?`);
    if (!conferma) return;

    switch (this.tipo) {
      case 'campo':
        const idCampo = (entita as CampoAddestramento).nome;
        this.campoService.delete(idCampo).subscribe({
          next: () => {
            
            this.tutteLeEntita = this.tutteLeEntita.filter(e => e !== entita);
            this.entitaFiltrate = this.entitaFiltrate.filter(e => e !== entita);
          },
          error: (err) => {
            this.errore = 'Errore durante l\'eliminazione'; // in realtà il campo da eliminare non esiste
            console.error(err);
          }
        });
        break;

      case 'dogsitter':
        const idDogsitter = (entita as Dogsitter).username;
        this.dogsitterService.delete(idDogsitter).subscribe({
          next: () => {
            this.tutteLeEntita = this.tutteLeEntita.filter(e => e !== entita);
            this.entitaFiltrate = this.entitaFiltrate.filter(e => e !== entita);
          },
          error: (err) => {
            this.errore = 'Errore durante l\'eliminazione';
            console.error(err);
          }
        });
        break;

      case 'cliente':
        const idCliente = (entita as Cliente).username;
        this.clienteService.delete(idCliente).subscribe({
          next: () => {
            this.tutteLeEntita = this.tutteLeEntita.filter(e => e !== entita);
            this.entitaFiltrate = this.entitaFiltrate.filter(e => e !== entita);
          },
          error: (err) => {
            this.errore = 'Errore durante l\'eliminazione';
            console.error(err);
          }
        });
        break;
    }
   }

  // Titolo della pagina 
  get titoloPagina(): string {
    switch (this.tipo) {
      case 'campo': return 'Campi di Addestramento';
      case 'dogsitter': return 'Dog Sitter';
      case 'cliente': return 'Clienti';
      default: return 'Lista';
    }
  }

  // Icona emoji
  get iconaPagina(): string {
    switch (this.tipo) {
      case 'campo': return '🐕‍🦺';
      case 'dogsitter': return '🐾';
      case 'cliente': return '👤';
      default: return '📋';
    }
  }

  // Restituisce il nome di ogni entità
  getNome(entita: Entita): string {

    if (this.tipo === 'campo') {

      return (entita as CampoAddestramento).nome;

    } else {

      // Sia Cliente che Dogsitter hanno nome e cognome (ereditati da Utente)
      const u = entita as Cliente;

      return `${u.nomeBattesimo} ${u.cognome}`;
    }
  }

  // Restituisce la provincia di ogni entità
  getProvincia(entita: Entita): string {

    return entita.provincia || '';
  }

  
  filtra(): void {
    this.entitaFiltrate = this.tutteLeEntita.filter(entita => {
      
      const nome = this.getNome(entita).toLowerCase();
      const provincia = this.getProvincia(entita).toLowerCase();   

      const corrispondeNome = nome.includes(this.termineDiRicerca.toLowerCase());
      const corrispondeProvincia = this.provinciaFiltro === ''
        || provincia === this.provinciaFiltro.toLowerCase();

      return corrispondeNome && corrispondeProvincia;
    });
  }


  resetFiltri(): void {
    this.termineDiRicerca = '';
    this.provinciaFiltro = '';

    // spread operator
    this.entitaFiltrate = [...this.tutteLeEntita];
  }


  modifica(entita: Entita): void {

    switch (this.tipo) {

      case 'campo':
        this.router.navigate(['/home-amministratore/registrazione-campo'], {
          queryParams: { name: (entita as CampoAddestramento).nome }
        });
        break;
      case 'dogsitter':
        this.router.navigate(['profilo'], {
          queryParams: {  username: (entita as Dogsitter).username,provenienza: 'lista-cdc',ruolo: 'dogsitter' }
        });
        break;
      case 'cliente':
        this.router.navigate(['profilo' ], {
          queryParams: {  username: (entita as Cliente).username, provenienza: 'lista-cdc',ruolo: 'cliente' }
        });
        break;
    }
  }
  

  aggiungi(): void {
    switch (this.tipo) {
      case 'campo':
        this.router.navigate(['/home-amministratore/registrazione-campo']);
        break;
      case 'dogsitter':
        this.router.navigate(['/registrazione/dogsitter'], {
          queryParams: { provenienza: 'lista-cdc' }
        });
        break;
      case 'cliente':
        this.router.navigate(['/registrazione/cliente'], {
          queryParams: { provenienza: 'lista-cdc' }
        });
        break;
    }
  }

  
  torna(): void {
    this.router.navigate(['/home-amministratore']);
  }
}
