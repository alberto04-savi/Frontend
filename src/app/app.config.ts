import { ApplicationConfig, provideBrowserGlobalErrorListeners , provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { routes } from './app.routes';
import { provideHttpClient,withInterceptors } from '@angular/common/http';


export const appConfig: ApplicationConfig = {

  // qui mettiamo servizi e logiche che devono essere disponibili tramite Dependency Injection (DI) in tutta l'applicazione
  // questo array di providers è fondamentale per abilitare funzionalità chiave di 
  // Angular come il routing e le chiamate HTTP. se non avessi messo 
  // provideHttpClient() qui, qualsiasi componente o servizio che tenta di iniettare HttpClient 
  // fallirebbe con un errore di runtime,perchè grazie a questo gli spiego come creare un'istanza di HttpClient quando 
  // qualcuno lo richiede tramite Dependency Injection
  providers: [

    // Un Provider è un'istruzione che dice ad Angular:
    // "Ehi, se un componente ti chiede questo servizio, ecco le istruzioni su come crearlo o dove andarlo a prendere".

    // Iniettiamo globalmente i listener degli errori del browser
    provideBrowserGlobalErrorListeners(),

    // Riattiva la change detection basata su zone.js (comportamento "classico")
    // Necessario perché da Angular 21 il default è zoneless, e zone.js nei
    // polyfills da solo non basta più: va dichiarato esplicitamente qui.
    provideZoneChangeDetection({ eventCoalescing: true }),

    
    // Inizializziamo il motore del router di Angular passandogli come argomento l'array routes che abbiamo importato.
    // Grazie a questa riga, tag come <router-outlet> e direttive come routerLink funzioneranno correttamente in ogni
    // parte del tuo sito
    provideRouter(routes),
    
    // Forniamo HttpClient con l'interceptor di autenticazione
    // L'interceptor aggiunge automaticamente il token JWT a ogni richiesta
    // e gestisce i 401 (token scaduto) con logout automatico
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};



