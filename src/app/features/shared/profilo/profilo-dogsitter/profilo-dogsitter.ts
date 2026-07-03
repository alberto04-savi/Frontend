import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServizioService } from '../../../../servizi/servizio.service';
import { ServizioOfferto } from '../../../../modelli/servizio.model';
import { Recensione } from '../../../../modelli/recensione.model';
import { Dogsitter } from '../../../../modelli/dogsitter.model';
import { RecensioneService } from '../../../../servizi/recensione.service';

@Component({
  selector: 'app-profilo-dogsitter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profilo-dogsitter.html',
  styleUrl: './profilo-dogsitter.css'
})
export class ProfiloDogsitter implements OnInit {

  // Decoratore @Input()
  @Input() dogsitter!: Dogsitter;
  @Input() provenienza: string = '';

  serviziOfferti: ServizioOfferto[] = [];
  recensioni: Recensione[] = [];

  // Liste fisse dei valori selezionabili
  giorni: string[] = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
  taglie: string[] = ['PICCOLA', 'MEDIA', 'GRANDE'];

  constructor(
    private router: Router,
    private servizioService: ServizioService,
    private recensioneService: RecensioneService
  ) {}

  ngOnInit(): void {

    if (this.dogsitter) {
      this.caricaServizi();
      this.caricaRecensioni();
    }
  
  }

  // Toggle giorni disponibili 
  toggleGiorno(giorno: string): void {

    const idx = this.dogsitter.giorniDisponibili.indexOf(giorno);

    if (idx > -1) {
      // Filter 
      this.dogsitter.giorniDisponibili = this.dogsitter.giorniDisponibili.filter(g => g !== giorno);
    } else {
      // Aggiunta con spread operator 
      this.dogsitter.giorniDisponibili = [...this.dogsitter.giorniDisponibili, giorno];
    }
  }

  // Toggle taglie accettate 
  toggleTaglia(taglia: string): void {

    const idx = this.dogsitter.taglieCani.indexOf(taglia);
    
    if (idx > -1) {
      this.dogsitter.taglieCani = this.dogsitter.taglieCani.filter(t => t !== taglia);
    } else {

      // spread operator
      this.dogsitter.taglieCani = [...this.dogsitter.taglieCani, taglia];
    }
  }

  // Carica i servizi erogati
  caricaServizi(): void {
    this.servizioService.getServiziBySitter(this.dogsitter.username).subscribe({
      next: (serviziBackend) => { this.serviziOfferti = serviziBackend; },
      error: (err) => console.error('Errore nel recupero dei servizi', err)
    });
  }

  // Gestisce l'operazione di caricaRecensioni
  caricaRecensioni(): void {
    this.recensioneService.getRecensioniByDogsitter(this.dogsitter.username).subscribe({
      next: (recensioniBackend) => { this.recensioni = recensioniBackend; },
      error: (err) => console.error('Errore nel recupero delle recensioni', err)
    });
  }

  // Apre il form di configurazione di un nuovo servizio
  vaiAFormServizio(servizio?: ServizioOfferto): void {

    if(this.provenienza === 'lista-cdc') {
      this.router.navigate(['form-servizio'], { 
        state: {
          sitterUsername: this.dogsitter.username,
          servizioDaModificare: servizio
        },queryParams: { provenienza: 'lista-cdc' } 
      });
    }
    else {
      this.router.navigate(['/home-dogsitter/form-servizio'], { 
        state: {
          sitterUsername: this.dogsitter.username,
          servizioDaModificare: servizio
        },
      });
    }
  }

  // Elimina un servizio esistente
  rimuoviServizio(servizio: ServizioOfferto): void {
    if (!servizio.idServizio) return;
    if (confirm(`Vuoi disattivare il servizio "${servizio.categoria}" da ${servizio.durata} min?`)) {
      this.servizioService.rimuoviServizio(servizio.idServizio,this.dogsitter.username).subscribe({
        next: () => {
          this.serviziOfferti = this.serviziOfferti.filter(s => s.idServizio !== servizio.idServizio);
        },
        error: () => alert('Errore nella rimozione del servizio')
      });
    }
  }
}