export interface Avtalemal {
  navn: string;
  dokumentUrl: string;
  publisert: string;
  uuid: string;
  previewUrl: string;
  exampleUrl: string;
  replacementMap: Record<string, Replacement>;
  publishedTo: Array<string>,
  ingress: string;
  ingressNynorsk: string;
  kvitteringstekst: string;
  kvitteringstekstNynorsk: string;
}

export enum Replacement {
  KOMMUNENAVN = "KOMMUNENAVN",
  KOMMUNEORGNR = "KOMMUNEORGNR",
  DATO = "DATO",
}
