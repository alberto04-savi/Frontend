import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Il decoratore @Component indica ad Angular che questa classe è un Componente.
// standalone:true è implicito
@Component({
  selector: 'app-root', // (<app-root>)
  imports: [RouterOutlet], // RouterOutlet permette di cambiare il contenuto della pagina dinamicamente
  templateUrl: './app.html', 
  styleUrl: './app.css'      
})
export class App {
}
