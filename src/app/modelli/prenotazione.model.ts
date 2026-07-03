export interface Prenotazione {
  

  // Questi campi sono sempre presenti, indipendentemente dalla categoriaPrenotazione
  codiceId: number;
  prezzoPattuito: number;
  categoriaPrenotazione: string; // 'lezione' (Campo) oppure 'dogsitter' (Dogsitter)
  nMicrochip: string;
  dataSvolgimento: string;
  oraSvolgimento: string;

 
  //campo ha questi dati in più:  
  nomeCampo?: string; // presente solo se categoriaPrenotazione è 'lezione'
  CategoriaLezione?: string; // presente solo se categoriaPrenotazione è 'lezione', altrimenti è null
  
  //dogsitter ha questi dati in più:
  categoriaServizio?: string; // presente solo se categoriaPrenotazione è 'dogsitter', altrimenti è null
  idServizio?: number; // presente solo se categoriaPrenotazione è 'dogsitter', altrimenti è null
  usernameDogsitter?: string;

  //dati usati generali delle prenotazioni:
  usernameCliente?: string; // per poter associare prenotazione a un cliente
  nomeCane?: string; // perchè cosi il cliente può filtrare per nome del cane quando cerca le prenotazioni 

}


