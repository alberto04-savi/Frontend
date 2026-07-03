import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Cane } from '../../../../modelli/cane.model';
import { CaneService } from '../../../../servizi/cane.service';



@Component({
  selector: 'app-form-cane',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-cane.html',
  styleUrl: './form-cane.css'
})
export class FormCane implements OnInit {
  
  inModifica: boolean = false;
  Microchip_cani: string[] = [];
  cane: Cane = { nMicrochip: '', nome: '', razza: '', taglia: 'Media', dataNascita: '', noteComportamento: '', usernameCliente: '' };

  provenienza: string = ''; // Variabile per salvare la provenienza

  constructor(private router: Router, private caneService: CaneService,private route: ActivatedRoute) {}

  ngOnInit(): void {

      const stato = history.state;

        // Modalità modifica: precompila il form con i dati esistenti
        if (stato?.cane) {

          this.cane = { ...stato.cane };
          this.inModifica = true;

        } else if (stato?.usernameProprietario) {

          // imposta il proprietario
          this.cane.usernameCliente = stato.usernameProprietario;
        }
      
      // Carica i microchip dei cani del cliente per evitare duplicati
      if (this.cane.usernameCliente) {
          
        this.caneService.getMicrochipByCliente(this.cane.usernameCliente).subscribe({
            next: (data) => {
              this.Microchip_cani = data;
            },
            error: (err) => console.error('Errore caricamento microchip cani', err)
          });
      }

      if (this.route.snapshot.queryParamMap.has('provenienza')) {
        this.provenienza = this.route.snapshot.queryParamMap.get('provenienza') || '';
      }

  }
  
  // Salva le modifiche effettuate
  salva(): void {
    
    if (!this.cane.nome || !this.cane.nMicrochip || !this.cane.dataNascita) {
      alert('I campi Nome, Microchip e Data di Nascita sono obbligatori!');
      return;
    }   

    if (this.cane.nMicrochip.length !== 15 || !/^\d{15}$/.test(this.cane.nMicrochip)) {
      alert('Il numero di microchip deve contenere esattamente 15 cifre numeriche!');
      return;
    }

    if (!this.dataNascitaValida) {
      alert('La data di nascita non è valida o è nel futuro.');
      return;
    }

    if (this.inModifica) {
      
      
      this.caneService.update(this.cane).subscribe({
        next: () => {
          alert('Modifiche salvate con successo!');

          if (this.provenienza === 'lista-cdc') {

            this.router.navigate(['profilo'], { queryParams: { provenienza: 'lista-cdc',username: this.cane.usernameCliente , ruolo: 'cliente' } }); 

          } else {

            this.router.navigate(['/home-cliente/profilo'],{queryParams: { username: this.cane.usernameCliente , ruolo: 'cliente' } }); // Torna al profilo
          }

        },
        error: (err) => console.error('Errore modifica:', err)
      });
    } else {
      
      if (this.Microchip_cani.includes(this.cane.nMicrochip)) {
          alert('Un cane con questo microchip è già registrato!');
          return;
        }
      
      
      this.caneService.create(this.cane).subscribe({
        next: () => {
          alert('Nuovo cane registrato!');

          if (this.provenienza === 'lista-cdc') {

            // torno al profilo cliente 
            this.router.navigate(['profilo'], { queryParams: { provenienza: 'lista-cdc',username: this.cane.usernameCliente , ruolo: 'cliente' } }); 

          } else {

            this.router.navigate(['/home-cliente/profilo'],{queryParams: { username: this.cane.usernameCliente , ruolo: 'cliente' } }); 
          }
        },
        error: (err) => console.error('Errore creazione:', err)
      });
    }
  }
 
 
  // Annulla le modifiche in corso e chiude la form
  annulla(): void {

    if (this.provenienza === 'lista-cdc') {
      // torno al profilo cliente del cane modificato, passando l'username del cliente e il ruolo come query params
      this.router.navigate(['profilo'], { queryParams: { provenienza: 'lista-cdc',username: this.cane.usernameCliente , ruolo: 'cliente' } }); 
    } else {

        this.router.navigate(['/home-cliente/profilo'],{queryParams: { username: this.cane.usernameCliente , ruolo: 'cliente' } });
    }
  }


  //  Validazione data di nascita 
  get dataNascitaValida(): boolean {

    const d = this.cane.dataNascita;
    if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;  // formato YYYY-MM-DD

    // new Date(d) crea un oggetto Date dalla stringa, 
    // new Date() senza argomenti crea un oggetto Date con la data e ora correnti
    return new Date(d) <= new Date();                          // non nel futuro
  }
}