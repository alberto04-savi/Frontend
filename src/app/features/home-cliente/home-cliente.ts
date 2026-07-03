import { Component, OnInit } from '@angular/core';
import {Router,RouterOutlet,RouterLink,RouterLinkActive,NavigationEnd} from '@angular/router';
import { CommonModule } from '@angular/common';   // *ngIf, *ngFor
import { FormsModule } from '@angular/forms';     // [(ngModel)] sui campi filtro
import { filter } from 'rxjs/operators';
import { DogsitterService }         from '../../servizi/dogsitter.service';
import { CampoAddestramentoService } from '../../servizi/campo-addestramento.service';
import { SessionService }            from '../../servizi/session.service';
import { Dogsitter }         from '../../modelli/dogsitter.model';
import { CampoAddestramento } from '../../modelli/campo-addestramento.model';

@Component({
  selector: 'app-home-cliente',
  standalone: true,   // componente autonomo non bisogno di un modulo
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './home-cliente.html',
  styleUrl:    './home-cliente.css',
})
export class HomeCliente implements OnInit {   

  // Sidebar
  sidebarAperta: boolean = false;  // true = sidebar espansa, false = collassata
  nomeCliente:   string  = 'Cliente'; // nome visualizzato nell'avatar sidebar

  // Visibilità della home-view
  mostraHome: boolean = true;

  // Dati grezzi ricevuti dal backend 
  dogsitters: Dogsitter[]         = [];
  campi:      CampoAddestramento[] = [];

  // Dati filtrati mostrati nel template 
  filteredDogsitters: Dogsitter[]         = [];
  filteredCampi:      CampoAddestramento[] = [];

  // Stato dei filtri (legati agli input nel template con ngModel) ─
  filtroTipo:   string = 'tutti'; // tab "Tutti / Dogsitter / Campi"
  filtroTaglia: string = '';      // taglia cane (piccola/media/grande…)
  filtroCitta:  string = '';      // testo libero su città/provincia
  taglieDisponibili: string[] = []; // opzioni del <select> taglia

  constructor(
    private router:     Router,
    private dogsitterSrv: DogsitterService,
    private campoSrv:     CampoAddestramentoService,
    private session:      SessionService,
  ) {}

  
  ngOnInit(): void {
  

    const utente = this.session.getLoggedUser();

    if (utente?.username) this.nomeCliente = utente.username;

    // Per mostrare o nascondere la home-view 
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {

        this.mostraHome =
          e.urlAfterRedirects === '/home-cliente' ||
          e.urlAfterRedirects === '/home-cliente/';
      });

    // Controlla anche al caricamento iniziale 
    const url = this.router.url;
    this.mostraHome = url === '/home-cliente' || url === '/home-cliente/';

    // carico campi e dogsitter dal backend 
    this.loadDogsitters();
    this.loadCampi();
  }

  
  loadDogsitters(): void {

    this.dogsitterSrv.getAll().subscribe({
      next: (res) => {
        this.dogsitters = res || [];
        this.extractTaglie();
        this.applyFilters(); 
      },
      error: () => {
        
        this.dogsitters = [];
        this.applyFilters();
      }
    });
  }

  // Caricamento campi di addestramento 
  loadCampi(): void {
    
    this.campoSrv.getAll().subscribe({
      next:  (res) => { this.campi = res || []; this.applyFilters(); },
      error: ()    => { this.campi = [];         this.applyFilters(); }
    });
  }

  // Estrae le taglie uniche da tutti i dogsitter per filtri
  extractTaglie(): void {

    const taglie = this.dogsitters.flatMap(d => d.taglieCani || []);

    // elimino i duplicati
    const set = new Set<string>(taglie);

    // Ordine alfabetico 
    this.taglieDisponibili = Array.from(set).sort();
  }

  // Applica i filtri attivi su dogsitter e campi
  applyFilters(): void {

    // Se ci sono
    const tag   = this.filtroTaglia?.toLowerCase();
    const citta = this.filtroCitta?.toLowerCase();


    this.filteredDogsitters = this.dogsitters.filter(d => {
      
      // se tag vuoto matchTag= true
      const matchTag   = !tag   || (d.taglieCani || [])
                                    .map((x: string) => x.toLowerCase())
                                    .includes(tag);
      const matchCitta = !citta || (d.provincia || '').toLowerCase().includes(citta);
      return matchTag && matchCitta;
    });

    // Filtra campi: solo per città 
    this.filteredCampi = this.campi.filter(c => {
      const matchCitta = !citta
        || (c.provincia || '').toLowerCase().includes(citta)
        || (c.via       || '').toLowerCase().includes(citta);
      return matchCitta;
    });
  }

  //  Callback chiamato dal template al cambio di qualsiasi filtro 
  onFiltroChange(): void { this.applyFilters(); }

  //  Resetta tutti i filtri ai valori di default 
  resetFiltri(): void {
    this.filtroTipo   = 'tutti';
    this.filtroTaglia = '';
    this.filtroCitta  = '';
    this.applyFilters();
  }

  // Apre/chiude la sidebar
  toggleSidebar(): void { this.sidebarAperta = !this.sidebarAperta; }

  logout(): void {
    this.session.clearSession();
    this.router.navigate(['/']);
  }

}