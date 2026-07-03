import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prenotazione } from '../../../../modelli/prenotazione.model';
import { PrenotazioneService } from '../../../../servizi/prenotazione.service';
import { CaneService } from '../../../../servizi/cane.service';
import { SessionService } from '../../../../servizi/session.service';
import { Cane } from '../../../../modelli/cane.model';

@Component({
  selector: 'app-modifica-pren',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modifica-pren.html',
  styleUrls: ['./modifica-pren.css']
})
export class ModificaPren implements OnInit {

  prenotazione: Prenotazione | null = null;

  // type assertion
  ruolo: 'cliente' | 'dogsitter' = 'cliente';
  caniDelCliente: Cane[] = [];
  usernameCorrente: string = '';
  caricamento: boolean = true; // per non mostrare il form vuoto

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private prenotazioneService: PrenotazioneService,
    private caneService: CaneService,
    private session: SessionService
  ) {}

  ngOnInit(): void {

    const usernameLoggato = this.session.getUsername();
    const ruoloLoggato = this.session.getRuolo();

    if (!usernameLoggato || !ruoloLoggato) {
      console.error('Utente non autenticato');
      this.router.navigate(['/login']);
      return;
    }

    this.usernameCorrente = usernameLoggato;
    this.ruolo = ruoloLoggato as 'cliente' | 'dogsitter';

    const idParam = this.route.snapshot.paramMap.get('id');
    
    const stato = history.state;

  
    if (stato?.prenotazione && String(stato.prenotazione.codiceId) === idParam) {
      this.prenotazione = stato.prenotazione;
      this.caricaCaniECompletaCaricamento();
      return;
    }

    // id non c'è
    if (!idParam) {
      console.error('ID prenotazione mancante nella rotta');
      this.tornaIndietro();
      return;
    }

    
  }


  // Carico i cani del Cliente
  private caricaCaniECompletaCaricamento(): void {


    if (this.ruolo === 'cliente' && this.prenotazione?.usernameCliente) {

      this.caneService.getByCliente(this.usernameCorrente).subscribe({
        
        next: (cani) => {
          this.caniDelCliente = cani;
          this.caricamento = false;
        },
        error: (err) => {
          console.error('Errore caricamento cani del cliente', err);
          this.caricamento = false;
        }
      });
    } else {
    
      // Dogsitter: non ha bisogno dei cani, mostra subito
      this.caricamento = false;
    }
  }

  // Gestisce la selezione di un cane differente
  onCaneChange(nomeCane: string): void {

    // oggetto Cane 
    const caneSelezionato = this.caniDelCliente.find(c => c.nome === nomeCane);
 
    if (this.prenotazione && caneSelezionato) {

      // prenotazione.nomeCane cambiato con NgModel
      this.prenotazione.nMicrochip = caneSelezionato.nMicrochip;
    }
 
  }

  get isCaneDisabilitato(): boolean {
    return this.ruolo === 'dogsitter' ;
  }

  
  salva(): void {
    if (!this.prenotazione) return;

    if (!this.dataSvolgimentoValida) {
 
      alert('La data di svolgimento non è valida o è nel passato.');
      return;
    }

    this.prenotazioneService.update(this.prenotazione).subscribe({
      next: () => {
        alert('Prenotazione modificata con successo!');
        this.tornaIndietro();
      },
      error: () => alert('Errore durante il salvataggio delle modifiche.')
    });
  }

  tornaIndietro(): void {
    const rotta = this.ruolo === 'cliente'
      ? '/home-cliente/prenotazioni'
      : '/home-dogsitter/prenotazioni';
    this.router.navigate([rotta]);
  }

  // Validazione data di svolgimento 
  get dataSvolgimentoValida(): boolean {

    const d = this.prenotazione?.dataSvolgimento;
    
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
    
    const oggi = new Date();
    
    oggi.setHours(0, 0, 0, 0); // ignora l'orario, confronta solo il giorno
    
    return new Date(d) >= oggi; // oggi o nel futuro
  }

}