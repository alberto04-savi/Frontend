import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { Utente } from '../../../modelli/utente.model';
import { Dogsitter } from '../../../modelli/dogsitter.model';
import { UtenteService } from '../../../servizi/utente.service';
import { SessionService } from '../../../servizi/session.service';
import { DatiGeneraliService } from '../../../servizi/datiGenerali.service';

@Component({
  selector: 'app-registrazione-dogsitter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrazione-dogsitter.html',
  styleUrls: ['./registrazione-dogsitter.css'],
})
export class RegistrazioneDogsitter implements OnInit { 

  utente: Utente = {
    username: '', nomeBattesimo: '', cognome: '',
    cap: '', nCivico: '', provincia: '', via: '',
    nTel: '', password: '', ruolo: 'dogsitter',
  };
     
  confermaPassword = '';
  maxCani: number | null = null;
  errore  = '';
  successo = '';

  giorni: string[] = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
  taglie: string[] = ['PICCOLA', 'MEDIA', 'GRANDE'];
  province: string[] = [];
  giorniSelezionati: string[] = [];
  taglieSelezionate: string[] = [];

  // VARIABILE PER SALVARE LA PROVENIENZA
  provenienza: string = '';

  constructor(
    private utenteService: UtenteService,
    private router: Router,
    private route: ActivatedRoute, 
    private session: SessionService,
    private datiGeneraliService: DatiGeneraliService
  ) {}
  
  ngOnInit(): void {
    // Caricamento delle province
    this.datiGeneraliService.getProvince().subscribe({
      next: (data) => this.province = data,
      error: (err) => console.error('Errore caricamento province', err)
    });

    // Leggiamo il query param 'provenienza' 
    this.route.queryParams.subscribe(params => {
      this.provenienza = params['provenienza'] || '';
    });
  }

  // Requisiti password 
  get hasMinLength()  { return (this.utente.password?.length ?? 0) >= 8; }
  get hasUppercase()  { return /[A-Z]/.test(this.utente.password ?? ''); }
  get hasNumber()     { return /[0-9]/.test(this.utente.password ?? ''); }
  get hasSpecial()    { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.utente.password ?? ''); }
  get passwordValida(){ return this.hasMinLength && this.hasUppercase && this.hasNumber && this.hasSpecial; }

  //  Validazioni telefono, CAP, Via e Civico 
  get nTelValido()    { return /^\d{10}$/.test(this.utente.nTel ?? ''); }
  get capValido()     { return /^\d{5}$/.test(this.utente.cap ?? ''); }
  get viaValida()     { return /^[Vv]ia\s.+$/.test(this.utente.via ?? ''); }
  get nCivicoValido() { return /^\d+$/.test(this.utente.nCivico ?? ''); }

  // Aggiunge o rimuove un giorno dalle disponibilità
  toggleGiorno(giorno: string): void {
    const idx = this.giorniSelezionati.indexOf(giorno);
    
    idx > -1 ? this.giorniSelezionati.splice(idx, 1) : this.giorniSelezionati.push(giorno);
  }

  // Aggiunge o rimuove una taglia dalle preferenze
  toggleTaglia(taglia: string): void {
    const idx = this.taglieSelezionate.indexOf(taglia);
    idx > -1 ? this.taglieSelezionate.splice(idx, 1) : this.taglieSelezionate.push(taglia);
  }
  
  // Elabora e invia i dati del modulo di registrazione
  register(form: NgForm): void {
    this.errore = '';
    this.successo = '';

    if (form.invalid) { this.errore = 'Compila tutti i campi obbligatori.'; return; }
    if (!this.nTelValido) { this.errore = 'Il numero di telefono deve contenere esattamente 10 cifre.'; return; }
    if (!this.viaValida) { this.errore = 'La via deve iniziare con "Via " o "via " seguita dal nome.'; return; }
    if (!this.nCivicoValido) { this.errore = 'Il numero civico deve contenere solo numeri.'; return; }
    if (!this.capValido) { this.errore = 'Il CAP deve contenere esattamente 5 cifre numeriche.'; return; }
    if (!this.passwordValida) { this.errore = 'La password non rispetta i requisiti richiesti.'; return; }
    if (this.confermaPassword !== this.utente.password) { this.errore = 'Le password non coincidono.'; return; }
    if (this.giorniSelezionati.length === 0) { this.errore = 'Seleziona almeno un giorno di lavoro.'; return; }
    if (this.taglieSelezionate.length === 0) { this.errore = 'Seleziona almeno una taglia accettata.'; return; }
    if (this.maxCani === null || this.maxCani < 1) { this.errore = 'Indica il numero massimo di cani che puoi gestire.'; return; }

    const payload: Dogsitter = {
      ...this.utente,
      giorniDisponibili: this.giorniSelezionati,
      taglieCani:        this.taglieSelezionate,
      maxCani:       this.maxCani ,
    };

    this.utenteService.create(payload).subscribe({
      next: (res) => {
        
        if (this.provenienza === 'lista-cdc') {
          
          //ritorno alla lista dei dogsitter dopo la registrazione          
          this.router.navigate(['/home-amministratore/lista-cdc'], {
            queryParams: { tipo: 'dogsitter' }
          });

        } else {

          // Comportamento di default 
          if (res.username && res.token) {
              this.session.setToken(res.token);
            }
          this.session.setLoggedUser(res.username,"dogsitter");
          
          this.router.navigate(['/home-dogsitter']);
        }
      },
      error: (err) => {
        console.error('Registrazione fallita', err);
        this.errore = 'Si è verificato un errore durante la registrazione.';
      }
    });
  }


  // Ritorna alla schermata della lista principale
  tornaAllaLista(): void {
    if (this.provenienza === 'lista-cdc') {

      // Se proveniamo da lista-cdc
      this.router.navigate(['/home-amministratore/lista-cdc'], {
        queryParams: { tipo: 'dogsitter' }
      });
    }
  }
}