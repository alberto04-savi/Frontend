export interface Lezione {
  
  //queste tre formano la chiave primaria composta
  nomeCampo: string;             // FK → CAMPO_ADDESTRAMENTO
  ora: string;            //PK
  data: string;          //PK
  
  tipologia: string;
  costo: number;
  maxPartecipanti: number;
}