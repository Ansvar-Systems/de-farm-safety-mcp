import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Germany Farm Safety MCP',
    description:
      'Arbeitsschutz und Unfallverhuetung in der deutschen Landwirtschaft via MCP. ' +
      'Deckt Maschinensicherheit, Tierhaltung, Gefahrstoffe (GefStoffV), Absturzgefahr, ' +
      'Alleinarbeit, Jugendarbeitsschutz, Meldepflichten (SVLFG) und Gefaehrdungsbeurteilung (ArbSchG §5) ab.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'SVLFG (Sozialversicherung fuer Landwirtschaft, Forsten und Gartenbau)',
      'ArbSchG (Arbeitsschutzgesetz) — Gefaehrdungsbeurteilung',
      'DGUV (Deutsche Gesetzliche Unfallversicherung) — Vorschriften und Regeln',
      'BetrSichV (Betriebssicherheitsverordnung) — Maschinen und Prueffristen',
      'GefStoffV (Gefahrstoffverordnung) — Gefahrstoffe und Betriebsanweisung',
      'VSG 1.1-4.1 (Unfallverhuetungsvorschriften SVLFG)',
      'BAuA (Bundesanstalt fuer Arbeitsschutz und Arbeitsmedizin)',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/Ansvar-Systems/de-farm-safety-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
