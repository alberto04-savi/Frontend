import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Cane } from '../../../../modelli/cane.model';
import { Cliente } from '../../../../modelli/cliente.model';
import { CaneService } from '../../../../servizi/cane.service';

@Component({
  selector: 'app-profilo-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profilo-cliente.html',
  styleUrl: './profilo-cliente.css'
})
export class ProfiloCliente implements OnInit {

  // Dati cliente direttamente dal componente padre
  @Input() cliente!: Cliente;
  @Input() provenienza: string = '';

  caniUtente: Cane[] = [];

  caricamento = false;
  errore: string | null = null;

  constructor(
    private router: Router,
    private caneService: CaneService
  ) { }


  ngOnInit(): void {

    if (this.cliente) {
      this.caricaCani();
    }

  }
   
  // Recupera i cani associati all'utente
  private caricaCani(): void {

    this.caricamento = true;
    this.errore = null;

    
    this.caneService.getByCliente(this.cliente.username).subscribe({
      next: (cani) => {
        this.caniUtente = cani;
        this.caricamento = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei cani:', err);
        this.errore = 'Impossibile caricare i cani. Riprova più tardi.';
        this.caricamento = false;
      }
    });
  }

  // Naviga verso il form per l'inserimento di un cane
  vaiAFormCane(caneDaModificare?: Cane): void {

    // MODIFICA CANE
    if (caneDaModificare) {
      
      if(this.provenienza === 'lista-cdc') {
        this.router.navigate(['form-cane'], { state: { cane: caneDaModificare} ,queryParams: { provenienza: 'lista-cdc' } });
      }
      else {

        this.router.navigate(['/home-cliente/form-cane'], { state: { cane: caneDaModificare } });

      }
      
    } else {

      // NUOVO CANE: solo l'username del padrone per sapere a chi associarlo

      if(this.provenienza === 'lista-cdc') {
        
        this.router.navigate(['form-cane'], { state: { usernameProprietario: this.cliente.username },queryParams: { provenienza: 'lista-cdc' } });
      }
      else {

        this.router.navigate(['/home-cliente/form-cane'], { state: { usernameProprietario: this.cliente.username } });
      }
      
    }
  }
  

  // Elimina il profilo di un cane associato
  eliminaCane(nMicrochip: string): void {
    if (!confirm('Sei sicuro di voler rimuovere questo cane dalla tua lista anagrafica?')) return;

    this.caneService.delete(nMicrochip).subscribe({
      
      next: () => {

        // Aggiorna la lista locale
        this.caniUtente = this.caniUtente.filter(c => c.nMicrochip !== nMicrochip);
        console.log(`Cane con microchip ${nMicrochip} eliminato.`);
      
      },
      error: (err) => {
        console.error('Errore nell\'eliminazione del cane:', err);
        alert('Errore durante l\'eliminazione. Riprova più tardi.');
      }
    });
  }
  
}