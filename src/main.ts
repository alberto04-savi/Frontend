import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Il file main.ts è il punto di ingresso (entry point) dell'intera applicazione Angular.
// Quando il browser carica il sito, questo è il primo codice TypeScript che viene eseguito.
// dice di avviare la componente App con al configurazione appConfig, che contiene i provider globali (routing, HttpClient, ecc.)
bootstrapApplication(App, appConfig)
  // Se c'è un errore durante l'avvio, lo stampiamo nella console del browser
  .catch((err) => console.error(err));
