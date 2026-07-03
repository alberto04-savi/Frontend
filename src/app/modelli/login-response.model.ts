// Per rappresentare la risposta del backend dopo un login o una registrazione
export interface LoginResponse {
  token: string;
  username: string;
  ruolo?: string;
}
