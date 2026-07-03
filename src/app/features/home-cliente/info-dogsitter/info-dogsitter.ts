import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { DogsitterService } from '../../../servizi/dogsitter.service';
import { CaneService }       from '../../../servizi/cane.service';
import { SessionService }    from '../../../servizi/session.service';
import { ServizioService }   from '../../../servizi/servizio.service';
import { Dogsitter }                from '../../../modelli/dogsitter.model';
import { ServizioOfferto }   from '../../../modelli/servizio.model'; 
import { Cane }                     from '../../../modelli/cane.model';
import { PrenotazioneService } from '../../../servizi/prenotazione.service';
import { Prenotazione } from '../../../modelli/prenotazione.model';


// Un giorno nel calendario di disponibilità 
interface GiornoDisponibile {
  nomeCorto:   string;   // es. "Mar"
  dataCorta:   string;   // es. "10 Giu"
  data:        Date;     // oggetto Date
  disponibile: boolean;  // dipende dai giorniDisponibili del dogsitter (dal backend)
}

// ── Interfaccia locale: campi del form di prenotazione 
interface FormPrenotazione {
  orario:         string; // slot orario scelto, es. "15:00"
  nMicrochipCane: string; // microchip del cane del cliente
}

@Component({
  selector:    'app-profilo-dogsitter',
  imports:     [CommonModule, FormsModule],
  templateUrl: './info-dogsitter.html',
  styleUrl:    './info-dogsitter.css',
})
export class InfoDogsitter implements OnInit {

  // Stato principale 
  dogsitter:   Dogsitter | null     = null; 
  offerte:     ServizioOfferto[]    = [];   
  caniCliente: Cane[]               = [];   
  errore       = false;
  caricamento  = true; 

  //  Stato form prenotazione
  offertaSelezionata:  ServizioOfferto | null  = null; // servizio selezionato
  formAperta           = false;                         // visibilità del modal/form
  giorniDisponibili:   GiornoDisponibile[]     = [];
  giornoSelezionato:   GiornoDisponibile | null = null;

  // Slot orari fissi proposti all'utente
  orariDisponibili = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'];

  // Dati del form (legati a [(ngModel)])
  prenotazione: FormPrenotazione = { orario: '', nMicrochipCane: '' };

