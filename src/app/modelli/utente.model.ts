export interface Utente {

  
  username: string;
  nomeBattesimo: string;
  cognome: string;
  cap: string;
  nCivico: string;
  provincia: string;
  via: string;
  nTel: string;
  password?: string;

  // Token JWT ricevuto dal backend dopo login/registrazione
  token?: string;

  ruolo?: 'cliente' | 'dogsitter' | 'amministratore';

}