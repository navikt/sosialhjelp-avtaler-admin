export interface Avtalemal {
  navn: string;
  dokumentUrl: string;
  publisert: string;
  uuid: string;
  previewUrl: string;
  replacementMap: Record<string, Replacement>;
}

export enum Replacement {
  KOMMUNENAVN = "KOMMUNENAVN",
  KOMMUNEORGNR = "KOMMUNEORGNR",
  DATO = "DATO",
}
