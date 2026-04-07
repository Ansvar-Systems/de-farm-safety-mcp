export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Dieser Server stellt allgemeine Orientierungshilfen auf Grundlage von Veroeffentlichungen der SVLFG, ' +
  'DGUV, BAuA und geltender Arbeitsschutzgesetze bereit. Er stellt keine Rechtsberatung dar. ' +
  'Konsultieren Sie stets die aktuellen Vorschriften, Ihre eigene Gefaehrdungsbeurteilung und ' +
  'qualifizierte Fachkraefte fuer Arbeitssicherheit. Im Notfall: 112.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.svlfg.de/praevention',
    copyright: 'Daten auf Grundlage von SVLFG-, DGUV-, BAuA- und Gesetzestexten. Server: Apache-2.0 Ansvar Systems.',
    server: 'de-farm-safety-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
