import { Utente } from './utente.model';

export interface Dogsitter extends Utente {
  maxCani: number;
  giorniDisponibili: string[];   // tabella GIORNI_DOG_SITTER
  taglieCani: string[];          // tabella TAGLIE_CANI
}