import { Component } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-scelta-ruolo',
  imports: [],
  templateUrl: './scelta-ruolo.html',
  styleUrl: './scelta-ruolo.css',
})
export class SceltaRuolo {

  constructor(private router: Router) {}

  navigateTo(ruolo: string): void {

    this.router.navigate(['/login'], { queryParams: { ruolo: ruolo } });
  }

}