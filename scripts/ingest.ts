/**
 * Germany Farm Safety MCP — Data Ingestion Script
 *
 * Sources:
 *   - SVLFG (Sozialversicherung fuer Landwirtschaft, Forsten und Gartenbau) — Praevention, Unfallstatistik
 *   - ArbSchG (Arbeitsschutzgesetz) — Gefaehrdungsbeurteilung, Arbeitgeberpflichten
 *   - DGUV (Deutsche Gesetzliche Unfallversicherung) — Vorschriften, Regeln, Informationen
 *   - BetrSichV (Betriebssicherheitsverordnung) — Maschinen, Prueffristen
 *   - GefStoffV (Gefahrstoffverordnung) — Gefahrstoffe, Betriebsanweisung, TRGS
 *   - BAuA (Bundesanstalt fuer Arbeitsschutz und Arbeitsmedizin) — Technische Regeln
 *   - VSG (Unfallverhuetungsvorschriften) der SVLFG — Landwirtschaft, Tierhaltung, Forsten
 *   - JArbSchG (Jugendarbeitsschutzgesetz) — Jugendliche auf dem Betrieb
 *   - MuSchG (Mutterschutzgesetz) — Schwangere auf dem Betrieb
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Helper: batch insert
// ---------------------------------------------------------------------------
function insertSafetyGuidance(rows: {
  topic: string;
  machine_type: string | null;
  species: string | null;
  hazards: string;
  control_measures: string;
  legal_requirements: string;
  ppe_required: string;
  regulation_ref: string;
}[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.topic, r.machine_type, r.species, r.hazards, r.control_measures, r.legal_requirements, r.ppe_required, r.regulation_ref);
  }
}

function insertChildrenRules(rows: {
  age_group: string;
  activity: string;
  permitted: number;
  conditions: string;
  regulation_ref: string;
}[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO children_rules (age_group, activity, permitted, conditions, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.age_group, r.activity, r.permitted, r.conditions, r.regulation_ref);
  }
}

function insertReportingRequirements(rows: {
  incident_type: string;
  reportable: number;
  deadline: string;
  notify: string;
  method: string;
  record_retention_years: number;
  regulation_ref: string;
}[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO reporting_requirements (incident_type, reportable, deadline, notify, method, record_retention_years, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.incident_type, r.reportable, r.deadline, r.notify, r.method, r.record_retention_years, r.regulation_ref);
  }
}

function insertCoshhGuidance(rows: {
  substance_type: string;
  activity: string;
  assessment_required: number;
  ppe: string;
  storage_requirements: string;
  disposal_requirements: string;
  regulation_ref: string;
}[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO coshh_guidance (substance_type, activity, assessment_required, ppe, storage_requirements, disposal_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.substance_type, r.activity, r.assessment_required, r.ppe, r.storage_requirements, r.disposal_requirements, r.regulation_ref);
  }
}

function insertRiskAssessmentTemplates(rows: {
  activity: string;
  hazards: string;
  controls: string;
  residual_risk: string;
  review_frequency: string;
}[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO risk_assessment_templates (activity, hazards, controls, residual_risk, review_frequency, jurisdiction)
     VALUES (?, ?, ?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.activity, r.hazards, r.controls, r.residual_risk, r.review_frequency);
  }
}

function insertSearchIndex(rows: { title: string; body: string; topic: string }[]) {
  const stmt = db.instance.prepare(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, 'DE')`
  );
  for (const r of rows) {
    stmt.run(r.title, r.body, r.topic);
  }
}

// ---------------------------------------------------------------------------
// 1. SAFETY GUIDANCE — Maschinensicherheit
// ---------------------------------------------------------------------------
const machineSafety = [
  {
    topic: 'Traktor — Ueberrollschutz und Sicherheitsgurt',
    machine_type: 'tractor',
    species: null,
    hazards: 'Ueberrollen und Umkippen auf Haengen, weichem oder unebenem Gelaende. Haeufigste toedliche Unfallursache in der deutschen Landwirtschaft (SVLFG-Unfallstatistik: jaehrlich ca. 20 toedliche Arbeitsunfaelle, davon ein Grossteil durch Traktorunfaelle).',
    control_measures: 'Ueberrollschutzstruktur (ROPS) an allen Traktoren vorgeschrieben. Sicherheitsgurt anlegen bei montiertem ROPS. Hanglagen ueber 30% vermeiden. Taegliche Kontrolle von Bremsen, Lenkung und Bereifung. Geschwindigkeitsanpassung an Gelaende und Beladung.',
    legal_requirements: 'BetrSichV (Betriebssicherheitsverordnung): sichere Bereitstellung und Benutzung von Arbeitsmitteln. Maschinenrichtlinie 2006/42/EG: CE-Kennzeichnung Pflicht. DGUV Vorschrift 1 (Grundsaetze der Praevention). VSG 3.1 (Technische Arbeitsmittel) der SVLFG.',
    ppe_required: 'Sicherheitsgurt (Pflicht bei montiertem ROPS), Sicherheitsschuhe S3',
    regulation_ref: 'BetrSichV; Maschinenrichtlinie 2006/42/EG; DGUV Vorschrift 1; VSG 3.1 SVLFG',
  },
  {
    topic: 'Traktor — Zapfwelle (PTO) und Gelenkwelle',
    machine_type: 'tractor',
    species: null,
    hazards: 'Erfassen und Aufwickeln durch rotierende Zapfwelle oder Gelenkwelle. Weite Kleidung, lange Haare, Schmuck und offene Jacken erhoehen das Risiko erheblich. Gelenkwellenunfaelle sind haeufig toedlich.',
    control_measures: 'Schutzabdeckung der Zapfwelle muss immer angebracht sein. Gelenkwellenschutz (Schutzrohr mit Sicherungskette) vorgeschrieben. Niemals ueber eine rotierende Zapfwelle steigen. Motor abstellen vor jeder Wartungsarbeit. Eng anliegende Arbeitskleidung tragen.',
    legal_requirements: 'BetrSichV: Schutz vor beweglichen Teilen. Maschinenrichtlinie 2006/42/EG Anhang I. VSG 3.1 SVLFG: technische Arbeitsmittel muessen mit Schutzvorrichtungen versehen sein. DGUV Regel 114-017: Fahrzeuge und Maschinen.',
    ppe_required: 'Eng anliegende Arbeitskleidung, kein Schmuck, Haare zusammengebunden',
    regulation_ref: 'BetrSichV; Maschinenrichtlinie 2006/42/EG Anhang I; VSG 3.1 SVLFG; DGUV Regel 114-017',
  },
  {
    topic: 'Maehdrescher — Schutzvorrichtungen und Notabschaltung',
    machine_type: 'maehdrescher',
    species: null,
    hazards: 'Schnitt- und Quetschverletzungen durch Schneidwerk und Dreschorgane. Strassenverkehrsunfaelle beim Transport. Brandgefahr durch Staub- und Ernterueckstaende. Steinwurf.',
    control_measures: 'Schutzvorrichtungen (Verkleidungen, Abdeckungen) muessen in Position sein. Not-Aus-Schalter zugaenglich und getestet. Sichere Auf- und Abstiege nutzen. Beleuchtung und Kenntlichmachung fuer den Strassenverkehr. Taegliche Reinigung zur Brandverhuetung.',
    legal_requirements: 'BetrSichV: sichere Bereitstellung von Arbeitsmitteln. StVO/StVZO: Kenntlichmachung ueberbreiter Fahrzeuge. VSG 3.1 SVLFG. Maschinenrichtlinie 2006/42/EG.',
    ppe_required: 'Sicherheitsschuhe S3, Gehoerschutz ab 80 dB(A), eng anliegende Kleidung',
    regulation_ref: 'BetrSichV; StVO/StVZO; VSG 3.1 SVLFG; Maschinenrichtlinie 2006/42/EG',
  },
  {
    topic: 'Teleskoplader und Radlader — Standsicherheit und Quetschgefahr',
    machine_type: 'teleskoplader',
    species: null,
    hazards: 'Umkippen bei Ueberladung oder auf unebenem Gelaende. Quetschgefahr fuer umstehende Personen. Herunterfallende Last. Mangelnde Sicht bei angehobener Last.',
    control_measures: 'Befaehigungsnachweis (DGUV Grundsatz 308-009) fuer den Fahrer. Jaehrliche Pruefung durch befaehigte Person (BetrSichV §14). Tragfaehigkeit nicht ueberschreiten — Lastdiagramm beachten. Sicherheitsgurt anlegen. Keine Personen unter angehobener Last.',
    legal_requirements: 'BetrSichV §12: Pflicht zur Unterweisung. BetrSichV §14: wiederkehrende Pruefung. DGUV Vorschrift 68: Flurfoerderzeuge. DGUV Grundsatz 308-009: Fahrerbefaehigung.',
    ppe_required: 'Sicherheitsgurt, Sicherheitsschuhe S3, Schutzhelm (bei Herabfallgefahr)',
    regulation_ref: 'BetrSichV §12, §14; DGUV Vorschrift 68; DGUV Grundsatz 308-009; VSG 3.1 SVLFG',
  },
  {
    topic: 'Pflanzenschutzspritze — Geraetekontrolle und Sicherheit',
    machine_type: 'pflanzenschutzspritze',
    species: null,
    hazards: 'Exposition gegenueber Pflanzenschutzmitteln durch Hautkontakt, Einatmen oder Verschlucken. Quetschgefahr durch Maschinenteile. Umweltkontamination bei Leckagen. Abdrift bei unsachgemaesser Anwendung.',
    control_measures: 'Sachkundenachweis (Pflanzenschutz-Sachkundenachweis, Scheckkarte) Pflicht fuer alle Anwender. Geraetekontrolle der Pflanzenschutzspritze alle 3 Jahre (Plakettenpflicht). Duesenauswahl zur Abdriftminimierung. Sicherheitsdatenblatt vor Anwendung lesen.',
    legal_requirements: 'PflSchG §9: Sachkundenachweis Pflicht. PflSchG §16: Pflanzenschutzgeraete-Kontrolle. Pflanzenschutz-Sachkundeverordnung: Fortbildung alle 3 Jahre. GefStoffV: Betriebsanweisung fuer Pflanzenschutzmittel.',
    ppe_required: 'Chemikalienschutzhandschuhe (EN 374), Schutzanzug Typ 4/5/6, Atemschutz (A2P3), Gesichtsschutz',
    regulation_ref: 'PflSchG §9, §16; Pflanzenschutz-Sachkundeverordnung; GefStoffV; TRGS 400',
  },
  {
    topic: 'Motorsaege — PSA, Ausbildung und Wartung',
    machine_type: 'motorsaege',
    species: null,
    hazards: 'Schnittverletzungen durch Rueckschlag (Kickback). Herabfallende Aeste oder Baeume. Gehoerschaeden bei laengerem Einsatz (>100 dB). Hand-Arm-Vibrationssyndrom. Einklemmen unter Holz.',
    control_measures: 'Ausbildung nach DGUV Information 214-059 (Motorsaegen-Grundkurs) oder AS-Baum-Schein erforderlich. Taegliche Kontrolle von Kettenspannung, Kettenbremse und Krallenanschlag. Sichere Faelltechniken (Fallkerb, Bruchleiste). Niemals allein bei Faellarbeiten. Arbeitsbereich absperren.',
    legal_requirements: 'VSG 4.1 SVLFG (Forsten): Anforderungen an Forstarbeiten und Ausbildung. DGUV Regel 114-018: Waldarbeit. LaeermVibrationsArbSchV: Grenzwert 5 m/s2 Hand-Arm-Vibration. Maschinenrichtlinie 2006/42/EG.',
    ppe_required: 'Schnittschutzhose (EN 381-5 Klasse 1 oder 2), Forsthelm mit Visier und Gehoerschutz, Schnittschutzstiefel (EN ISO 17249), Schnittschutzhandschuhe',
    regulation_ref: 'VSG 4.1 SVLFG; DGUV Information 214-059; DGUV Regel 114-018; LaeermVibrationsArbSchV; EN 381-5',
  },
  {
    topic: 'Landmaschinen — CE-Konformitaet und Prueffristen',
    machine_type: 'landmaschinen',
    species: null,
    hazards: 'Einsatz nicht konformer Maschinen. Fehlende Wartung. Fehlende oder beschaedigte Schutzvorrichtungen (Verkleidungen, Not-Aus-Schalter). Unsachgemaesse Umbauten.',
    control_measures: 'CE-Konformitaet vor Inbetriebnahme pruefen. Wiederkehrende Pruefung (BetrSichV §14) gemaess Prueffristen durch befaehigte Person oder zugelassene Ueberwachungsstelle (zUeS). Vorbeugende Wartung nach Herstellerangaben. Betriebsanleitung bereithalten und Unterweisung der Bediener.',
    legal_requirements: 'BetrSichV §4: Grundpflichten, §5: Gefaehrdungsbeurteilung, §14: Pruefung von Arbeitsmitteln. Maschinenrichtlinie 2006/42/EG: Konformitaetserklaerung und CE-Kennzeichnung. ProdSG (Produktsicherheitsgesetz).',
    ppe_required: 'Je nach Maschine: Sicherheitsschuhe, Handschuhe, Gehoerschutz, Schutzbrille',
    regulation_ref: 'BetrSichV §4, §5, §14; Maschinenrichtlinie 2006/42/EG; ProdSG; DGUV Vorschrift 1',
  },
  {
    topic: 'Ballenpresse und Haecksler — Reinigungs- und Wartungsgefahren',
    machine_type: 'ballenpresse',
    species: null,
    hazards: 'Erfassen durch Press- und Schneidwerkzeuge. Verletzungen beim Entfernen von Verstopfungen bei laufender Maschine. Quetschgefahr zwischen Zugmaschine und Anbaugeraet. Brandgefahr durch Reibungswaerme.',
    control_measures: 'Vor Reinigungs- und Wartungsarbeiten Motor abstellen und Schluessel abziehen. Warten bis alle beweglichen Teile stillstehen. Schutzvorrichtungen nicht demontieren. Verstopfungen nur mit geeignetem Werkzeug beseitigen. Feuerloecher mitfuehren.',
    legal_requirements: 'BetrSichV §4: sicherer Zustand der Arbeitsmittel. VSG 3.1 SVLFG: Schutz vor Gefaehrdungen durch technische Arbeitsmittel. Maschinenrichtlinie 2006/42/EG.',
    ppe_required: 'Sicherheitsschuhe S3, eng anliegende Kleidung, Arbeitshandschuhe',
    regulation_ref: 'BetrSichV §4; VSG 3.1 SVLFG; Maschinenrichtlinie 2006/42/EG',
  },
  {
    topic: 'Foerder- und Transportschnecken — Einfuellschutz',
    machine_type: 'foerderschnecke',
    species: null,
    hazards: 'Erfassen durch rotierende Schnecken bei der Getreidebefuellung oder beim Futtertransport. Besonders gefaehrlich sind ungesicherte Einfuelltrichter. Amputation oder toedliche Verletzungen.',
    control_measures: 'Einfuelltrichter mit Schutzgitter versehen. Motor abstellen vor Reinigung oder Stoerungsbeseitigung. Niemals in laufende Schnecke greifen. Unterweisung aller Bediener.',
    legal_requirements: 'BetrSichV: Schutz vor beweglichen Teilen. VSG 3.1 SVLFG. DGUV Information 209-020: Foerdermittel.',
    ppe_required: 'Sicherheitsschuhe S3, eng anliegende Kleidung, Arbeitshandschuhe',
    regulation_ref: 'BetrSichV; VSG 3.1 SVLFG; DGUV Information 209-020',
  },
];

// ---------------------------------------------------------------------------
// 2. SAFETY GUIDANCE — Tierhaltung und Tierumgang
// ---------------------------------------------------------------------------
const livestockSafety = [
  {
    topic: 'Rinderhaltung — Fixierung und sicherer Umgang',
    machine_type: null,
    species: 'rinder',
    hazards: 'Quetschen an Waenden oder Gattern. Tritte und Kopfstoesse. Treten und Niedertrampeln. Bullen sind besonders gefaehrlich und unberechenbar. Uebergriffe bei frisch abgekalbten Kuehen.',
    control_measures: 'Fangstand und Treibgang verwenden. Tiere ruhig und ohne hektische Bewegungen ansprechen und treiben. Bullen ab 12 Monaten nur mit Nasenring fuehren. Flucht- und Rettungsoeffnungen (Mannloecher) in allen Stallbereichen einrichten. Separationsgatter fuer kranke Tiere.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung fuer Tierumgang. VSG 2.1 SVLFG (Tierhaltung): Anforderungen an Stalleinrichtungen und Umgang mit Tieren. DGUV Information 214-016: Umgang mit Rindern.',
    ppe_required: 'Sicherheitsstiefel mit Stahlkappe, Handschuhe bei Klauenpflege',
    regulation_ref: 'ArbSchG §5; VSG 2.1 SVLFG; DGUV Information 214-016',
  },
  {
    topic: 'Melken — Trittsicherheit und Ergonomie',
    machine_type: null,
    species: 'rinder',
    hazards: 'Tritte der Kuehe, Quetschen im Melkstand, infektioese Zoonosen (Q-Fieber, Leptospirose, MRSA), Muskel-Skelett-Erkrankungen durch wiederholte Bewegungen in gebueckter Haltung.',
    control_measures: 'Melkstand ergonomisch gestalten (Grubentiefe anpassen). Trittschutz bei unruhigen Kuehen verwenden. Hygiene-Protokoll (Handschuhe, Einzeltuecher, Dippen). Regelmaessige Pausen. Technische Hilfen (Melkroboter, Schnellaustrieb).',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung. LasthandhabV (Lastenhandhabungsverordnung): Vermeidung von Rueckenschaeden. VSG 2.1 SVLFG.',
    ppe_required: 'Melkhandschuhe, Sicherheitsstiefel, Schuerze',
    regulation_ref: 'ArbSchG §5; LasthandhabV; VSG 2.1 SVLFG',
  },
  {
    topic: 'Schweinehaltung — Stallsicherheit und Biosicherheit',
    machine_type: null,
    species: 'schweine',
    hazards: 'Bissverletzungen durch Eber. Quetschen in Buchten und Gaengen. Exposition gegenueber Stallgasen (Ammoniak, Schwefelwasserstoff). Zoonosen (MRSA, Salmonellen). Stress bei Verladung.',
    control_measures: 'Fluchtwege und Rettungsoeffnungen in jeder Bucht. Korrekte Stallbelueftung (TA Luft). Treibbretter fuer die Verladung, max. 5-6 Tiere pro Gruppe. Hygieneschleuse am Stalleingang. ASP-Praevention: Wildtierkeintritt verhindern.',
    legal_requirements: 'VSG 2.1 SVLFG: Tierhaltung. SchHaltHygV (Schweinehaltungshygieneverordnung): Biosicherheitsmassnahmen. TA Luft (2021): Emissionswerte. ArbSchG §5: Gefaehrdungsbeurteilung.',
    ppe_required: 'Stallstiefel, FFP2-Maske (bei hoher Staubbelastung), Einwegoverall (Biosicherheit)',
    regulation_ref: 'VSG 2.1 SVLFG; SchHaltHygV; TA Luft 2021; ArbSchG §5',
  },
  {
    topic: 'Pferdehaltung — Umgang und Hufpflege',
    machine_type: null,
    species: 'pferde',
    hazards: 'Tritte, Bisse, Mitschleifen. Pferde sind Fluchttiere und reagieren stark auf ploetzliche Bewegungen und Geraeusche. Verletzungen beim Hufbeschlag.',
    control_measures: 'Seitlich an das Pferd herantreten und Tier ansprechen. Anbindung mit Panikhaken (Sicherheitsanbinder). Hufbeschlag durch qualifizierten Hufschmied. Reithelm fuer Reiter obligatorisch.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung. VSG 2.1 SVLFG: Tierhaltung. UVV Reiten (DGUV Information 214-021).',
    ppe_required: 'Sicherheitsschuhe mit Stahlkappe, Reithelm, Handschuhe',
    regulation_ref: 'ArbSchG §5; VSG 2.1 SVLFG; DGUV Information 214-021',
  },
  {
    topic: 'Gefluegelhaltung — Staeube, Allergene und Tierkontakt',
    machine_type: null,
    species: 'gefluegel',
    hazards: 'Hohe Staubkonzentrationen (Federn, Kot, Hautschuppen) beim Einstallen und Ausstallen. Allergische Reaktionen und Hypersensitivitaetspneumonitis (Farmerlunge). Muskel-Skelett-Erkrankungen durch Arbeiten in gebueckter Haltung. Kratzer und Schnabelhiebe.',
    control_measures: 'Ausstallen moeglichst bei gedimmtem Licht (Tiere sind ruhiger). Maximale Belueftung einschalten. Arbeitsphasen von max. 2 Stunden in gebueckter Haltung ohne Pause. Tiere an den Beinen fassen, nicht an den Fluegeln.',
    legal_requirements: 'BioStoffV (Biostoffverordnung): Schutz vor biologischen Arbeitsstoffen. ArbSchG §5: Gefaehrdungsbeurteilung. VSG 2.1 SVLFG.',
    ppe_required: 'FFP2/FFP3-Atemschutz, Schutzbrille, lange Aermel, Handschuhe',
    regulation_ref: 'BioStoffV; ArbSchG §5; VSG 2.1 SVLFG; TRBA 230',
  },
  {
    topic: 'Schafhaltung — Schafschur und Klauenpflege',
    machine_type: null,
    species: 'schafe',
    hazards: 'Muskel-Skelett-Erkrankungen durch gebueckte Schurhaltung. Schnittwunden durch Schermaschine. Tritte aufgeregter Tiere. Zoonosen (Ecthyma contagiosum, Q-Fieber, Orf).',
    control_measures: 'Ergonomischen Schurtisch oder Wendekarre verwenden. Scharfe Schermesser (weniger Kraftaufwand). Klauenpflege mit Fixierung im Kippstand. Tiere ruhig behandeln. Haendewaschen nach jedem Tierkontakt.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung. LasthandhabV. VSG 2.1 SVLFG. BioStoffV: Zoonosenrisiko.',
    ppe_required: 'Sicherheitsschuhe, Handschuhe, Knieschoner, Rueckenstuetze bei TMS-Risiko',
    regulation_ref: 'ArbSchG §5; LasthandhabV; VSG 2.1 SVLFG; BioStoffV',
  },
];

// ---------------------------------------------------------------------------
// 3. SAFETY GUIDANCE — Gefahrstoffe (Aequivalent COSHH)
// ---------------------------------------------------------------------------
const chemicalSafety = [
  {
    topic: 'Pflanzenschutzmittel — Anwendung und Lagerung',
    machine_type: null,
    species: null,
    hazards: 'Vergiftung durch Hautkontakt, Einatmen oder Verschlucken. Chronische Gesundheitsschaeden bei laengerer Exposition. Umweltkontamination. Bienen- und Gewaessergefaehrdung.',
    control_measures: 'Sachkundenachweis (Pflanzenschutz-Sachkundenachweis) Pflicht. Sicherheitsdatenblatt (SDB) vor Anwendung lesen und Betriebsanweisung erstellen. PSA tragen: Handschuhe, Schutzanzug, Atemschutz. Lagerung in abschliessbarem, belueftetem Raum mit Auffangwanne. Geraetepruefung alle 3 Jahre.',
    legal_requirements: 'PflSchG §9: Sachkundenachweis. GefStoffV §14: Betriebsanweisung und Unterweisung. TRGS 400: Gefaehrdungsbeurteilung fuer Taetigkeiten mit Gefahrstoffen. CLP-Verordnung (EG) Nr. 1272/2008.',
    ppe_required: 'Chemikalienschutzhandschuhe (EN 374), Schutzanzug Typ 4/5/6, Atemschutz A2P3, Gesichtsschutz',
    regulation_ref: 'PflSchG §9; GefStoffV §14; TRGS 400; CLP-Verordnung (EG) 1272/2008',
  },
  {
    topic: 'Sicherheitsdatenblatt und Betriebsanweisung — Gefahrstoffmanagement',
    machine_type: null,
    species: null,
    hazards: 'Ueberschreitung der Arbeitsplatzgrenzwerte (AGW, frueher MAK-Werte) in geschlossenen Raeumen (Gewaechshaus, Lagerraum). Chronische Exposition ohne medizinische Ueberwachung.',
    control_measures: 'Sicherheitsdatenblatt (SDB, 16 Abschnitte) bei jedem Gefahrstoff mitfuehren. Betriebsanweisung nach GefStoffV §14 erstellen und am Arbeitsplatz aushangen. Arbeitsplatzgrenzwerte einhalten. Arbeitsmedizinische Vorsorge (ArbMedVV) bei Gefahrstoffexposition.',
    legal_requirements: 'GefStoffV §6: Gefaehrdungsbeurteilung. GefStoffV §14: Unterrichtung und Unterweisung. TRGS 555: Betriebsanweisung und Information. REACH-Verordnung (EG) 1907/2006: Pflicht zur Bereitstellung von SDB.',
    ppe_required: 'Gemaess Sicherheitsdatenblatt: Handschuhe, Schutzanzug, Atemschutz je nach Stoff',
    regulation_ref: 'GefStoffV §6, §14; TRGS 555; REACH (EG) 1907/2006',
  },
  {
    topic: 'Guellegase — H2S-Gefahr in Guellegruben',
    machine_type: null,
    species: null,
    hazards: 'Schwefelwasserstoff (H2S) beim Ruehren der Guelle ist bereits in geringer Konzentration (>100 ppm) toedlich. Erstickung durch Sauerstoffmangel. Explosionsgefahr durch Methan (CH4). Sturzgefahr in die Grube.',
    control_measures: 'Niemals allein an Guellegruben arbeiten. Gaswarngeraet (H2S) vor Zugang einsetzen. Zwangsbelueftung vor und waehrend des Ruehrens. Tiere aus dem Stall entfernen waehrend des Ruehrens. Rettungsplan und Rettungsmittel bereithalten.',
    legal_requirements: 'DGUV Regel 113-004: Arbeiten in Behaeltern und engen Raeumen. GefStoffV: AGW fuer H2S = 5 ppm (8h-Mittelwert). VSG 2.1 SVLFG: Guellelagerung. TRGS 900: Arbeitsplatzgrenzwerte.',
    ppe_required: 'Persoenliches H2S-Gaswarngeraet, umluftunabhaengiger Atemschutz, Sicherheitsgeschirr mit Rettungsleine',
    regulation_ref: 'DGUV Regel 113-004; GefStoffV; VSG 2.1 SVLFG; TRGS 900',
  },
  {
    topic: 'Silogase — CO2 und Stickoxide bei Gaerfutter',
    machine_type: null,
    species: null,
    hazards: 'CO2 und Stickoxide (NO, NO2) verdraengen Sauerstoff. Silogase bilden sich in den ersten Wochen nach dem Befuellen. Tod durch Erstickung ohne Vorwarnung. Verschuettungsgefahr in Getreidelagern.',
    control_measures: 'Befahrerlaubnis (Erlaubnisschein) fuer den Einstieg in den Silo. Niemals allein einsteigen. Gasmessung vor dem Betreten. Zwangsbelueftung mindestens 30 Minuten vor dem Einsteigen. Auffanggurt mit Rettungsleine und Sicherungsposten an der Oberflaeche.',
    legal_requirements: 'DGUV Regel 113-004: Arbeiten in Behaeltern und engen Raeumen. GefStoffV: AGW CO2 = 5.000 ppm (8h). TRGS 900: Arbeitsplatzgrenzwerte. VSG 3.1 SVLFG.',
    ppe_required: 'Multigasmessgeraet (O2, CO2, H2S, UEG), umluftunabhaengiger Atemschutz, Auffanggurt mit Rettungsleine, Kommunikationsmittel',
    regulation_ref: 'DGUV Regel 113-004; GefStoffV; TRGS 900; VSG 3.1 SVLFG',
  },
  {
    topic: 'Kraftstoff und Schmiermittel — Lagerung auf dem Betrieb',
    machine_type: null,
    species: null,
    hazards: 'Brandgefahr, Hautreizung bei langem Kontakt, Umweltverschmutzung bei Leckagen, Explosionsgefahr durch Daempfe.',
    control_measures: 'Lagerung in doppelwandigen Tanks oder mit Auffangwanne (Rueckhaltevolumen 100% des groessten Gebindes). Feuerloecher in der Naehe der Zapfstelle. Rauchverbot und Verbot offener Flammen. Verschuettungen sofort aufnehmen.',
    legal_requirements: 'AwSV (Verordnung ueber Anlagen zum Umgang mit wassergefaehrdenden Stoffen): Anforderungen an Lageranlagen. WHG §62: Anlagen zum Umgang mit wassergefaehrdenden Stoffen. BetrSichV: Explosionsschutz (ATEX).',
    ppe_required: 'Chemikalienschutzhandschuhe, Schutzbrille',
    regulation_ref: 'AwSV; WHG §62; BetrSichV; TRGS 509; DGUV Information 213-084',
  },
  {
    topic: 'Ammoniak — Stallgebaeude und Tierhaltung',
    machine_type: null,
    species: null,
    hazards: 'Reizung der Atemwege und Augen bei hoher Ammoniakkonzentration im Stall. Chronische Atemwegserkrankungen bei Langzeitexposition. Gefaehrdung des Tierwohls.',
    control_measures: 'Stallbelueftung gemaess TA Luft sicherstellen. Entmistungsfrequenz erhoehen. Arbeitsplatzgrenzwert einhalten: AGW Ammoniak 20 ppm (8h). Abluftreinigungsanlage bei genehmigungspflichtigen Anlagen (BImSchG).',
    legal_requirements: 'GefStoffV: Betriebsanweisung. TRGS 900: AGW 20 ppm Ammoniak. TA Luft 2021: Emissionsanforderungen Tierhaltung. BImSchG/4. BImSchV: Genehmigungspflicht ab bestimmten Bestandsgroessen.',
    ppe_required: 'Atemschutz mit K-Filter (Ammoniak), Schutzbrille',
    regulation_ref: 'GefStoffV; TRGS 900; TA Luft 2021; BImSchG; 4. BImSchV',
  },
  {
    topic: 'Staeube — Getreide, Heu und Futtermittel',
    machine_type: null,
    species: null,
    hazards: 'Hohe Staubkonzentration bei Ernte, Lagerung und Futtermittelverteilung. Allergische Alveolitis (Farmerlunge). Explosionsgefahr in Getreidesilos (Staubexplosion). Augenreizung.',
    control_measures: 'Absaugung an der Staubquelle. ATEX-konforme Installationen in Getreidelagern. Regelmaessige Reinigung der Lager- und Arbeitsraeume. Staubgehalt messen (Arbeitsplatzgrenzwert A-Staub 1,25 mg/m3).',
    legal_requirements: 'GefStoffV: Staubgrenzwerte. TRGS 900: AGW fuer einatembaren Staub (E-Staub) 10 mg/m3, alveolengaengigen Staub (A-Staub) 1,25 mg/m3. BetrSichV Anhang 1 Nr. 4: Explosionsgefaehrdete Bereiche. ATEX-Richtlinie 2014/34/EU.',
    ppe_required: 'FFP2- oder P2-Atemschutz, Schutzbrille',
    regulation_ref: 'GefStoffV; TRGS 900; BetrSichV Anhang 1 Nr. 4; ATEX-Richtlinie 2014/34/EU',
  },
  {
    topic: 'Holzschutzmittel und Desinfektionsmittel — Anwendung auf dem Betrieb',
    machine_type: null,
    species: null,
    hazards: 'Kontakt mit bioziden Wirkstoffen bei der Holzbehandlung oder Stalldesinfektion. Einige Stoffe sind als CMR (krebserzeugend, keimzellmutagen, reproduktionstoxisch) eingestuft. Hautreizungen, Atemwegsbeschwerden.',
    control_measures: 'Substitutionspruefung: Ersatz durch weniger gefaehrliche Stoffe. Betriebsanweisung erstellen. Geschlossene Systeme bevorzugen. Bei offener Anwendung: Schutzanzug Typ 3, Vollmaske mit A2B2P3-Filter, doppelte Nitrilhandschuhe. Expositionsverzeichnis fuehren (40 Jahre Aufbewahrung).',
    legal_requirements: 'GefStoffV §6: Substitutionspruefung bei CMR-Stoffen. GefStoffV §10: Besondere Schutzmassnahmen bei CMR-Stoffen. TRGS 410: Expositionsverzeichnis. CLP-Verordnung (EG) 1272/2008.',
    ppe_required: 'Schutzanzug Typ 3, Vollmaske mit A2B2P3-Filter, doppelte Nitrilhandschuhe, Schutzbrille',
    regulation_ref: 'GefStoffV §6, §10; TRGS 410; CLP-Verordnung (EG) 1272/2008',
  },
];

// ---------------------------------------------------------------------------
// 4. SAFETY GUIDANCE — Absturzgefahr und Arbeiten in der Hoehe
// ---------------------------------------------------------------------------
const heightSafety = [
  {
    topic: 'Arbeiten in der Hoehe — Daecher landwirtschaftlicher Gebaeude',
    machine_type: null,
    species: null,
    hazards: 'Absturz von Daechern (haeufigste toedliche Absturzursache in der Landwirtschaft). Durchbrechen durch Dachplatten (Asbestzement, Lichtplatten). Abrutschen auf nassen oder moosbewachsenen Daechern.',
    control_measures: 'Kollektive Schutzmassnahmen haben Vorrang: Seitenschutz (Gelaender), Auffangnetze. Wenn nicht moeglich: Auffanggurt mit Anschlagpunkt. Nicht tragfaehige Bereiche (Lichtplatten, Welleternitplatten) kennzeichnen und Laufstege verwenden. Nur bei geeignetem Wetter arbeiten.',
    legal_requirements: 'TRBS 2121 (Technische Regel fuer Betriebssicherheit): Gefaehrdung durch Absturz. ArbStaettV (Arbeitsstaettenverordnung) §3a: Sicherung gegen Absturz. DGUV Regel 112-198: Benutzung von PSA gegen Absturz.',
    ppe_required: 'Auffanggurt mit Falldaempfer, Schutzhelm, rutschfeste Schuhe',
    regulation_ref: 'TRBS 2121; ArbStaettV §3a; DGUV Regel 112-198; VSG 1.1 SVLFG',
  },
  {
    topic: 'Silo und Trocknungsanlagen — Zugang in der Hoehe',
    machine_type: null,
    species: null,
    hazards: 'Absturz bei Zugang zu Hochsilos und Trocknungstuerme. Fehlende Gelaender an ortsfesten Steigleitern. Rutschige Oberflaeche durch Staub und Feuchtigkeit.',
    control_measures: 'Ortsfeste Steigleitern mit Rueckenschutz (Steigschutzeinrichtung) ab 3 Meter Steighoehe. Ruhepodeste alle 6 Meter. Plattform am Silokopf mit Gelaender. Rutschsichere Sprossen. Kein Zugang bei starkem Wind oder Vereisung.',
    legal_requirements: 'TRBS 2121 Teil 1: Steigleitern. ASR A1.8: Verkehrswege (Leitern). ArbStaettV: sichere Zugaenge. DGUV Information 208-032: Leitern und Tritte.',
    ppe_required: 'Auffanggurt (wenn kein Rueckenschutz vorhanden), Schutzhelm, rutschfeste Schuhe',
    regulation_ref: 'TRBS 2121 Teil 1; ASR A1.8; ArbStaettV; DGUV Information 208-032',
  },
  {
    topic: 'Obstbau — Leitern und Hubarbeitsbuehnen',
    machine_type: null,
    species: null,
    hazards: 'Leitersturz durch Einsinken im weichen Boden. Umkippen der Hubarbeitsbuehne. Schnittverletzungen bei Baumschnittarbeiten.',
    control_measures: 'Leiter nur auf festem Untergrund, Anstellwinkel 65-75 Grad. Hubarbeitsbuehne fuer laengere Arbeiten ueber 3 Meter. Baumschere mit Arretierung verwenden. Nicht ueber die Standsicherheitsgrenze hinauslehnen.',
    legal_requirements: 'TRBS 2121 Teil 2: Leitern. BetrSichV §4: sichere Bereitstellung von Arbeitsmitteln. DGUV Information 208-016: Hubarbeitsbuehnen.',
    ppe_required: 'Sicherheitsschuhe, Arbeitshandschuhe, Schutzhelm (bei Hubarbeitsbuehne: Auffanggurt)',
    regulation_ref: 'TRBS 2121 Teil 2; BetrSichV §4; DGUV Information 208-016',
  },
  {
    topic: 'Heustockarbeiten und Silobefuellung — Absturzgefahr',
    machine_type: null,
    species: null,
    hazards: 'Absturz vom Heustock oder Silooberkante. Einsinkgefahr in losem Schuettgut. Erstickungsgefahr durch Verschuettung im Getreidesilo.',
    control_measures: 'Absturzsicherung an offenen Kanten (Gelaender oder Auffanggurt). Getreidesilos niemals betreten waehrend des Befuellens. Brueckenbildung im Silo niemals von oben loesen — Verschuettungsgefahr. Rettungsausruestung bereithalten.',
    legal_requirements: 'TRBS 2121: Absturzsicherung. DGUV Regel 113-004: Arbeiten in Behaeltern und engen Raeumen. VSG 3.1 SVLFG.',
    ppe_required: 'Auffanggurt mit Rettungsleine, Schutzhelm, rutschfeste Schuhe',
    regulation_ref: 'TRBS 2121; DGUV Regel 113-004; VSG 3.1 SVLFG',
  },
];

// ---------------------------------------------------------------------------
// 5. SAFETY GUIDANCE — Alleinarbeit
// ---------------------------------------------------------------------------
const loneWorkerSafety = [
  {
    topic: 'Alleinarbeit — Personen-Notsignal-Anlagen (PNA)',
    machine_type: null,
    species: null,
    hazards: 'Fehlende Hilfe bei Unfaellen an abgelegenen Arbeitsplaetzen. Verlaengertes Verweilen in Gefahrensituationen vor der Entdeckung. Erhoehtes Risiko bei Arbeiten in engen Raeumen, Guellegruben und mit gefaehrlichen Maschinen.',
    control_measures: 'Alleinarbeit in Guellegruben, Silos und engen Raeumen ist verboten. Personen-Notsignal-Anlage (PNA) nach DGUV Regel 112-139 einsetzen (willensabhaengig oder automatisch mit Lage-/Bewegungssensor). Mobiltelefon staendig mitfuehren. Regelmaessige Kontrollkontakte zu festen Zeiten. Arbeitsplanung mit Kollegen teilen.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung muss Alleinarbeit beruecksichtigen. DGUV Regel 112-139: Einsatz von Personen-Notsignal-Anlagen. DGUV Information 212-139: Auswahl und Betrieb von PNA. VSG 1.1 SVLFG: Allgemeine Sicherheitsvorschriften.',
    ppe_required: 'Mobiltelefon, Personen-Notsignal-Anlage (PNA mit Totmannschaltung oder Lagealarm)',
    regulation_ref: 'ArbSchG §5; DGUV Regel 112-139; DGUV Information 212-139; VSG 1.1 SVLFG',
  },
];

// ---------------------------------------------------------------------------
// 6. SAFETY GUIDANCE — Gefaehrdungsbeurteilung
// ---------------------------------------------------------------------------
const riskAssessmentSafety = [
  {
    topic: 'Gefaehrdungsbeurteilung nach ArbSchG §5 — Pflichtdokument',
    machine_type: null,
    species: null,
    hazards: 'Fehlende systematische Erfassung der Gefaehrdungen im Betrieb. Nichtkonformitaet mit gesetzlichen Pflichten. Bussgelder bei Kontrolle durch die Gewerbeaufsicht.',
    control_measures: 'Gefaehrdungsbeurteilung fuer jeden Arbeitsbereich und jede Taetigkeit erstellen. Gefaehrdungen identifizieren, Risiken bewerten, Schutzmassnahmen festlegen und deren Wirksamkeit pruefen. Massnahmenplan mit Prioritaeten, Fristen und Verantwortlichen. Beschaeftigte beteiligen.',
    legal_requirements: 'ArbSchG §5: Pflicht zur Gefaehrdungsbeurteilung fuer jeden Arbeitgeber. ArbSchG §6: Dokumentationspflicht. Aktualisierung bei Aenderung der Arbeitsverhaeltnisse. SVLFG bietet branchenspezifische Handlungshilfen und Vorlagen.',
    ppe_required: 'Nicht anwendbar (organisatorische Massnahme)',
    regulation_ref: 'ArbSchG §5, §6; DGUV Vorschrift 1 §3; SVLFG Handlungshilfen',
  },
  {
    topic: 'Gefaehrdungsbeurteilung — Inhalt und Methodik',
    machine_type: null,
    species: null,
    hazards: 'Oberflaechliche oder unvollstaendige Gefaehrdungsbeurteilung. Fehlender konkreter Massnahmenplan.',
    control_measures: 'Fuer jeden Arbeitsbereich: Gefaehrdungen ermitteln (mechanisch, elektrisch, chemisch, biologisch, psychisch), Eintrittswahrscheinlichkeit und Schwere bewerten, Massnahmen nach dem STOP-Prinzip festlegen (Substitution, Technisch, Organisatorisch, Persoenlich). SVLFG-Vorlagen oder GDA-Leitlinien verwenden.',
    legal_requirements: 'ArbSchG §4: Grundsaetze (STOP-Prinzip). ArbSchG §5: Beurteilungspflicht. DGUV Vorschrift 1 §3. Technische Regeln (TRBS, TRGS, TRBA) als Konkretisierung.',
    ppe_required: 'Nicht anwendbar (organisatorische Massnahme)',
    regulation_ref: 'ArbSchG §4, §5; DGUV Vorschrift 1 §3; GDA-Leitlinien',
  },
];

// ---------------------------------------------------------------------------
// 7. SAFETY GUIDANCE — SVLFG und Unfallstatistik
// ---------------------------------------------------------------------------
const svlfgSafety = [
  {
    topic: 'SVLFG — Unfallstatistik und Praevention in der Landwirtschaft',
    machine_type: null,
    species: null,
    hazards: 'Die SVLFG-Unfallstatistik zeigt jaehrlich ca. 20 toedliche Arbeitsunfaelle in der Landwirtschaft. Hauptursachen: Traktorueberrollen, Sturz aus der Hoehe, Tierumgang, Forstarbeiten, Maschinenunfaelle.',
    control_measures: 'SVLFG-Praeventionsjahresbericht auswerten und Schwerpunkte fuer den eigenen Betrieb ableiten. Gefaehrdungsbeurteilung entsprechend anpassen. An SVLFG-Praeventionsangeboten teilnehmen (Seminare, Beratung, Zuschuessprogramme fuer Sicherheitstechnik).',
    legal_requirements: 'SGB VII (Sozialgesetzbuch Siebtes Buch): Gesetzliche Unfallversicherung. Die SVLFG ist die landwirtschaftliche Berufsgenossenschaft und zustaendig fuer Praevention, Rehabilitation und Entschaedigung.',
    ppe_required: 'Nicht anwendbar (Statistik und Praevention)',
    regulation_ref: 'SGB VII; SVLFG Praeventionsbericht; DGUV Statistik',
  },
];

// ---------------------------------------------------------------------------
// 8. SAFETY GUIDANCE — PSA (Persoenliche Schutzausruestung)
// ---------------------------------------------------------------------------
const ppeSafety = [
  {
    topic: 'PSA-Pflichten in der Landwirtschaft',
    machine_type: null,
    species: null,
    hazards: 'Fehlende oder ungeeignete Persoenliche Schutzausruestung (PSA) fuer die ermittelten Gefaehrdungen.',
    control_measures: 'Der Arbeitgeber stellt geeignete PSA kostenlos zur Verfuegung und sorgt fuer deren Benutzung. PSA muss CE-gekennzeichnet sein (PSA-Verordnung (EU) 2016/425). Unterweisung in Benutzung und Pflege. Austausch bei Beschaedigung oder Alterung. PSA-Ausgaberegister fuehren.',
    legal_requirements: 'PSA-Benutzungsverordnung (PSA-BV): Pflichten von Arbeitgebern und Beschaeftigten. ArbSchG §3: Arbeitgeberpflichten. DGUV Regel 112-xxx: spezifische PSA-Regeln (112-189 Fussschutz, 112-190 Augenschutz, 112-194 Gehoerschutz). PSA ist das letzte Mittel nach dem STOP-Prinzip.',
    ppe_required: 'Je nach Gefaehrdung: Sicherheitsschuhe, Handschuhe, Gehoerschutz, Schutzbrille, Atemschutz, Auffanggurt, Warnkleidung',
    regulation_ref: 'PSA-BV; ArbSchG §3; PSA-Verordnung (EU) 2016/425; DGUV Regel 112-189, 112-190, 112-194',
  },
];

// ---------------------------------------------------------------------------
// 9. SAFETY GUIDANCE — Hitzearbeit und UV-Schutz
// ---------------------------------------------------------------------------
const heatSafety = [
  {
    topic: 'Hitzearbeit und UV-Schutz auf dem Feld',
    machine_type: null,
    species: null,
    hazards: 'Hitzschlag und Hitzeerschoepfung bei Feldarbeiten im Hochsommer. UV-Strahlung: Hautkrebs (Plattenepithelkarzinom) als anerkannte Berufskrankheit (BK 5103). Sonnenstich. Dehydrierung.',
    control_measures: 'Schwere Arbeiten in die kuehlen Tagesstunden verlegen (frueh morgens, spaet abends). Ausreichend Trinkwasser bereitstellen (mindestens 2-3 Liter pro Schicht). Schattenplaetze fuer Pausen einrichten. UV-Schutzcreme LSF 50+ verwenden. Kopfbedeckung und langaermelige, helle Kleidung tragen.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung muss Klimabelastung beruecksichtigen. ASR A3.5: Raumtemperatur (Handlungspflichten ab 35°C Aussentemperatur fuer Aussenarbeitsplaetze). BK 5103: Plattenepithelkarzinom durch UV-Strahlung als Berufskrankheit anerkannt. SVLFG-Empfehlungen zum UV-Schutz.',
    ppe_required: 'Kopfbedeckung mit Nackenschutz, UV-Schutzkleidung, Sonnenbrille (UV 400), Sonnenschutzcreme LSF 50+',
    regulation_ref: 'ArbSchG §5; ASR A3.5; BK 5103; SVLFG UV-Schutz-Empfehlungen',
  },
];

// ---------------------------------------------------------------------------
// 10. SAFETY GUIDANCE — Mutterschutz und ergaenzende Themen
// ---------------------------------------------------------------------------
const additionalSafety = [
  {
    topic: 'Mutterschutz auf dem landwirtschaftlichen Betrieb',
    machine_type: null,
    species: null,
    hazards: 'Schwangere und stillende Frauen sind besonderen Gefaehrdungen ausgesetzt: biologische Arbeitsstoffe (Zoonosen), Gefahrstoffe (Pflanzenschutzmittel), schweres Heben (>5 kg regelmaessig), laenger als 4 Stunden Stehen, Erschuetterungen durch Traktoren.',
    control_measures: 'Gefaehrdungsbeurteilung nach MuSchG §10 spezifisch fuer Schwangere erstellen. Beschaeftigungsverbote beachten: kein Umgang mit CMR-Stoffen, kein schweres Heben, keine Nachtarbeit (20-6 Uhr), keine Sonn-/Feiertagsarbeit. Alternative Taetigkeit anbieten oder Freistellung mit Mutterschutzlohn.',
    legal_requirements: 'MuSchG (Mutterschutzgesetz) 2018: §10 Gefaehrdungsbeurteilung, §§11-12 Unzulaessige Taetigkeiten und Arbeitsbedingungen, §§17-18 Kuendigungsschutz. MuSchArbV (alt) ersetzt durch MuSchG 2018.',
    ppe_required: 'Nicht anwendbar (organisatorische Schutzmassnahmen)',
    regulation_ref: 'MuSchG 2018 §10, §§11-12, §§17-18',
  },
  {
    topic: 'Muskel-Skelett-Erkrankungen — Manuelle Lastenhandhabung',
    machine_type: null,
    species: null,
    hazards: 'Rueckenschaeden durch Heben schwerer Lasten (Futtersaecke, Ballen). MSE der oberen Extremitaeten durch repetitive Bewegungen (Melken, Sortieren). Kniebeschwerden durch Arbeiten in kniender oder hockender Position.',
    control_measures: 'Mechanische Hilfsmittel verwenden (Sackkarren, Foerderbander, Hubwagen). Maximale Traglasten nach Leitmerkmalmethode beachten. Taetigkeitswechsel einplanen. Ergonomische Arbeitsplaetze gestalten. Unterweisung in rueckenschonendem Heben und Tragen.',
    legal_requirements: 'LasthandhabV (Lastenhandhabungsverordnung): Arbeitgeber muss manuelle Handhabung auf das notwendige Minimum reduzieren. ArbSchG §5: Gefaehrdungsbeurteilung. AMR 13.2: Arbeitsmedizinische Vorsorge bei Taetigkeiten mit wesentlich erhoehten koerperlichen Belastungen.',
    ppe_required: 'Sicherheitsschuhe, Arbeitshandschuhe, ggf. Knieschoner',
    regulation_ref: 'LasthandhabV; ArbSchG §5; AMR 13.2; DGUV Information 208-033',
  },
  {
    topic: 'Psychische Belastungen — Stress in der Landwirtschaft',
    machine_type: null,
    species: null,
    hazards: 'Arbeitsueberlastung in Ernte- und Aussaatperioden. Soziale Isolation bei Alleinarbeit. Finanzieller Druck durch Marktpreise, Wetterrisiken, steigende Betriebskosten. Generationenkonflikte bei Hofuebergabe.',
    control_measures: 'Arbeitsorganisation an saisonale Spitzen anpassen. Hilfsangebote nutzen: SVLFG Krisentelefon (0561 785-10101), Landwirtschaftliche Familienberatung, Sorgentelefon der Kirchen. Mitarbeitergespraeche fuehren. Betriebshelfer der Maschinenringe fuer Entlastung.',
    legal_requirements: 'ArbSchG §5: Gefaehrdungsbeurteilung muss psychische Belastungen umfassen (seit 2013 ausdruecklich im Gesetz). GDA-Arbeitsprogramm Psyche: Handlungshilfen fuer Betriebe.',
    ppe_required: 'Nicht anwendbar (organisatorische Massnahme)',
    regulation_ref: 'ArbSchG §5; GDA-Arbeitsprogramm Psyche; SVLFG Krisentelefon',
  },
  {
    topic: 'Biologische Gefaehrdungen — Zoonosen auf dem Betrieb',
    machine_type: null,
    species: null,
    hazards: 'Zoonosen (Q-Fieber, Leptospirose, Borreliose/Lyme-Krankheit, Brucellose, FSME) durch Tierkontakt oder Zeckenbisse. Schimmelpilzsporen (Farmerlunge/exogen-allergische Alveolitis). Endotoxine.',
    control_measures: 'Hygieneprotokoll (Haendewaschen, Arbeitskleidung wechseln). FFP2/FFP3-Atemschutz bei staubigen Arbeiten mit Schimmelpotenzial. FSME-Impfung in Risikogebieten (Bayern, Baden-Wuerttemberg, Thueringen, Sachsen). Zeckenkontrolle nach Feldarbeit. Stallbelueftung sicherstellen.',
    legal_requirements: 'BioStoffV (Biostoffverordnung): Schutz vor biologischen Arbeitsstoffen. TRBA 230: Schutz vor Infektionsgefaehrdung bei Arbeiten in der Land- und Forstwirtschaft. ArbMedVV: arbeitsmedizinische Vorsorge bei Biostoffen. ArbSchG §5.',
    ppe_required: 'FFP2/FFP3-Atemschutz, Handschuhe, Schutzkleidung, ggf. Gummistiefel',
    regulation_ref: 'BioStoffV; TRBA 230; ArbMedVV; ArbSchG §5',
  },
  {
    topic: 'Elektrische Sicherheit auf dem landwirtschaftlichen Betrieb',
    machine_type: null,
    species: null,
    hazards: 'Stromschlag durch beschaedigte Kabel, feuchte Umgebung in Staellen, mangelhafte Erdung. Brandgefahr durch Ueberlastung oder Kurzschluss. Beruehrungsspannung fuer Tiere (Kriechstrom in Metallstaellen).',
    control_measures: 'Elektrische Anlagen in der Landwirtschaft nach DIN VDE 0100-705 (Anforderungen an Betriebsstaetten mit erhoehter elektrischer Gefaehrdung) errichten. FI-Schutzschalter (30 mA) in allen Stallbereichen. Regelmaessige Pruefung durch Elektrofachkraft (DGUV Vorschrift 3). Beschaedigte Kabel sofort austauschen.',
    legal_requirements: 'DGUV Vorschrift 3: Elektrische Anlagen und Betriebsmittel. BetrSichV: Pruefung von Arbeitsmitteln. DIN VDE 0100-705: Landwirtschaftliche Betriebsstaetten. VSG 1.1 SVLFG.',
    ppe_required: 'Isolierte Werkzeuge, Schutzhandschuhe bei Arbeiten an elektrischen Anlagen',
    regulation_ref: 'DGUV Vorschrift 3; BetrSichV; DIN VDE 0100-705; VSG 1.1 SVLFG',
  },
];

// ---------------------------------------------------------------------------
// Combine all safety guidance
// ---------------------------------------------------------------------------
const allSafetyGuidance = [
  ...machineSafety,
  ...livestockSafety,
  ...chemicalSafety,
  ...heightSafety,
  ...loneWorkerSafety,
  ...riskAssessmentSafety,
  ...svlfgSafety,
  ...ppeSafety,
  ...heatSafety,
  ...additionalSafety,
];

// ---------------------------------------------------------------------------
// 11. CHILDREN ON FARMS (Jugendarbeitsschutz und Kinder auf dem Betrieb)
// ---------------------------------------------------------------------------
const childrenRules = [
  {
    age_group: 'unter-13',
    activity: 'Jede Arbeit auf einem landwirtschaftlichen Betrieb',
    permitted: 0,
    conditions: 'Kinderarbeit unter 13 Jahren ist grundsaetzlich verboten. Ausnahme: gelegentliche leichte Mithilfe auf dem elterlichen Betrieb unter Aufsicht der Eltern, sofern keine Gefaehrdung besteht.',
    regulation_ref: 'JArbSchG §5; KindArbSchV',
  },
  {
    age_group: 'unter-13',
    activity: 'Fahren oder Mitfahren auf einem Traktor',
    permitted: 0,
    conditions: 'Strikt verboten. Kinder unter 13 Jahren duerfen weder einen Traktor fahren noch als Beifahrer auf dem Traktor mitfahren.',
    regulation_ref: 'JArbSchG §5; VSG 3.1 SVLFG',
  },
  {
    age_group: 'unter-13',
    activity: 'Kontakt mit Gefahrstoffen (Pflanzenschutzmittel, Guelle)',
    permitted: 0,
    conditions: 'Strikt verboten. Kein Kontakt mit Pflanzenschutzmitteln, Guellegasen oder anderen Gefahrstoffen.',
    regulation_ref: 'JArbSchG §5; GefStoffV',
  },
  {
    age_group: '13-14',
    activity: 'Leichte Taetigkeiten auf dem elterlichen Betrieb',
    permitted: 1,
    conditions: 'Erlaubt nur auf dem Betrieb der Eltern oder Erziehungsberechtigten, fuer leichte und nicht gefaehrliche Taetigkeiten (z.B. Eiersammeln, leichte Gartenarbeit), unter Aufsicht. Maximal 2 Stunden taeglich, nicht vor 8 Uhr oder nach 18 Uhr, nicht vor oder waehrend des Schulunterrichts.',
    regulation_ref: 'JArbSchG §5 Abs. 3; KindArbSchV §2',
  },
  {
    age_group: '13-14',
    activity: 'Bedienung von Maschinen oder Fahrzeugen',
    permitted: 0,
    conditions: 'Verboten. Keine Bedienung von landwirtschaftlichen Maschinen, einschliesslich Traktoren, auch nicht unter Aufsicht.',
    regulation_ref: 'JArbSchG §5; VSG 3.1 SVLFG',
  },
  {
    age_group: '13-14',
    activity: 'Umgang mit Tieren',
    permitted: 1,
    conditions: 'Leichte Taetigkeiten mit kleinen Haustieren erlaubt. Verboten mit Bullen, Ebern, Hengsten und anderen gefaehrlichen Tieren.',
    regulation_ref: 'JArbSchG §5 Abs. 3; VSG 2.1 SVLFG',
  },
  {
    age_group: '15-17',
    activity: 'Regulaere Beschaeftigung auf einem landwirtschaftlichen Betrieb',
    permitted: 1,
    conditions: 'Erlaubt mit Einschraenkungen. Maximal 8 Stunden taeglich, 40 Stunden woechentlich. Nachtarbeit verboten (20-6 Uhr). Pause von 30 Minuten nach 4,5 Stunden. Schwere koerperliche Arbeit und gefaehrliche Taetigkeiten verboten.',
    regulation_ref: 'JArbSchG §8, §13, §14; JArbSchG §22 Gefaehrliche Arbeiten',
  },
  {
    age_group: '15-17',
    activity: 'Traktorfahren auf dem Betriebsgelaende',
    permitted: 1,
    conditions: 'Auf dem Betriebsgelaende erlaubt mit ROPS-Traktor und Sicherheitsgurt nach Unterweisung. Fahren auf oeffentlichen Strassen verboten ohne Fuehrerschein Klasse T (ab 16 Jahre) oder L (ab 16 Jahre, bis 40 km/h).',
    regulation_ref: 'JArbSchG; FeV §10 (Mindestalter Fuehrerschein T: 16 Jahre); StVO',
  },
  {
    age_group: '15-17',
    activity: 'Verbotene Taetigkeiten fuer Jugendliche',
    permitted: 0,
    conditions: 'Verboten auch mit Aufsicht: Arbeiten mit Exposition gegenueber CMR-Stoffen, Asbest, Arbeiten in Ueberdruck, Arbeiten mit erhoehter Unfallgefahr durch mangelnde Erfahrung. Verzeichnis der verbotenen Taetigkeiten in JArbSchG §22.',
    regulation_ref: 'JArbSchG §22; JArbSchUV (Jugendarbeitsschutzuntersuchungsverordnung)',
  },
  {
    age_group: '15-17',
    activity: 'Landwirtschaftliche Ausbildung (Berufsausbildung)',
    permitted: 1,
    conditions: 'Azubis gelten als Arbeitnehmer. Der Ausbilder ist fuer die Sicherheit verantwortlich. Verpflichtende Sicherheitsunterweisung vor Arbeitsbeginn. Gefaehrliche Taetigkeiten duerfen unter fachkundiger Anleitung und Aufsicht im Rahmen der Ausbildung durchgefuehrt werden (Ausnahmeregelung JArbSchG §22a).',
    regulation_ref: 'JArbSchG §22a; BBiG (Berufsbildungsgesetz); ArbSchG; VSG 1.1 SVLFG',
  },
  {
    age_group: 'unter-18',
    activity: 'Kinder von Landwirten auf dem elterlichen Betrieb',
    permitted: 1,
    conditions: 'Kinder von Betriebsleitern, die auf dem elterlichen Betrieb mithelfen, unterliegen nicht dem JArbSchG (nur fuer Arbeitnehmer/Azubis), aber dem allgemeinen Aufsichtspflichtrecht (BGB §832). Die SVLFG empfiehlt, die gleichen Schutzstandards wie fuer beschaeftigte Jugendliche anzuwenden.',
    regulation_ref: 'BGB §832; SVLFG Praeventionsempfehlungen; Elterliche Aufsichtspflicht',
  },
];

// ---------------------------------------------------------------------------
// 12. REPORTING REQUIREMENTS (Meldepflicht bei Arbeitsunfaellen)
// ---------------------------------------------------------------------------
const reportingRequirements = [
  {
    incident_type: 'Toedlicher Arbeitsunfall',
    reportable: 1,
    deadline: 'Sofortige Meldung an die SVLFG',
    notify: 'SVLFG (Sozialversicherung fuer Landwirtschaft, Forsten und Gartenbau)',
    method: 'Sofortige telefonische Meldung an die SVLFG (Berufsgenossenschaft). Schriftliche Unfallanzeige (Formular SVLFG) innerhalb von 3 Tagen. Unfallstelle bis zur Untersuchung erhalten. Polizei und Gewerbeaufsicht werden automatisch eingeschaltet.',
    record_retention_years: 30,
    regulation_ref: 'SGB VII §193; DGUV Vorschrift 1 §6; VSG 1.1 SVLFG',
  },
  {
    incident_type: 'Arbeitsunfall mit Arbeitsunfaehigkeit (>3 Kalendertage)',
    reportable: 1,
    deadline: 'Unfallanzeige innerhalb von 3 Tagen',
    notify: 'SVLFG',
    method: 'Schriftliche Unfallanzeige an die SVLFG innerhalb von 3 Tagen nach Kenntnis des Unfalls (bei Arbeitsunfaehigkeit von mehr als 3 Kalendertagen). Formular der SVLFG oder Online-Meldung. Bei Selbststaendigen und mitarbeitenden Familienangehoerigen: eigene Formulare.',
    record_retention_years: 10,
    regulation_ref: 'SGB VII §193; DGUV Vorschrift 1 §6',
  },
  {
    incident_type: 'Arbeitsunfall ohne Arbeitsunfaehigkeit oder <= 3 Tage',
    reportable: 1,
    deadline: 'Eintrag im Verbandbuch',
    notify: 'Interner Eintrag (keine Meldung an SVLFG erforderlich)',
    method: 'Eintrag im Verbandbuch (Dokumentation nach DGUV Vorschrift 1 §24). Das Verbandbuch dient der Beweissicherung fuer den Fall spaeterer Folgen. Aufbewahrung mindestens 5 Jahre.',
    record_retention_years: 5,
    regulation_ref: 'DGUV Vorschrift 1 §24',
  },
  {
    incident_type: 'Berufskrankheit (BK)',
    reportable: 1,
    deadline: 'Meldung bei begruendetem Verdacht',
    notify: 'SVLFG und Gewerbeaufsicht',
    method: 'Aerztliche Anzeige bei begruendetem Verdacht auf eine Berufskrankheit (BK-Anzeige). Haeufige BK in der Landwirtschaft: BK 5103 (Hautkrebs durch UV), BK 4301 (Atemwegserkrankungen durch Allergene), BK 2101 (Sehnenscheidenentzuendung), BK 2108 (Bandscheibenvorfall durch Heben/Tragen), BK 3102 (Zoonosen). Verzeichnis nach BKV (Berufskrankheiten-Verordnung).',
    record_retention_years: 30,
    regulation_ref: 'SGB VII §193, §202; BKV (Berufskrankheiten-Verordnung); ArbMedVV',
  },
  {
    incident_type: 'Umweltvorfall (Gefahrstoffaustritt, Guelleunfall)',
    reportable: 1,
    deadline: 'Sofortige Meldung',
    notify: 'Untere Wasserbehoerde und/oder Ordnungsamt, ggf. Feuerwehr',
    method: 'Sofortige telefonische Meldung bei Austritt wassergefaehrdender Stoffe (Guelle, Pflanzenschutzmittel, Dieselkraftstoff). Betrifft: Guelleaustritt in Gewaesser, PSM-Verschuettung, Dieselleckage. Untere Wasserbehoerde und Feuerwehr (112). Schriftlicher Bericht innerhalb von 48 Stunden.',
    record_retention_years: 5,
    regulation_ref: 'WHG §62; AwSV; USchadG (Umweltschadensgesetz)',
  },
  {
    incident_type: 'Kontrolle durch die Gewerbeaufsicht — Anordnungen und Bussgelder',
    reportable: 0,
    deadline: 'Gemaess der Frist in der Anordnung',
    notify: 'Der Arbeitgeber erhaelt die Anordnung der zustaendigen Behoerde',
    method: 'Die Gewerbeaufsichtsaemter (in einigen Laendern: Arbeitsschutzbehoerden, Bezirksregierungen) koennen: (1) Anordnungen treffen, (2) Fristen zur Maengelbeseitigung setzen, (3) Bussgelder verhaengen (ArbSchG §25: bis 30.000 EUR je Verstoss), (4) bei unmittelbarer Gefahr die Taetigkeit untersagen. Bei fahrlaessiger Koerperverletzung oder Toetung: strafrechtliche Konsequenzen (StGB §222, §229).',
    record_retention_years: 5,
    regulation_ref: 'ArbSchG §22 (Behoerdliche Anordnungen), §25 (Bussgelder); StGB §222, §229',
  },
  {
    incident_type: 'Schwerer Unfall mit mehreren Verletzten oder Gefahr fuer die Oeffentlichkeit',
    reportable: 1,
    deadline: 'Sofortige Meldung',
    notify: 'SVLFG, Gewerbeaufsicht und ggf. Polizei',
    method: 'Sofortige telefonische Meldung. Besondere Meldepflicht bei Massenunfaellen oder wenn eine Gefahr fuer die Oeffentlichkeit besteht (z.B. Ammoniakfreisetzung, Guelleunfall in Gewaesser). Unfallanzeige innerhalb von 3 Tagen.',
    record_retention_years: 30,
    regulation_ref: 'SGB VII §193; DGUV Vorschrift 1 §6; 12. BImSchV (Stoerfallverordnung)',
  },
];

// ---------------------------------------------------------------------------
// 13. COSHH / GEFAHRSTOFF-GUIDANCE
// ---------------------------------------------------------------------------
const coshhGuidance = [
  {
    substance_type: 'Pflanzenschutzmittel (Herbizide, Fungizide, Insektizide)',
    activity: 'Ansetzen, Spritzen und Reinigung der Geraete',
    assessment_required: 1,
    ppe: 'Chemikalienschutzhandschuhe (EN 374), Schutzanzug Typ 4/5/6, Atemschutz A2P3, Gesichtsschutz',
    storage_requirements: 'Abschliessbarer, beluefteter Lagerraum mit Auffangwanne (Rueckhaltevolumen mindestens 10% des Gesamtvolumens oder 100% des groessten Gebindes). Getrennt von Lebensmitteln und Futtermitteln. Sicherheitsdatenblaetter zugaenglich. Pflanzenschutz-Aufzeichnungen fuehren (3 Jahre Aufbewahrung).',
    disposal_requirements: 'Leere Verpackungen dreimal spuelen und ueber PAMIRA (Packmittel-Ruecknahme Agrar) entsorgen. Nicht verwendbare Restmengen als Sondermull ueber kommunale Sammelstellen oder spezialisierte Entsorger.',
    regulation_ref: 'GefStoffV §6, §14; PflSchG §9, §11; TRGS 400; PAMIRA',
  },
  {
    substance_type: 'Guellegase (H2S, NH3, CH4)',
    activity: 'Ruehren der Guelle und Befahren von Guellegruben',
    assessment_required: 1,
    ppe: 'Persoenliches H2S-Gaswarngeraet, umluftunabhaengiger Atemschutz, Auffanggurt mit Rettungsleine',
    storage_requirements: 'Guellebehaelter belueften. Abdeckung oder Umzaeunung der Grube als Absturzsicherung. Explosionsschutz (ATEX) bei Methanbildung beachten.',
    disposal_requirements: 'Ausbringung gemaess Duengeverordnung (DuengeVO): Sperrfristen, Aufbringungsobergrenzen (170 kg N/ha organisch), Abstands- und Aufbringungstechnik-Vorschriften.',
    regulation_ref: 'DGUV Regel 113-004; GefStoffV; VSG 2.1 SVLFG; DuengeVO; TRGS 900',
  },
  {
    substance_type: 'Silogase (CO2, NO2, N2)',
    activity: 'Befahren von Silos und Gaerfutterlagerstaetten',
    assessment_required: 1,
    ppe: 'Multigasmessgeraet (O2, CO2, H2S, UEG), umluftunabhaengiger Atemschutz, Auffanggurt mit Rettungsleine',
    storage_requirements: 'Silo fuer Unbefugte gesperrt. Warnschilder angebracht. Lueftungsoeffnungen vorhanden.',
    disposal_requirements: 'Nicht anwendbar (Gase verfluchtigen sich natuerlich durch Belueftung).',
    regulation_ref: 'DGUV Regel 113-004; GefStoffV; TRGS 900; VSG 3.1 SVLFG',
  },
  {
    substance_type: 'Dieselkraftstoff und Schmierstoffe',
    activity: 'Betankung und Lagerung auf dem Betrieb',
    assessment_required: 1,
    ppe: 'Chemikalienschutzhandschuhe, Schutzbrille',
    storage_requirements: 'Doppelwandiger Tank oder Auffangwanne (100% Rueckhaltevolumen). Mindestabstand 5 Meter zu Gebaeuden. Feuerloecher in der Naehe der Zapfstelle. WHG-Fachbetrieb fuer Aufstellung.',
    disposal_requirements: 'Altoel durch zugelassenen Altoel-Sammler abholen lassen. Oelbindemittel fuer verschuettete Mengen bereithalten.',
    regulation_ref: 'AwSV; WHG §62; BetrSichV; TRGS 509',
  },
  {
    substance_type: 'Ammoniak (Stallgebaeude)',
    activity: 'Arbeiten in Stallgebaeuden mit hoher Ammoniakkonzentration',
    assessment_required: 1,
    ppe: 'Atemschutz mit K-Filter (Ammoniak), Schutzbrille',
    storage_requirements: 'Stallbelueftung gemaess TA Luft sicherstellen. AGW Ammoniak: 20 ppm (8-Stunden-Mittelwert, TRGS 900). Abluftreinigungsanlage bei genehmigungspflichtigen Anlagen.',
    disposal_requirements: 'Abluftreinigungssysteme bei ICPE-Anlagen (BImSchG). Emissionskataster fuehren.',
    regulation_ref: 'GefStoffV; TRGS 900; TA Luft 2021; BImSchG; 4. BImSchV',
  },
  {
    substance_type: 'Staeube (Getreide, Heu, Futtermittel)',
    activity: 'Ernte, Lagerung und Futtermittelverteilung',
    assessment_required: 1,
    ppe: 'FFP2- oder P2-Atemschutz, Schutzbrille',
    storage_requirements: 'Absaugung an der Staubquelle. ATEX-konforme Elektroinstallation in Getreidelagern. Regelmaessige Reinigung. AGW A-Staub: 1,25 mg/m3; E-Staub: 10 mg/m3.',
    disposal_requirements: 'Organische Staeube: Kompostierung. Kontaminierte Staeube: Entsorgung als Abfall.',
    regulation_ref: 'GefStoffV; TRGS 900; BetrSichV Anhang 1 Nr. 4; ATEX-Richtlinie 2014/34/EU',
  },
  {
    substance_type: 'Desinfektionsmittel und Reinigungsmittel (Stallhygiene)',
    activity: 'Stalldesinfektion, Melkstandreinigung, Tiertransportreinigung',
    assessment_required: 1,
    ppe: 'Chemikalienschutzhandschuhe (EN 374), Schutzkittel oder Schutzanzug, Schutzbrille, ggf. Atemschutz',
    storage_requirements: 'Lagerung getrennt von Futtermitteln. Sicherheitsdatenblatt beachten. Betriebsanweisung nach GefStoffV erstellen.',
    disposal_requirements: 'Restmengen und leere Behaelter gemaess Herstellerangaben und kommunaler Satzung entsorgen. Nicht in Gewaesser einleiten.',
    regulation_ref: 'GefStoffV §14; BiozidV (Biozid-Verordnung EU 528/2012); TRGS 555',
  },
  {
    substance_type: 'CMR-Stoffe (krebserzeugend, keimzellmutagen, reproduktionstoxisch)',
    activity: 'Umgang mit als CMR eingestuften Stoffen auf dem Betrieb',
    assessment_required: 1,
    ppe: 'Geschlossenes System bevorzugen. Bei offener Handhabung: Schutzanzug Typ 3, Vollmaske A2B2P3, doppelte Nitrilhandschuhe',
    storage_requirements: 'Separate Lagerung in verschlossenem Raum mit eingeschraenktem Zugang. Expositionsverzeichnis fuehren (Aufbewahrung 40 Jahre). Beispiele in der Landwirtschaft: Formaldehyd (Desinfektion), einige als CMR eingestufte Pflanzenschutzmittel, Dieselruss.',
    disposal_requirements: 'Gefaehrliche Abfaelle ueber zugelassenen Entsorger. Trennung von normalen Abfaellen. Entsorgungsnachweis (Abfallbegleitschein) obligatorisch.',
    regulation_ref: 'GefStoffV §6 (Substitutionspflicht), §10 (besondere Schutzmassnahmen); TRGS 410; CLP-Verordnung (EG) 1272/2008',
  },
];

// ---------------------------------------------------------------------------
// 14. RISK ASSESSMENT TEMPLATES (Vorlagen Gefaehrdungsbeurteilung)
// ---------------------------------------------------------------------------
const riskAssessmentTemplates = [
  {
    activity: 'Traktor fahren',
    hazards: 'Ueberrollen auf Haengen; Erfassen durch Zapfwelle/Gelenkwelle; Absturz vom Traktor; Anfahren von Personen',
    controls: 'ROPS montiert; Sicherheitsgurt angelegt; Zapfwellenschutz angebracht; taegliche Kontrolle von Bremsen und Reifen',
    residual_risk: 'Gering bei Einhaltung aller Massnahmen.',
    review_frequency: 'Jaehrlich',
  },
  {
    activity: 'Umgang mit Rindern',
    hazards: 'Quetschen durch Rinder; Tritte und Kopfstoesse; Ausrutschen im Stall; Uebergriffe durch Kuehe mit Kalb',
    controls: 'Fangstand und Treibgang; Mannloecher in jedem Bereich; rutschfester Stallboden; ruhiges Verhalten',
    residual_risk: 'Mittel — Tierverhalten bleibt unberechenbar.',
    review_frequency: 'Jaehrlich',
  },
  {
    activity: 'Arbeiten in der Hoehe (Daecher, Stallgebaeude)',
    hazards: 'Absturz von Daechern; Durchbrechen durch nicht tragfaehige Dachplatten; Abrutschen',
    controls: 'Seitenschutz (Gelaender); Auffangnetz oder Auffanggurt; nicht tragfaehige Flaechen markiert; Laufstege auf dem Dach',
    residual_risk: 'Gering bei vorhandenen kollektiven Schutzmassnahmen.',
    review_frequency: 'Vor jeder Arbeit in der Hoehe',
  },
  {
    activity: 'Einstieg in Guellegruben und Ruehren',
    hazards: 'H2S-Vergiftung; Erstickung; Methangasexplosion; Ertrinken',
    controls: 'Gasmessung vor Einstieg; Zwangsbelueftung; niemals allein arbeiten; Auffanggurt mit Rettungsleine; Sicherungsposten an der Oberflaeche',
    residual_risk: 'Mittel — H2S ist schnell toedlich, Restrisiko bei Versagen der Gasmessung.',
    review_frequency: 'Vor jedem Einstieg',
  },
  {
    activity: 'Anwendung von Pflanzenschutzmitteln',
    hazards: 'Vergiftung durch Hautkontakt/Einatmen; Augenreizung; Umweltkontamination',
    controls: 'Sachkundenachweis gueltig; PSA gemaess SDB getragen; Abdriftminimierung; Geraetepruefung aktuell',
    residual_risk: 'Gering mit korrekter PSA und geschultem Anwender.',
    review_frequency: 'Vor jeder Behandlungssaison',
  },
  {
    activity: 'Silobegehung',
    hazards: 'Erstickung durch CO2/N2; Staubexplosion; Absturz in den Silo; Verschuettung',
    controls: 'Befahrerlaubnis (Erlaubnisschein); Multigasmessung; Zwangsbelueftung; Auffanggurt mit Rettungsleine; Sicherungsposten; Rettungsplan',
    residual_risk: 'Mittel — Gase koennen sich unvorhersehbar ansammeln.',
    review_frequency: 'Vor jedem Einstieg',
  },
  {
    activity: 'Alleinarbeit auf dem Betrieb',
    hazards: 'Fehlende Hilfe bei Unfall; verlaengerte Gefahrenexposition; Stress durch Isolation',
    controls: 'PNA-System (Personen-Notsignal-Anlage); Mobiltelefon; Arbeitsplanung geteilt; Kontrollkontakte zu festen Zeiten; Verbot gefaehrlicher Alleinarbeit',
    residual_risk: 'Mittel — abhaengig von der Art der Taetigkeit.',
    review_frequency: 'Jaehrlich',
  },
  {
    activity: 'Gefaehrdungsbeurteilung des Gesamtbetriebs',
    hazards: 'Alle ermittelten Gefaehrdungen des Betriebs',
    controls: 'Systematische Erfassung aller Gefaehrdungen nach Arbeitsbereichen. Massnahmenplan mit STOP-Prinzip (Substitution, Technisch, Organisatorisch, Persoenlich). Verantwortliche und Fristen benennen. SVLFG-Vorlagen nutzen.',
    residual_risk: 'Abhaengig von der Umsetzung des Massnahmenplans.',
    review_frequency: 'Jaehrlich oder bei Aenderung der Arbeitsverhaeltnisse',
  },
  {
    activity: 'Muskel-Skelett-Erkrankungen (MSE)',
    hazards: 'Rueckenschaeden durch Heben schwerer Lasten; MSE der oberen Extremitaeten durch Wiederholungsbewegungen; Kniebeschwerden',
    controls: 'Mechanische Hilfsmittel (Sackkarren, Hubwagen); Leitmerkmalmethode anwenden; Taetigkeitswechsel; ergonomische Arbeitsplaetze; Unterweisung in rueckenschonendem Arbeiten',
    residual_risk: 'Mittel — MSE sind die haeufigste Berufskrankheit in der Landwirtschaft.',
    review_frequency: 'Jaehrlich oder bei Aenderung der Taetigkeit',
  },
  {
    activity: 'Psychische Belastungen',
    hazards: 'Arbeitsueberlastung in Spitzenzeiten; Isolation; finanzieller Druck; Konflikte bei Hofuebergabe',
    controls: 'Arbeitsorganisation an saisonale Spitzen anpassen; SVLFG Krisentelefon (0561 785-10101); Landwirtschaftliche Familienberatung; Betriebshelfer der Maschinenringe',
    residual_risk: 'Mittel — in der Landwirtschaft haeufig unterschaetztes Risiko.',
    review_frequency: 'Jaehrlich (Teil der Gefaehrdungsbeurteilung)',
  },
  {
    activity: 'Biologische Gefaehrdungen (Zoonosen)',
    hazards: 'Q-Fieber, Leptospirose, Borreliose/Lyme, Brucellose, FSME; Schimmelpilzsporen; Endotoxine',
    controls: 'Hygieneprotokoll (Haendewaschen, Kleidungswechsel); FFP2/FFP3 bei staubigen Arbeiten; FSME-Impfung in Risikogebieten; Zeckenkontrolle; Stallbelueftung',
    residual_risk: 'Mittel bis hoch je nach Tierart und Arbeitsbedingungen.',
    review_frequency: 'Jaehrlich oder bei Seuchenausbruch',
  },
  {
    activity: 'Motorsaegenarbeit und Forstarbeiten',
    hazards: 'Schnittverletzungen durch Rueckschlag (Kickback); herabfallende Aeste/Baeume; Gehoerschaeden; Hand-Arm-Vibration; Einklemmen',
    controls: 'Motorsaegen-Ausbildung (DGUV 214-059); vollstaendige Forst-PSA; sichere Faelltechnik; nie allein bei Faellarbeiten; Arbeitsbereich absperren',
    residual_risk: 'Mittel — Forstarbeit zaehlt zu den gefaehrlichsten Taetigkeiten in der Landwirtschaft.',
    review_frequency: 'Vor jeder Forstarbeitssaison',
  },
];

// ---------------------------------------------------------------------------
// 15. FTS5 SEARCH INDEX
// ---------------------------------------------------------------------------
const searchIndexEntries = [
  // Maschinensicherheit
  { title: 'Traktor Ueberrollschutz ROPS Sicherheitsgurt', body: 'ROPS Ueberrollschutzstruktur Pflicht auf allen Traktoren. Sicherheitsgurt anlegen. Ueberrollen auf Haengen. BetrSichV. Maschinenrichtlinie 2006/42/EG. VSG 3.1 SVLFG.', topic: 'machinery' },
  { title: 'Traktor Zapfwelle Gelenkwelle Schutzabdeckung', body: 'Schutzabdeckung der Zapfwelle immer angebracht. Gelenkwellenschutz vorgeschrieben. Erfassen und Aufwickeln. Eng anliegende Kleidung. BetrSichV. VSG 3.1.', topic: 'machinery' },
  { title: 'Maehdrescher Schutzvorrichtungen Not-Aus Brandgefahr', body: 'Schutzvorrichtungen am Maehdrescher. Not-Aus-Schalter zugaenglich. Brandgefahr durch Staub. Reinigung. BetrSichV. StVO Kenntlichmachung.', topic: 'machinery' },
  { title: 'Teleskoplader Radlader Befaehigungsnachweis Standsicherheit', body: 'Befaehigungsnachweis DGUV 308-009 Pflicht. Jaehrliche Pruefung. Tragfaehigkeit Lastdiagramm. Umkippen. DGUV Vorschrift 68. BetrSichV §14.', topic: 'machinery' },
  { title: 'Pflanzenschutzspritze Sachkundenachweis Geraetekontrolle', body: 'Sachkundenachweis Pflicht PflSchG §9. Geraetekontrolle alle 3 Jahre Plakettenpflicht. Abdriftminimierung. GefStoffV Betriebsanweisung.', topic: 'machinery' },
  { title: 'Motorsaege PSA Forstausbildung Kickback Rueckschlag', body: 'Motorsaegenausbildung DGUV 214-059. Schnittschutzhose EN 381-5. Forsthelm Visier. Rueckschlag Kickback Praevention. Hand-Arm-Vibration. VSG 4.1 SVLFG.', topic: 'machinery' },
  { title: 'Landmaschinen CE-Konformitaet Prueffristen BetrSichV', body: 'CE-Konformitaet vor Inbetriebnahme. Prueffristen BetrSichV §14. Vorbeugende Wartung. Betriebsanleitung. Maschinenrichtlinie 2006/42/EG. ProdSG.', topic: 'machinery' },
  { title: 'Ballenpresse Haecksler Verstopfung Wartung Brandgefahr', body: 'Motor abstellen vor Wartung. Schutzvorrichtungen nicht demontieren. Verstopfungen nur mit Werkzeug. Feuerloecher mitfuehren. BetrSichV. VSG 3.1.', topic: 'machinery' },
  { title: 'Foerderschnecke Einfuellschutz Getreide Transport', body: 'Einfuelltrichter mit Schutzgitter. Rotierende Schnecken. Amputationsgefahr. Motor abstellen vor Reinigung. BetrSichV. VSG 3.1. DGUV 209-020.', topic: 'machinery' },

  // Tierhaltung
  { title: 'Rinder Fixierung Fangstand Treibgang Bullen', body: 'Fangstand und Treibgang fuer sichere Rinderhandhabung. Bullen ab 12 Monaten mit Nasenring. Mannloecher Fluchtmoeglichkeit. VSG 2.1 SVLFG. DGUV 214-016.', topic: 'livestock' },
  { title: 'Melken Trittsicherheit Ergonomie Melkstand Zoonosen', body: 'Ergonomischer Melkstand. Trittsicherheit. Q-Fieber Leptospirose MRSA. Muskel-Skelett-Erkrankungen Melken. LasthandhabV. VSG 2.1.', topic: 'livestock' },
  { title: 'Schweine Stallsicherheit Biosicherheit ASP Verladung', body: 'Treibbretter Verladung 5-6 Tiere. Biosicherheit Hygieneschleuse. ASP Praevention. Stallbelueftung Ammoniak. SchHaltHygV. VSG 2.1.', topic: 'livestock' },
  { title: 'Pferde Umgang Hufpflege Fluchttiere Reithelm', body: 'Seitliches Herantreten an Pferde. Panikhaken Sicherheitsanbinder. Hufschmied qualifiziert. Reithelm Pflicht. VSG 2.1 SVLFG. DGUV 214-021.', topic: 'livestock' },
  { title: 'Gefluegel Staeube Farmerlunge Ausstallen Allergie', body: 'Staubkonzentration Federn Kot Einstallen Ausstallen. Farmerlunge Hypersensitivitaetspneumonitis. FFP2/FFP3. BioStoffV. TRBA 230.', topic: 'livestock' },
  { title: 'Schafe Schafschur Klauenpflege MSE Zoonosen', body: 'Ergonomischer Schurtisch. MSE gebueckte Haltung. Ecthyma Q-Fieber Orf. Klauenpflege Fixierung Kippstand. LasthandhabV. VSG 2.1.', topic: 'livestock' },

  // Gefahrstoffe
  { title: 'Pflanzenschutzmittel PSA Lagerung Betriebsanweisung SDB', body: 'Sachkundenachweis Pflicht. Chemikalienschutzhandschuhe EN 374 Schutzanzug Atemschutz A2P3. Abschliessbarer Lagerraum Auffangwanne. SDB. GefStoffV §14. PflSchG.', topic: 'chemical' },
  { title: 'Sicherheitsdatenblatt AGW Betriebsanweisung Gefahrstoffe', body: 'Sicherheitsdatenblatt 16 Abschnitte. Betriebsanweisung GefStoffV §14. Arbeitsplatzgrenzwerte AGW. ArbMedVV Vorsorge. REACH 1907/2006. TRGS 555.', topic: 'chemical' },
  { title: 'Guelle H2S Schwefelwasserstoff Guellegruben Erstickung', body: 'H2S toedlich ab 100 ppm. Niemals allein an Guellegruben. Gaswarngeraet H2S. Zwangsbelueftung. Tiere entfernen. DGUV 113-004. VSG 2.1.', topic: 'chemical' },
  { title: 'Silo Gase CO2 NO2 Erstickung Verschuettung Getreidesilo', body: 'CO2 NO2 verdraengen Sauerstoff im Silo. Befahrerlaubnis. Gasmessung. Zwangsbelueftung 30 Minuten. Auffanggurt Rettungsleine. DGUV 113-004.', topic: 'chemical' },
  { title: 'Kraftstoff Diesel Schmierstoff Lagerung Brandgefahr', body: 'Doppelwandiger Tank oder Auffangwanne. Feuerloecher Zapfstelle. Rauchverbot. AwSV WHG §62. TRGS 509.', topic: 'chemical' },
  { title: 'Ammoniak Stallgebaeude Belueftung AGW TA Luft', body: 'AGW Ammoniak 20 ppm TRGS 900. Atemschutz K-Filter. Stallbelueftung. Abluftreinigung BImSchG. TA Luft 2021.', topic: 'chemical' },
  { title: 'Staeube Getreide Heu Staubexplosion ATEX Farmerlunge', body: 'A-Staub AGW 1,25 mg/m3 E-Staub 10 mg/m3 TRGS 900. ATEX Getreidelager. FFP2 Atemschutz. Explosionsgefahr. BetrSichV Anhang 1.', topic: 'chemical' },
  { title: 'CMR-Stoffe krebserzeugend Substitution Expositionsverzeichnis', body: 'Formaldehyd CMR-Pflanzenschutzmittel Dieselruss. Substitutionspflicht GefStoffV §6. Expositionsverzeichnis 40 Jahre. TRGS 410. CLP 1272/2008.', topic: 'chemical' },

  // Absturzgefahr
  { title: 'Arbeiten Hoehe Daecher Absturz Lichtplatten Seitenschutz', body: 'Kollektive Schutzmassnahmen Vorrang. Seitenschutz Auffangnetze Auffanggurt. Lichtplatten markieren. TRBS 2121. ArbStaettV. DGUV 112-198.', topic: 'height' },
  { title: 'Silo Trocknungsanlage Steigleiter Rueckenschutz Podeste', body: 'Steigschutzeinrichtung ab 3 Meter. Ruhepodeste alle 6 Meter. Plattform mit Gelaender. TRBS 2121 Teil 1. ASR A1.8.', topic: 'height' },
  { title: 'Obstbau Leitern Hubarbeitsbuehne Baumschnitt', body: 'Leiter fester Untergrund 65-75 Grad. Hubarbeitsbuehne ab 3 Meter. Baumschere Arretierung. TRBS 2121 Teil 2. DGUV 208-016.', topic: 'height' },
  { title: 'Heustock Silobefuellung Absturz Verschuettung Getreidesilo', body: 'Absturzsicherung offene Kanten. Getreidesilos nie betreten beim Befuellen. Brueckenbildung nicht von oben loesen. TRBS 2121. DGUV 113-004.', topic: 'height' },

  // Alleinarbeit
  { title: 'Alleinarbeit PNA Personen-Notsignal-Anlage Totmannschaltung', body: 'Alleinarbeit Guellegruben Silos verboten. PNA DGUV 112-139. Mobiltelefon. Kontrollkontakte feste Zeiten. ArbSchG §5. VSG 1.1.', topic: 'lone_working' },

  // Gefaehrdungsbeurteilung
  { title: 'Gefaehrdungsbeurteilung ArbSchG §5 Pflichtdokument', body: 'Pflicht fuer jeden Arbeitgeber. Dokumentation ArbSchG §6. Aktualisierung bei Aenderung. Massnahmenplan STOP-Prinzip. SVLFG Handlungshilfen. DGUV Vorschrift 1.', topic: 'risk_assessment' },
  { title: 'Gefaehrdungsbeurteilung Methodik STOP-Prinzip GDA', body: 'Gefaehrdungen ermitteln mechanisch elektrisch chemisch biologisch psychisch. STOP-Prinzip Substitution Technisch Organisatorisch Persoenlich. GDA-Leitlinien. ArbSchG §4 §5.', topic: 'risk_assessment' },

  // SVLFG
  { title: 'SVLFG Unfallstatistik Praevention Landwirtschaft Berufsgenossenschaft', body: 'Jaehrlich ca. 20 toedliche Arbeitsunfaelle. Hauptursachen Traktor Sturz Tiere Forst. SGB VII. SVLFG Praeventionsbericht. Praeventionsangebote Seminare Zuschuessprogramme.', topic: 'reporting' },

  // PSA
  { title: 'PSA Persoenliche Schutzausruestung CE Pflichten Landwirtschaft', body: 'Arbeitgeber stellt PSA kostenlos. CE-Kennzeichnung PSA-Verordnung EU 2016/425. Unterweisung Benutzung Pflege. PSA-BV. ArbSchG §3. DGUV Regel 112-xxx.', topic: 'chemical' },

  // Hitze und UV
  { title: 'Hitzearbeit UV-Schutz Hautkrebs BK 5103 Sonnenschutz', body: 'Hitzschlag Hitzeerschoepfung Feldarbeit. UV-Strahlung Hautkrebs BK 5103 Berufskrankheit. Kopfbedeckung Sonnenschutz LSF 50. ASR A3.5. ArbSchG §5.', topic: 'risk_assessment' },

  // Mutterschutz
  { title: 'Mutterschutz Schwangere Landwirtschaft Beschaeftigungsverbot', body: 'MuSchG 2018. Gefaehrdungsbeurteilung §10. Kein CMR-Kontakt kein schweres Heben kein Nachtarbeit. Freistellung Mutterschutzlohn. Kuendigungsschutz.', topic: 'risk_assessment' },

  // Kinder und Jugendliche
  { title: 'Jugendarbeitsschutz Kinder Landwirtschaft JArbSchG Azubi', body: 'Unter 13 verboten. 13-14 leichte Taetigkeiten elterlicher Betrieb 2 Stunden. 15-17 8 Stunden taeglich keine Nachtarbeit. Azubi Sicherheitsunterweisung. JArbSchG §5 §22.', topic: 'children' },
  { title: 'Jugendliche Traktor Fuehrerschein Klasse T Ausbildung', body: 'Traktorfahren Betriebsgelaende nach Unterweisung. Oeffentliche Strasse Fuehrerschein T ab 16 Jahre. ROPS Sicherheitsgurt. FeV §10. JArbSchG.', topic: 'children' },
  { title: 'Kinder Landwirte elterlicher Betrieb Aufsichtspflicht SVLFG', body: 'Kinder Betriebsleiter nicht unter JArbSchG. Aufsichtspflicht BGB §832. SVLFG empfiehlt gleiche Schutzstandards wie fuer Arbeitnehmer.', topic: 'children' },

  // Meldepflicht
  { title: 'Unfallanzeige SVLFG 3 Tage Meldepflicht SGB VII', body: 'Meldepflicht SGB VII §193. Toedlicher Unfall sofort melden. Arbeitsunfaehigkeit ueber 3 Tage: Unfallanzeige 3 Tage. Verbandbuch. DGUV Vorschrift 1 §6 §24.', topic: 'reporting' },
  { title: 'Berufskrankheit BK-Anzeige UV-Hautkrebs MSE Zoonosen', body: 'BK 5103 Hautkrebs UV. BK 4301 Atemwege Allergene. BK 2108 Bandscheibenvorfall. BK 3102 Zoonosen. Berufskrankheiten-Verordnung BKV. SGB VII §193.', topic: 'reporting' },
  { title: 'Gewerbeaufsicht Kontrolle Bussgelder Anordnungen Arbeitsschutz', body: 'Bussgelder bis 30.000 EUR ArbSchG §25. Anordnungen Maengelbeseitigung. Taetigkeitsuntersagung bei Gefahr. StGB §222 §229 fahrlaessige Koerperverletzung Toetung.', topic: 'reporting' },

  // MSE und Psyche
  { title: 'Muskel-Skelett-Erkrankungen MSE Heben Tragen Leitmerkmalmethode', body: 'Rueckenschaeden Heben Lasten. Mechanische Hilfsmittel Sackkarren Hubwagen. Leitmerkmalmethode. LasthandhabV. DGUV 208-033. Ergonomische Arbeitsplaetze.', topic: 'risk_assessment' },
  { title: 'Psychische Belastungen Stress Landwirtschaft Krisentelefon', body: 'Arbeitsueberlastung Ernte Isolation finanzieller Druck Hofuebergabe. SVLFG Krisentelefon 0561 785-10101. Familienberatung. ArbSchG §5 psychische Belastung.', topic: 'risk_assessment' },

  // Zoonosen
  { title: 'Zoonosen Q-Fieber Borreliose Leptospirose FSME Landwirtschaft', body: 'Q-Fieber Leptospirose Borreliose Lyme FSME Brucellose. Farmerlunge Schimmelpilze. Hygiene FFP2 FSME-Impfung Zeckenkontrolle. BioStoffV TRBA 230.', topic: 'risk_assessment' },

  // Elektrische Sicherheit
  { title: 'Elektrische Sicherheit Stall FI-Schutzschalter DIN VDE 0100-705', body: 'Stromschlag feuchte Umgebung Stall. FI-Schutzschalter 30 mA. DIN VDE 0100-705 landwirtschaftliche Betriebsstaetten. DGUV Vorschrift 3 Pruefung.', topic: 'machinery' },

  // Desinfektionsmittel
  { title: 'Desinfektionsmittel Stallhygiene Reinigung Melkstand Betriebsanweisung', body: 'Stalldesinfektion Reinigungsmittel. Betriebsanweisung GefStoffV. Getrennt von Futtermitteln lagern. EN 374 Handschuhe. BiozidV EU 528/2012. TRGS 555.', topic: 'chemical' },
];

// ---------------------------------------------------------------------------
// Execute inserts inside a transaction
// ---------------------------------------------------------------------------
console.log('Starting Germany farm safety data ingestion...');

const insertAll = db.instance.transaction(() => {
  // Clear existing data
  db.run('DELETE FROM safety_guidance');
  db.run('DELETE FROM children_rules');
  db.run('DELETE FROM reporting_requirements');
  db.run('DELETE FROM coshh_guidance');
  db.run('DELETE FROM risk_assessment_templates');
  db.run('DELETE FROM search_index');

  // Insert all data
  insertSafetyGuidance(allSafetyGuidance);
  console.log(`  Inserted ${allSafetyGuidance.length} safety guidance entries`);

  insertChildrenRules(childrenRules);
  console.log(`  Inserted ${childrenRules.length} children rules`);

  insertReportingRequirements(reportingRequirements);
  console.log(`  Inserted ${reportingRequirements.length} reporting requirements`);

  insertCoshhGuidance(coshhGuidance);
  console.log(`  Inserted ${coshhGuidance.length} chemical/COSHH guidance entries`);

  insertRiskAssessmentTemplates(riskAssessmentTemplates);
  console.log(`  Inserted ${riskAssessmentTemplates.length} risk assessment templates`);

  insertSearchIndex(searchIndexEntries);
  console.log(`  Inserted ${searchIndexEntries.length} FTS5 search index entries`);

  // Update metadata
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('record_count', ?)", [
    String(
      allSafetyGuidance.length +
      childrenRules.length +
      reportingRequirements.length +
      coshhGuidance.length +
      riskAssessmentTemplates.length
    ),
  ]);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('fts_entries', ?)", [
    String(searchIndexEntries.length),
  ]);
});

insertAll();

// Rebuild FTS5 index
console.log('  Rebuilding FTS5 index...');
db.run("INSERT INTO search_index(search_index) VALUES('rebuild')");

// Write coverage JSON
const stats = {
  mcp_name: 'Germany Farm Safety MCP',
  jurisdiction: 'DE',
  build_date: now,
  status: 'populated',
  sources: [
    'SVLFG (Sozialversicherung fuer Landwirtschaft, Forsten und Gartenbau)',
    'ArbSchG (Arbeitsschutzgesetz)',
    'DGUV (Deutsche Gesetzliche Unfallversicherung)',
    'BetrSichV (Betriebssicherheitsverordnung)',
    'GefStoffV (Gefahrstoffverordnung)',
    'BAuA (Bundesanstalt fuer Arbeitsschutz und Arbeitsmedizin)',
    'VSG 1.1-4.1 (Unfallverhuetungsvorschriften SVLFG)',
    'PflSchG (Pflanzenschutzgesetz)',
    'JArbSchG (Jugendarbeitsschutzgesetz)',
    'MuSchG (Mutterschutzgesetz)',
    'BioStoffV (Biostoffverordnung)',
    'TA Luft 2021',
  ],
  record_counts: {
    safety_guidance: allSafetyGuidance.length,
    children_rules: childrenRules.length,
    reporting_requirements: reportingRequirements.length,
    coshh_guidance: coshhGuidance.length,
    risk_assessment_templates: riskAssessmentTemplates.length,
    fts_search_entries: searchIndexEntries.length,
    total: allSafetyGuidance.length + childrenRules.length + reportingRequirements.length + coshhGuidance.length + riskAssessmentTemplates.length,
  },
  categories: [
    'Maschinensicherheit (Traktoren, Maehdrescher, Teleskoplader, Pflanzenschutzspritzen, Motorsaegen, Ballenpressen, Foerderschnecken, CE-Konformitaet)',
    'Tierhaltung und Tierumgang (Rinder, Schweine, Pferde, Gefluegel, Schafe)',
    'Gefahrstoffe (Pflanzenschutzmittel, SDB/Betriebsanweisung, Guellegase/H2S, Silogase, Kraftstoff, Ammoniak, Staeube/ATEX, Holzschutzmittel/CMR)',
    'Absturzgefahr (Daecher, Silos, Obstbau, Heustockarbeiten)',
    'Alleinarbeit (PNA, DGUV 112-139)',
    'Gefaehrdungsbeurteilung (ArbSchG §5, STOP-Prinzip, Dokumentation)',
    'SVLFG Unfallstatistik und Praevention',
    'PSA-Pflichten (PSA-BV, CE-Kennzeichnung)',
    'Hitzearbeit und UV-Schutz (BK 5103)',
    'Mutterschutz, MSE, psychische Belastungen, Zoonosen, elektrische Sicherheit',
    'Jugendarbeitsschutz (JArbSchG, Kinder auf dem Betrieb, Ausbildung)',
    'Meldepflicht Arbeitsunfaelle (SVLFG, SGB VII, Berufskrankheiten, Gewerbeaufsicht)',
    'Vorlagen Gefaehrdungsbeurteilung (Traktor, Rinder, Hoehe, Guelle, PSM, Silo, Alleinarbeit, MSE, Psyche, Zoonosen, Motorsaege)',
  ],
};

writeFileSync('data/coverage.json', JSON.stringify(stats, null, 2));

db.close();

console.log('');
console.log(`Ingestion complete: ${stats.record_counts.total} records + ${searchIndexEntries.length} FTS5 entries`);
console.log(`Database: data/database.db`);
console.log(`Coverage: data/coverage.json`);