  toastVisibile = false; // visibilità del toast di conferma

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private dogsitterSrv: DogsitterService,
    private caneSrv:      CaneService,
    private session:      SessionService,
    private servizioSrv:  ServizioService,
    private prenotazioneSrv: PrenotazioneService,
  ) {}

  
  ngOnInit(): void {
  
    
    const username = this.route.snapshot.paramMap.get('username') ?? '';
  
    if (!username) { this.errore = true; this.caricamento = false; return; }


    // Carica il profilo del dogsitter dal backend
    this.dogsitterSrv.getByUser(username).subscribe({
      next: (res: Dogsitter) => {

        this.dogsitter   = res;

        this.caricamento = false;
        
        // creo "calendario"
        this.generaGiorni(res.giorniDisponibili);
        this.caricaServizi(username); 
      },
      error: () => { this.errore = true; this.caricamento = false; },
    });

    // Carica i cani del cliente loggato 
    const utente = this.session.getLoggedUser();
    if (utente?.username) {
      this.caneSrv.getByCliente(utente.username).subscribe({
        next:  (res: Cane[]) => { this.caniCliente = res ?? []; },
        error: ()            => { this.caniCliente = []; },
      });
    }
  }

  //  Carica i servizi offerti da questo dogsitter 
  caricaServizi(username: string): void {
    this.servizioSrv.getServiziBySitter(username).subscribe({
      next:  (res: ServizioOfferto[]) => { this.offerte = res ?? []; },
      error: ()                       => { this.offerte = []; },
    });
  }

  // Genera il calendario dei prossimi 14 giorni 
  generaGiorni(giorniBackend: string[] = []): void {
    
    // Nomi completi usati per confrontare con il backend
    const nomi  = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
    const brevi = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab']; // per UI
    const mesi  = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']; // per UI
    const oggi  = new Date(); oggi.setHours(0,0,0,0);

    // Funzione per rimuovere accenti 
    const stripAccents = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // creo Set con giorniBackend 
    const dispSet = new Set(
      (giorniBackend ?? []).map(g => stripAccents(g.toLowerCase()).trim())

    );

    // creo un array di 14 giorni 
    this.giorniDisponibili = Array.from({ length: 14 }, (_, i) => {

      const d = new Date(oggi);
      
     
      d.setDate(oggi.getDate() + i + 1);

      
      // d.getDay() restituisce 0=Dom, 1=Lun, ..., 6=Sab
      const nomeEsteso = stripAccents(nomi[d.getDay()]);      
      const nomeBreve = stripAccents(brevi[d.getDay()].toLowerCase());

      const disponibile = dispSet.size > 0
        ? dispSet.has(nomeEsteso) || dispSet.has(nomeBreve)
        : d.getDay() !== 0; // se ha specificato giorni, tutti tranne domenica sono disponibili

      return {
        nomeCorto:  brevi[d.getDay()],
        dataCorta:  `${d.getDate()} ${mesi[d.getMonth()]}`,
        data:       d,
        disponibile,
      };
    });
  }

  // ── Formatta una durata in minuti in stringa leggibile ────────────
  // es.  90 → "1h 30min"   |   60 → "1h"   |   45 → "45min"
  formatDurata(minuti: number): string {
    if (!minuti) return '';
    const h   = Math.floor(minuti / 60);
    const min = minuti % 60;
    if (h && min) return `${h}h ${min}min`;
    if (h)        return `${h}h`;
    return `${min}min`;
  }

  // Apre il form per un'offerta specifica 
  apriForm(offerta: ServizioOfferto): void {
    this.offertaSelezionata = offerta;
    this.formAperta         = true;
    this.giornoSelezionato  = null;
    this.prenotazione       = { orario: '', nMicrochipCane: '' };
  }

  // Chiude il form 
  chiudiForm(): void {
    this.formAperta         = false;
    this.offertaSelezionata = null;
  }

  //  Seleziona un giorno dal calendario 
  selezionaGiorno(g: GiornoDisponibile): void {
    if (!g.disponibile) return;
    this.giornoSelezionato   = g;  
    this.prenotazione.orario = '';
  }

  // Getter per bottone prenota
  get formValida(): boolean {
    return !!this.giornoSelezionato &&
           !!this.prenotazione.orario &&
           !!this.prenotazione.nMicrochipCane;
  }

  // Costruisce e invia il payload di prenotazione 
  confermaPrenotazione(): void {
    if (!this.formValida) return;

    
    const payload :Prenotazione = {
      
      usernameCliente: this.session.getUsername() ?? '',
      usernameDogsitter: this.dogsitter?.username,
      prezzoPattuito:     this.offertaSelezionata?.prezzoListino ?? 0,
      idServizio:       this.offertaSelezionata?.idServizio ?? 0,
      categoriaPrenotazione: 'dogsitter',
      // toISOString() → "2024-07-01T00:00:00.000Z"
      dataSvolgimento:            this.giornoSelezionato!.data.toISOString().split('T')[0],
      oraSvolgimento:            this.prenotazione.orario,
      nMicrochip:    this.prenotazione.nMicrochipCane,
      codiceId:          0, // il backend lo sovrascrive con l'ID reale
    };

    // ora inviamo il payload 
    this.prenotazioneSrv.create(payload).subscribe({
      next:  () => {
          this.chiudiForm();
          this.mostraToast();
      },
      error: () => { alert('Errore durante la prenotazione. Riprova più tardi.'); }
    });

  }

  //  Mostra conferma  
  mostraToast(): void {
    this.toastVisibile = true;
    setTimeout(() => { this.toastVisibile = false; }, 3500);
  }

  
  torna(): void {
    this.router.navigate(['/home-cliente']);
  }
}