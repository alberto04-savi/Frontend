import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServizioService } from '../../../../servizi/servizio.service';
import { ServizioOfferto } from '../../../../modelli/servizio.model'; 

@Component({
  selector: 'app-form-servizio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-servizio.html',
  styleUrl: './form-servizio.css'
})
export class FormServizio implements OnInit {
  
  tipologieGlobaliDB: string[] = []; 
  isModifica: boolean = false;
  idServizioEsistente?: number;
  usernameDogsitter: string = '';
  categoriaSelezionata: string = '';
  durata: number = 0;
  prezzoListino: number = 0;

  provenienza: string = ''; 


  constructor(
    private router: Router, 
    private servizioService: ServizioService,
    private route: ActivatedRoute
  ) {
    
    const state = history.state;

    
      if (state.sitterUsername) {

        this.usernameDogsitter = state.sitterUsername; 
        
        const daModificare: ServizioOfferto = state.servizioDaModificare;
        if (daModificare) {
          this.isModifica = true;
          this.idServizioEsistente = daModificare.idServizio;
          this.categoriaSelezionata = daModificare.categoria;
          this.durata = daModificare.durata;
          this.prezzoListino = daModificare.prezzoListino || 0; // Carica anche il prezzo!
        }
      }
    
  }

  ngOnInit(): void {

      if (this.route.snapshot.queryParamMap.has('provenienza')) {
        this.provenienza = this.route.snapshot.queryParamMap.get('provenienza') || '';
      }

      // Carichiamo categorie disponibili dal backend
      this.servizioService.getCategorieDisponibili().subscribe({
        next: (categorie) => this.tipologieGlobaliDB = categorie,
        error: (err) => console.error('Errore nel caricamento delle categorie dal DB', err)
      });
      
    
  }



   // Registra il nuovo servizio offerto
   salvaServizioOfferto(): void {

    if (!this.categoriaSelezionata || !this.durata || this.durata <= 0 || this.prezzoListino <= 0) {
      alert('Compila tutti i campi con valori validi!');
      return;
    }

    // payload da inviare al backend
    const payload: ServizioOfferto = {

      idServizio: this.idServizioEsistente,
      usernameDogsitter: this.usernameDogsitter,
      categoria: this.categoriaSelezionata,
      durata: this.durata,
      prezzoListino: this.prezzoListino
    
    };

    if (this.isModifica && this.idServizioEsistente) {

      
      this.servizioService.modificaServizio(payload).subscribe({
        next: () => {
          if (this.provenienza === 'lista-cdc') {
            this.router.navigate(['/profilo'], { queryParams: { username: this.usernameDogsitter, provenienza: 'lista-cdc', ruolo: 'dogsitter' } });
          }
          else {
            this.router.navigate(['/home-dogsitter/profilo'],{ queryParams: { username: this.usernameDogsitter, ruolo: 'dogsitter' } });
          }
        },
        error: () => alert('Errore durante la modifica del servizio')
      });
    } else {
      
      this.servizioService.aggiungiServizio(payload).subscribe({
        next: () => {
          if (this.provenienza === 'lista-cdc') {
            this.router.navigate(['/profilo'], { queryParams: { username: this.usernameDogsitter, provenienza: 'lista-cdc', ruolo: 'dogsitter' } });
          }
          else {
            this.router.navigate(['/home-dogsitter/profilo'],{ queryParams: { username: this.usernameDogsitter, ruolo: 'dogsitter' } });
          }
        },
        error: () => alert('Errore durante il salvataggio del servizio')
      });
    }
  }

  // Annulla le modifiche in corso e chiude la form
  annulla(): void {
    
      if (this.provenienza === 'lista-cdc') {
        this.router.navigate(['/profilo'], { queryParams: { username: this.usernameDogsitter, provenienza: 'lista-cdc', ruolo: 'dogsitter' } });
      }
      else {
      this.router.navigate(['/home-dogsitter/profilo'],{ queryParams: { username: this.usernameDogsitter, ruolo: 'dogsitter' } });
      }
  }
}