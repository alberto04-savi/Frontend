import { Routes } from '@angular/router';
import { Profilo } from './features/shared/profilo/profilo';
import { HomeDogsitter } from './features/home-dogsitter/home-dogsitter';
import { HomeCliente } from './features/home-cliente/home-cliente';
import { Prenotazioni } from './features/shared/prenotazioni/prenotazioni';
import { Recensioni } from './features/home-cliente/recensioni/recensioni';
import { HomeAmministratore } from './features/home-amministratore/home-amministratore';
import { ListaCDC } from './features/home-amministratore/lista-cdc/lista-cdc';
import { FormCane } from './features/shared/profilo/form-cane/form-cane';
import { FormServizio } from './features/shared/profilo/form-servizio/form-servizio';
import { SceltaRuolo } from './features/login/scelta-ruolo';
import { Login } from './features/login/login';
import { RegistrazioneCliente } from './features/login/registrazione-cliente/registrazione-cliente';
import { RegistrazioneDogsitter } from './features/login/registrazione-dogsitter/registrazione-dogsitter';
import { RegistrazioneCampo } from './features/home-amministratore/registrazione-campo/registrazione-campo';
import { InfoDogsitter } from './features/home-cliente/info-dogsitter/info-dogsitter';
import { InfoCampo } from './features/home-cliente/info-campo/info-campo';
import { AddRecensione } from './features/home-cliente/recensioni/add-recensione/add-recensione';
import { ModificaPren } from './features/shared/prenotazioni/modifica-pren/modifica-pren';

export const routes: Routes = [
  

  { path: '', redirectTo: 'scelta-ruolo', pathMatch: 'full' },
  {path: 'profilo', component: Profilo},
  {path: 'form-servizio', component: FormServizio},
  {path: 'form-cane', component: FormCane},

  // --- AUTENTICAZIONE ---
  { path: 'scelta-ruolo', component: SceltaRuolo },
  { path: 'login', component: Login },
  { path: 'registrazione/cliente', component: RegistrazioneCliente },
  { path: 'registrazione/dogsitter', component: RegistrazioneDogsitter },
  { path: 'registrazione/campo', component: RegistrazioneCampo },

  // --- CLIENTE ---
  {
    path: 'home-cliente',
    component: HomeCliente,
    children: [
      { path: 'prenotazioni', component: Prenotazioni },
      { path: 'profilo', component: Profilo },
      { path: 'form-cane', component: FormCane },
      // parametro di rotta
      { path: 'info-dogsitter/:username', component: InfoDogsitter },
      { path: 'info-campo/:nome', component: InfoCampo },
      { path: 'recensioni', component: Recensioni },
      { path: 'add-recensione', component: AddRecensione },
      { path: 'modifica-prenotazione/:id', component: ModificaPren},
    ]
  },

  // --- DOGSITTER ---
  {
    path: 'home-dogsitter',
    component: HomeDogsitter,
    children: [
      { path: '', redirectTo: 'prenotazioni', pathMatch: 'full' },

      // tolto qui data
      { path: 'prenotazioni', component: Prenotazioni },
      { path: 'modifica-prenotazione/:id', component: ModificaPren },
      { path: 'profilo', component: Profilo },
      { path: 'form-servizio', component: FormServizio },
    ]
  },

  // --- AMMINISTRATORE ---
  { path: 'home-amministratore', component: HomeAmministratore },
  { path: 'home-amministratore/lista-cdc', component: ListaCDC },
  { path: 'home-amministratore/registrazione-campo', component: RegistrazioneCampo },
  

  { path: '**', redirectTo: 'scelta-ruolo' },
  ];