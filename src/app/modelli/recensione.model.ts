export interface Recensione {
  usernameCliente: string;       // FK → CLIENTE
  usernameDogsitter: string;     // FK → DOG_SITTER
  voto: number;
  commento: string;
  data: string;
}