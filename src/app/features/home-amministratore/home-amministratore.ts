import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../servizi/session.service';



@Component({

  selector: 'app-home-amministratore',
  imports: [CommonModule],
  templateUrl: './home-amministratore.html',
  styleUrl: './home-amministratore.css',

})
export class HomeAmministratore {

  // Dependency Injection(DI)
  constructor(
    private router: Router,
    private session: SessionService
  ) {}


  navigateTo(tipo: string): void {
    this.router.navigate(['/home-amministratore/lista-cdc'], { queryParams: { tipo: tipo } });
  }

  // Logout
  logout(): void {
    this.session.clearSession();
    this.router.navigate(['/scelta-ruolo']);
  }

}