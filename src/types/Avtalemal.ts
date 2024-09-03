export interface Avtalemal {
  navn: string;
  dokumentUrl: string;
  publisert: string;
  uuid: string;
  previewUrl: string;
  exampleUrl: string;
  replacementMap: Record<string, Replacement>;
  publishedTo: Array<string>
}

export enum Replacement {
  KOMMUNENAVN = "KOMMUNENAVN",
  KOMMUNEORGNR = "KOMMUNEORGNR",
  DATO = "DATO",
}
