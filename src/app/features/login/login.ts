import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SessionService } from '../../servizi/session.service';
import { UtenteService } from '../../servizi/utente.service';
import { LoginResponse } from '../../modelli/login-response.model';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {

  // Proprietà legate ai campi del form tramite [(ngModel)].
  username: string = '';
  password: string = '';

  errore: string = '';

  // Ruolo passato da scelta-ruolo
  ruolo: string = '';


  constructor(
    private session: SessionService,     
    private router: Router,              
    private route: ActivatedRoute,       
    private userService: UtenteService   
  ) {}


  ngOnInit(): void {
    
    this.ruolo = this.route.snapshot.queryParamMap.get('ruolo') ?? '';

  }


  //  Navigazione home per ruolo
  private navigaHome(): void {

    // Record<string, string> tipo TypeScript:chiave valore.
    const homeMap: Record<string, string> = {
      cliente:        '/home-cliente',
      dogsitter:      '/home-dogsitter',
      amministratore: '/home-amministratore',
    };

    
    // ??  evita che l'app vada in crash.
    const dest = homeMap[this.ruolo] ?? '/home-cliente';

    // Naviga verso la home giusta.
    this.router.navigate([dest]);
  }


    
  login(): void {

    // Resettiamo errore di un tentativo precedente.
    this.errore = '';
    
    
    this.userService.login(this.username, this.password,this.ruolo).subscribe({

      next: (res: LoginResponse) => {

        // risposta del backend: { token, username, ruolo }
        if (res.username && res.token ) {

          
          this.session.setToken(res.token);

          const userRuolo = res.ruolo || this.ruolo;

          // usato in altri punti
          this.ruolo = userRuolo;

          // Salva username e ruolo 
          this.session.setLoggedUser(res.username, userRuolo);


          // Naviga verso la home corretta 
          this.navigaHome();

        } else {
          
          this.errore = 'Risposta di autenticazione anomala, non valida. Token o username mancante.';
        }
      },

      error: (err) => {
        
        console.error('Login fallito', err);

        // Credenziali invalide
        if (err.status === 401 ) {
          
          this.errore = 'Username o password non corretti';
        }
         else {
          // Errore generico
          this.errore = 'Login fallito. Controlla i dati e riprova.';
        }
      },
    });
  }


  // Registrazione 
  vaiRegistrazione(): void {


    // Se non c'è un ruolo .
    if (!this.ruolo) return;


    //   ['registrazione', 'cliente']   → /registrazione/cliente
    //   ['registrazione', 'dogsitter'] → /registrazione/dogsitter
    this.router.navigate(['/registrazione', this.ruolo]);

  }

}