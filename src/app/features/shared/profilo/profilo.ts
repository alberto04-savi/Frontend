import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfiloCliente } from './profilo-cliente/profilo-cliente';
import { ProfiloDogsitter } from './profilo-dogsitter/profilo-dogsitter';
import { ClienteService } from '../../../servizi/cliente.service';
import { DogsitterService } from '../../../servizi/dogsitter.service';
import { SessionService } from '../../../servizi/session.service';
import { Cliente } from '../../../modelli/cliente.model';
import { Dogsitter } from '../../../modelli/dogsitter.model';
import { DatiGeneraliService } from '../../../servizi/datiGenerali.service';



@Component({
  selector: 'app-profilo',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfiloCliente, ProfiloDogsitter],
  templateUrl: './profilo.html',
  styleUrl: './profilo.css',
})
export class Profilo implements OnInit {

  ruolo: 'dogsitter' | 'cliente' = 'cliente';
  utente: Cliente | Dogsitter | null = null; 
  username: string = '';
  province: string[] = [];

  provenienza: string = ''; // Variabile per la provenienza

  // Dependency Injection
  constructor(
    private router: Router,
    private clienteService: ClienteService,
    private dogsitterService: DogsitterService,
    private session: SessionService,
    private datiGeneraliService: DatiGeneraliService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {   


    // se veniamo da lista-cdc, allora l'URL conterrà i parametri username, ruolo e provenienza
    if(this.route.snapshot.queryParamMap.has('username') && this.route.snapshot.queryParamMap.has('provenienza') && this.route.snapshot.queryParamMap.has('ruolo')) {
      this.username = this.route.snapshot.queryParamMap.get('username') || '';
      this.provenienza = this.route.snapshot.queryParamMap.get('provenienza') || '';

      // type assertion 
      this.ruolo = this.route.snapshot.queryParamMap.get('ruolo') as 'cliente' | 'dogsitter' ;


    }
    else {

      // Leggi username e ruolo dall'utente loggato 
      const username = this.session.getUsername();
      const ruolo = this.session.getRuolo();
      
      this.username = username || '';

      // type assertion
      this.ruolo = ruolo as 'cliente' | 'dogsitter';      

    }

    // Carica province e dati utente in parallelo
    this.datiGeneraliService.getProvince().subscribe({
      next: (data) => this.province = data,
      error: (err) => console.error('Errore caricamento province', err)
    });

    this.caricaDatiSito();
  }     


  private caricaDatiSito(): void {

    if (this.ruolo === 'dogsitter') {

      this.dogsitterService.getByUser(this.username).subscribe({

        next: (datiSitter) => {
          this.utente = datiSitter;
        },
        error: (err) => {
          console.error('Errore nel recupero del profilo dog sitter dal backend:', err);
        }
      });
    } else {

      this.clienteService.getById(this.username).subscribe({
        next: (datiCliente) => {
          this.utente = datiCliente;
        },
        error: (err) => {
          console.error('Errore nel recupero del profilo cliente dal backend:', err);
        }
      });
    }
  }



// Salva le informazioni del profilo utente
salvaAnagrafica(): void {
  
  if (!this.utente) return;

  // ── Validazione campi ────────────────────────────────────────────────────
  if (!this.nTelValido)    { alert('Il numero di telefono deve contenere esattamente 10 cifre.'); return; }
  if (!this.viaValida)     { alert('La via deve iniziare con "Via " seguita dal nome.'); return; }
  if (!this.nCivicoValido) { alert('Il numero civico deve contenere solo numeri.'); return; }
  if (!this.capValido)     { alert('Il CAP deve contenere esattamente 5 cifre numeriche.'); return; }


      if (this.ruolo === 'dogsitter') {
        
        this.dogsitterService.update(this.utente as Dogsitter).subscribe({
          next: (risultato) => {
            this.utente = risultato;
            alert('Profilo Dog Sitter aggiornato con successo nel backend!');
            if (this.provenienza === 'lista-cdc') {
              this.router.navigate(['/home-amministratore/lista-cdc'], { queryParams: { tipo: 'dogsitter' } });
            }
          },
          error: (err) => {
            console.error('Errore durante il salvataggio del dog sitter:', err);
            alert('Impossibile salvare i dati del Dog Sitter.');
          }
        });
      } else {
        
        this.clienteService.update(this.utente as Cliente).subscribe({
          next: (risultato) => {
            this.utente = risultato;
            alert('Profilo Cliente aggiornato con successo nel backend!');
            if (this.provenienza === 'lista-cdc') {
              this.router.navigate(['/home-amministratore/lista-cdc'], { queryParams: { tipo: 'cliente' } });
            }
          },
          error: (err) => {
            console.error('Errore durante il salvataggio del cliente:', err);
            alert('Impossibile salvare i dati del Cliente.');
          }
        });
      }

  }


  // ── Validazioni ────────────────────────
  get nTelValido()    { return /^\d{10}$/.test(this.utente?.nTel ?? ''); }
  get capValido()     { return /^\d{5}$/.test(this.utente?.cap ?? ''); }
  get viaValida()     { return /^[Vv]ia\s.+$/.test(this.utente?.via ?? ''); }
  get nCivicoValido() { return /^\d+$/.test(this.utente?.nCivico ?? ''); }

  // da passare ai componenti figli
  get utenteCliente(): Cliente {
    return this.utente as Cliente;
  }

  get utenteDogsitter(): Dogsitter {
    return this.utente as Dogsitter;
  }

  // Ritorna alla schermata della lista principale
  tornaAllaLista(): void {
    
    if (this.provenienza === 'lista-cdc') {
      
      // Se proveniamo da lista-cdc
      this.router.navigate(['/home-amministratore/lista-cdc'], {
        queryParams: { tipo: this.ruolo }
      });
    }
   } 
}

