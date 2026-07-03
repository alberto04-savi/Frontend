import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../servizi/session.service';

@Component({
  selector: 'app-home-dogsitter',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home-dogsitter.html',
  styleUrl: './home-dogsitter.css',
})
export class HomeDogsitter implements OnInit {

  nomeDogsitter: string | undefined = '';
  sidebarAperta: boolean = true;

  constructor(
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit(): void {

    const utente = this.session.getLoggedUser();
    
    if (utente) {

      this.nomeDogsitter = utente.username;
    }
  }

  // Gestisce la disconnessione e pulizia della sessione
  logout(): void {

    this.session.clearSession();
    this.router.navigate(['/']);
  }

  // Apre o chiude la barra laterale
  toggleSidebar(): void {
    this.sidebarAperta = !this.sidebarAperta;
  }
}