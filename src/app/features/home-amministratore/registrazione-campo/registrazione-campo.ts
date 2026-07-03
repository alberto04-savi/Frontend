import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampoAddestramentoService } from '../../../servizi/campo-addestramento.service';
import { LezioneService } from '../../../servizi/lezione.service';
import { DatiGeneraliService } from '../../../servizi/datiGenerali.service';
import { CampoAddestramento } from '../../../modelli/campo-addestramento.model';
import { Lezione } from '../../../modelli/lezioni.model';



@Component({
  selector: 'app-registrazione-campo',
  imports: [CommonModule, FormsModule],
  templateUrl: './registrazione-campo.html',
  styleUrl: './registrazione-campo.css',
})
export class RegistrazioneCampo implements OnInit {

  // Modalità 
  isModifica    = false;
  nomeOriginale = '';
  modificaLezione  = false;

  // Form campo
  campo: CampoAddestramento = {
    nome: '', via: '', nCivico: '', cap: '', provincia: '', nTel: '', orarioApertura: '',
  };

  // Dati dal backend 
  province: string[] = [];

  // Lezioni associate 
  lezioni:          Lezione[]     = [];
  nuovaLezione:     Lezione       = this.lezioneVuota();
  lezioneEditIndex: number | null = null;

  // UI state 
  salvato           = false;
  errore            = '';
  caricamento       = false;
  mostraFormLezione = false;

  //  Tipologie Lezioni 
  tipologieCosti: Map<string, number> = new Map();
  tipologieKeys: string[] = [];

  constructor(
    private route:     ActivatedRoute,
    private router:    Router,
    private campoSrv:  CampoAddestramentoService,
    private lezioneSrv: LezioneService,
    private datiGeneraliService: DatiGeneraliService
  ) {}

  ngOnInit(): void {
    
    const nome = this.route.snapshot.queryParamMap.get('name');
    
    if (nome) {
      this.isModifica    = true;
      this.nomeOriginale = nome;
      this.caricaCampo(this.nomeOriginale);

      // tipologie disponibili per le lezioni
      this.caricaTipologie();
      
    }
    
    this.datiGeneraliService.getProvince().subscribe({
      next: (data) => { this.province = data; },
      error: (err) => console.error('Errore caricamento province', err)
    });
  }

  // Carica le tipologie disponibili
  caricaTipologie(): void {
    this.lezioneSrv.getTipologieLezioni().subscribe({
      next: (res) => {
        // plain object to Map conversion
        this.tipologieCosti = new Map(Object.entries(res));
        this.tipologieKeys = Object.keys(res);
      },
      error: () => console.error('Errore durante il caricamento delle tipologie'),
    });
  }

  // Carica dati 
  caricaCampo(nome: string): void {

    this.caricamento = true;
    this.campoSrv.getByNome(nome).subscribe({
      next: (res: CampoAddestramento) => {

        // spead operator 
        this.campo       = { ...res };
        this.caricamento = false;
        this.caricaLezioni(nome);
      },
      error: () => {
        this.errore      = 'Campo non trovato.';
        this.caricamento = false;
      },
    });
  }

  // Carica la lista delle lezioni
  caricaLezioni(nome: string): void {
    this.lezioneSrv.getByCampo(nome).subscribe({
      next:  (res: Lezione[]) => { 
        
        this.lezioni = res ?? []; 
      },
      error: (err) => { 
        console.error('Errore caricamento lezioni', err);
        this.lezioni = []; 
      },
    });
  }

  //  Validazioni
  get nTelValido()    { return /^\d{10}$/.test(this.campo.nTel ?? ''); }
  get capValido()     { return /^\d{5}$/.test(this.campo.cap ?? ''); }
  get viaValida()     { return /^[Vv]ia\s.+$/.test(this.campo.via ?? ''); }
  get nCivicoValido() { return /^\d+$/.test(this.campo.nCivico ?? ''); }
  
