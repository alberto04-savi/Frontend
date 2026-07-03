import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { CampoAddestramentoService } from '../../../servizi/campo-addestramento.service';
import { LezioneService }             from '../../../servizi/lezione.service';
import { CaneService }                from '../../../servizi/cane.service';
import { SessionService }             from '../../../servizi/session.service';
import { CampoAddestramento } from '../../../modelli/campo-addestramento.model';
import { Lezione }             from '../../../modelli/lezioni.model';
import { Cane }                from '../../../modelli/cane.model';
import { PrenotazioneService } from '../../../servizi/prenotazione.service';
import { Prenotazione } from '../../../modelli/prenotazione.model';


// per dati form di prenotazione
interface FormPrenotazione {
  orario:         string; // es. "10:00"
  nMicrochipCane: string; // microchip del cane selezionato dal cliente
}

@Component({
  selector:     'app-info-campo',
  standalone:   true,
  imports:      [CommonModule, FormsModule],
  templateUrl:  './info-campo.html',
  styleUrl:     './info-campo.css',
})
export class InfoCampo implements OnInit {

  campo:       CampoAddestramento | null = null; 
  lezioni:     Lezione[]                 = [];   
  caniCliente: Cane[]                    = [];   
  errore      = false;
  caricamento = true; 
  lezioneSelezionata: Lezione | null = null; 
  formAperta         = false;                
  DataLezioneSelezionata: string = '' 

  // Dati del form 
  prenotazione: FormPrenotazione = { orario: '', nMicrochipCane: '' };

  // toast di conferma prenotazione
  toastVisibile = false;

  constructor(
    private route:     ActivatedRoute,
    private router:    Router,
    private campoSrv:  CampoAddestramentoService,
    private lezioneSrv: LezioneService,
    private caneSrv:   CaneService,
    private session:   SessionService,
    private prenotazioneSrv: PrenotazioneService,
  ) {}

  
  ngOnInit(): void {
  
    const nome =this.route.snapshot.paramMap.get('nome') ?? '';

    
    if (!nome) { this.errore = true; this.caricamento = false; return; }

    
    this.campoSrv.getByNome(nome).subscribe({
      next: (res) => {
        this.campo       = res;
        this.caricamento = false;
        this.caricaLezioni(res.nome);
      },
      error: () => { this.errore = true; this.caricamento = false; }
    });

    // Carica i cani del cliente 
    const utente = this.session.getLoggedUser();
    if (utente?.username) {
      this.caneSrv.getByCliente(utente.username).subscribe({
        next:  (res) => { this.caniCliente = res || []; },
        error: ()    => { this.caniCliente = []; }
      });
    }
  }

  //  Carica le lezioni associate al campo 
  caricaLezioni(nomeCampo: string): void {
    this.lezioneSrv.getByCampo(nomeCampo).subscribe({
      next:  (res) => { this.lezioni = res || []; },
      error: ()    => { this.lezioni = []; }
    });
  }


  // Apre il form di prenotazione per una specifica lezione 
  apriForm(lezione: Lezione): void {
    this.lezioneSelezionata = lezione;
    this.formAperta         = true;
    this.DataLezioneSelezionata = lezione.data;
    this.prenotazione       = { orario: '', nMicrochipCane: '' };
  }

  //  Chiude il form 
  chiudiForm(): void {
    this.formAperta         = false;
    this.lezioneSelezionata = null;
  }

  //  Getter per form prenotazione  
  get formValida(): boolean {
    return !!this.prenotazione.nMicrochipCane;
  }

  
  confermaPrenotazione(): void {
    
    if (!this.formValida) return;
 
    const payload: Prenotazione = {
      usernameCliente: this.session.getUsername() ?? '',
      nomeCampo:       this.campo?.nome ?? '',
      dataSvolgimento: this.DataLezioneSelezionata?? '',
      oraSvolgimento:  this.lezioneSelezionata?.ora?? '',
      nMicrochip:      this.prenotazione.nMicrochipCane,
      categoriaPrenotazione: 'lezione',
      prezzoPattuito:  this.lezioneSelezionata?.costo ?? 0,
      codiceId:        0, // il backend assegna l'ID, qui mettiamo 0 o un valore fittizio
    };

    
    this.prenotazioneSrv.create(payload).subscribe({
      next: () => {
        this.chiudiForm();    
        this.mostraToast();   
      },
      error: () => {
        alert('Errore durante il salvataggio della prenotazione. Riprova più tardi.');
      }
    });


  }

  mostraToast(): void {
    this.toastVisibile = true;
    setTimeout(() => { this.toastVisibile = false; }, 3500);
  }

  
  torna(): void {
    this.router.navigate(['/home-cliente']);
  }
}