import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Utente } from '../../../modelli/utente.model';
import { UtenteService } from '../../../servizi/utente.service';
import { SessionService } from '../../../servizi/session.service';
import { DatiGeneraliService } from '../../../servizi/datiGenerali.service';

@Component({
  selector: 'app-registrazione-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrazione-cliente.html',
  styleUrls: ['./registrazione-cliente.css'],
})
export class RegistrazioneCliente implements OnInit {

  utente: Utente = {
    username: '', nomeBattesimo: '', cognome: '',
    cap: '', nCivico: '', provincia: '', via: '',
    nTel: '', password: '', ruolo: 'cliente',
  };

  confermaPassword = '';
  errore  = '';
  successo = '';
  province: string[] = [];
  

  // VARIABILE PER SALVARE LA PROVENIENZA
  provenienza: string = '';

  constructor(
    private utenteService: UtenteService,
    private router: Router,
    private session: SessionService,
    private datiGeneraliService: DatiGeneraliService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.datiGeneraliService.getProvince().subscribe({
      next: (data) => {
      this.province = data;
    },
      error: (err) => console.error('Errore caricamento province', err)
    });

    if (this.route.snapshot.queryParamMap.has('provenienza')) {
      this.provenienza = this.route.snapshot.queryParamMap.get('provenienza') ?? '';
    }
  }

  // ── Requisiti password ────────────────────────────────
  // getter per verificare i requisiti della password
  get hasMinLength()  { return (this.utente.password?.length ?? 0) >= 8; }
  get hasUppercase()  { return /[A-Z]/.test(this.utente.password ?? ''); }
  get hasNumber()     { return /[0-9]/.test(this.utente.password ?? ''); }
  get hasSpecial()    { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.utente.password ?? ''); }
  get passwordValida(){ return this.hasMinLength && this.hasUppercase && this.hasNumber && this.hasSpecial; }

  // ── Validazioni telefono, CAP, Via e Civico ───────────
  // ^ rappre inizio stringa, $ fine stringa, \d cifra, {n} n volte,+ una o più volte
  // /s spazio bianco, . qualsiasi carattere, + zero o più volte
  get nTelValido()    { return /^\d{10}$/.test(this.utente.nTel ?? ''); }
  get capValido()     { return /^\d{5}$/.test(this.utente.cap ?? ''); }
  get viaValida()     { return /^[Vv]ia\s.+$/.test(this.utente.via ?? ''); }
  get nCivicoValido() { return /^\d+$/.test(this.utente.nCivico ?? ''); }

  // Elabora e invia i dati del modulo di registrazione
  register(form: NgForm): void {
    this.errore = '';
    this.successo = '';

    // solo per questo controllo usiamo la form
    if (form.invalid)         { this.errore = 'Compila tutti i campi obbligatori.'; return; }
    if (!this.nTelValido)     { this.errore = 'Il numero di telefono deve contenere esattamente 10 cifre.'; return; }
    if (!this.viaValida)      { this.errore = 'La via deve iniziare con "Via " o "via " seguita dal nome.'; return; }
    if (!this.nCivicoValido)  { this.errore = 'Il numero civico deve contenere solo numeri.'; return; }
    if (!this.capValido)      { this.errore = 'Il CAP deve contenere esattamente 5 cifre numeriche.'; return; }
    if (!this.passwordValida) { this.errore = 'La password non rispetta i requisiti richiesti.'; return; }
    if (this.confermaPassword !== this.utente.password) { this.errore = 'Le password non coincidono.'; return; }

    this.utenteService.create(this.utente).subscribe({
      next: (res) => {
        
        if (this.provenienza === 'lista-cdc') {
        
          // Se proviene dalla lista (amministratore)
          this.router.navigate(['/home-amministratore/lista-cdc'], {
            queryParams: { tipo: 'cliente' }
          });
        } else {

          // Registrazione normale
          if (res.username && res.token) {
            this.session.setToken(res.token);
          }
          this.session.setLoggedUser(res.username, 'cliente');
          this.router.navigate(['/home-cliente']);
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
      
      // Se proveniamo da lista-cdc, ritorniamo lì impostando di nuovo il tipo corretto nell'URL
      this.router.navigate(['/home-amministratore/lista-cdc'], {
        queryParams: { tipo: 'cliente' }
      });
    }
  }
}