  // Accetta "Mar-Sab 8:00-17:00" oppure "Mar-Sab, 08:00-17:00" (accetta virgola opzionale e ore a 1 o 2 cifre)
  get orarioValido() { 
    return /^[a-zA-Z]{3}-[a-zA-Z]{3},?\s+([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$/.test(this.campo.orarioApertura ?? ''); 
  }

  //  Salva campo
  salva(): void {
    
    this.errore = '';

    if (!this.campoValido()) return;

    
    const obs = this.isModifica
      ? this.campoSrv.update(this.campo)
      : this.campoSrv.create(this.campo);

    obs.subscribe({
      next: () => {
        this.salvato = true;
        this.router.navigate(['/home-amministratore/lista-cdc'], { queryParams: { tipo: 'campo' } });
      },
      error: () => {
         this.errore = 'Errore durante il salvataggio. Riprova.';
      },
    });
  }

  //  Validazione 
  campoValido(): boolean {
    if (!this.campo.nome.trim())     { this.errore = 'Il nome è obbligatorio.'; return false; }
    if (!this.viaValida)             { this.errore = 'La via deve iniziare con "Via " o "via " seguita dal nome.'; return false; }
    if (this.campo.nCivico && !this.nCivicoValido) { this.errore = 'Il numero civico deve contenere solo numeri.'; return false; }
    if (!this.capValido)             { this.errore = 'CAP non valido (5 cifre numeriche).'; return false; }
    if (!this.campo.provincia)       { this.errore = 'La provincia è obbligatoria.'; return false; }
    if (this.campo.nTel && !this.nTelValido) { this.errore = 'Il numero di telefono deve contenere esattamente 10 cifre.'; return false; }
    
    // Validazione Formato Orario
    if (this.campo.orarioApertura && !this.orarioValido) { 
      this.errore = 'Formato orario non valido. Usa il formato: GGG-GGG HH:MM-HH:MM (es. Mar-Sab 8:00-17:00).'; 
      return false; 
    }
    
    return true;
  }

  //          Gestione lezioni 

  private lezioneVuota(): Lezione {
    return { nomeCampo: '', ora: '', data: '', tipologia: '', costo: 0, maxPartecipanti: 0 };
  }

  // Apre la finestra di dettaglio per una lezione
  apriFormLezione(index?: number): void {

    if (index !== undefined) {
      this.lezioneEditIndex = index;
      this.modificaLezione = true;
      this.nuovaLezione     = { ...this.lezioni[index] };
    } else {
      this.lezioneEditIndex    = null;
      this.nuovaLezione        = this.lezioneVuota();
      this.nuovaLezione.nomeCampo = this.campo.nome;
    }
    this.mostraFormLezione = true;
  }

  // Chiude la finestra di dettaglio della lezione
  chiudiFormLezione(): void {
    this.mostraFormLezione = false;
    this.modificaLezione     = false;
    this.nuovaLezione      = this.lezioneVuota();
    this.lezioneEditIndex  = null;
  }

  // Gestisce il cambio della tipologia selezionata
  onTipologiaChange(): void {
    if (this.nuovaLezione.tipologia && this.tipologieCosti.has(this.nuovaLezione.tipologia)) {
      this.nuovaLezione.costo = this.tipologieCosti.get(this.nuovaLezione.tipologia)!;
    }
  }

  // Salva i dati della lezione corrente
  salvaLezione(): void {


    if (!this.nuovaLezione.data || !this.nuovaLezione.ora || !this.nuovaLezione.tipologia) 
      {
        alert('Compila tutti i campi della lezione prima di salvare.');
        return;
      }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.nuovaLezione.data)) {
      this.errore = 'Formato data non valido. Usa il formato YYYY-MM-DD.';
      return;
    }

    //  CONTROLLO DATA SOLO FUTURA 
    const oggi = new Date();
    const anno = oggi.getFullYear();
    // 0-based month, quindi aggiungiamo 1 e padStart per avere sempre due cifre
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    const oggiString = `${anno}-${mese}-${giorno}`; // Genera stringa "YYYY-MM-DD" locale di oggi

    if (this.nuovaLezione.data <= oggiString) {
      alert('La data della lezione deve essere futura.');
      return;
    }


    this.nuovaLezione.nomeCampo = this.campo.nome;

    if (this.lezioneEditIndex !== null) {
      const idx = this.lezioneEditIndex;
      this.lezioneSrv.update(this.nuovaLezione).subscribe({
        next:  (res: Lezione) => { this.lezioni[idx] = res; this.chiudiFormLezione(); },
        error: ()             => { this.errore = 'Errore aggiornamento lezione.';  this.chiudiFormLezione(); },
      });
    } else {
      this.lezioneSrv.create(this.nuovaLezione).subscribe({
        next:  (res: Lezione) => { this.lezioni = [...this.lezioni, res]; this.chiudiFormLezione(); },
        error: ()             => { this.errore = 'Errore creazione lezione.';  this.chiudiFormLezione(); },
      });
    }
  }

  // Elimina la lezione selezionata
  eliminaLezione(index: number): void {
    const l = this.lezioni[index];
    if (!confirm(`Eliminare la lezione del ${l.data} alle ${l.ora}?`)) return;
    this.lezioneSrv.delete(l.nomeCampo, l.ora, l.data).subscribe({
      next:  () => { this.lezioni = this.lezioni.filter((_, i) => i !== index); },
      error: () => { this.errore = 'Errore eliminazione lezione.';  this.chiudiFormLezione(); },
    });
  }

  //  Navigazione 
  annulla(): void {
    this.router.navigate(['/home-amministratore/lista-cdc'], { queryParams: { tipo: "campo" } });
  }
}