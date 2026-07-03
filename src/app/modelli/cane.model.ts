export interface Cane {
  nMicrochip: string;
  nome: string;
  razza: string;
  taglia: string;
  dataNascita: string;
  noteComportamento: string;
  usernameCliente: string;       // FK → CLIENTE
}