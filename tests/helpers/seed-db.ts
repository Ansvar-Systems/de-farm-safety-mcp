import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Machinery safety
  db.run(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Traktor Ueberrollschutz ROPS',
      'tractor',
      null,
      'Ueberrollen auf Haengen, weichem oder unebenem Gelaende. Haeufigste toedliche Unfallursache in der deutschen Landwirtschaft.',
      'ROPS an allen Traktoren Pflicht. Sicherheitsgurt anlegen. Hanglagen ueber 30% vermeiden.',
      'BetrSichV: sichere Bereitstellung von Arbeitsmitteln. Maschinenrichtlinie 2006/42/EG.',
      'Sicherheitsgurt (Pflicht bei montiertem ROPS), Sicherheitsschuhe S3',
      'BetrSichV; Maschinenrichtlinie 2006/42/EG; VSG 3.1 SVLFG',
      'DE',
    ]
  );

  db.run(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Teleskoplader Standsicherheit',
      'teleskoplader',
      null,
      'Umkippen bei Ueberladung oder auf unebenem Gelaende. Quetschgefahr fuer umstehende Personen.',
      'Befaehigungsnachweis DGUV 308-009 Pflicht. Jaehrliche Pruefung. Tragfaehigkeit beachten.',
      'BetrSichV §14: wiederkehrende Pruefung. DGUV Vorschrift 68.',
      'Sicherheitsgurt, Sicherheitsschuhe S3, Schutzhelm',
      'BetrSichV §14; DGUV Vorschrift 68; DGUV Grundsatz 308-009',
      'DE',
    ]
  );

  // Livestock safety
  db.run(
    `INSERT INTO safety_guidance (topic, machine_type, species, hazards, control_measures, legal_requirements, ppe_required, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Rinderhaltung Fixierung und sicherer Umgang',
      null,
      'rinder',
      'Quetschen an Waenden oder Gattern. Tritte und Kopfstoesse. Treten und Niedertrampeln.',
      'Fangstand und Treibgang verwenden. Tiere ruhig ansprechen und treiben.',
      'ArbSchG §5: Gefaehrdungsbeurteilung. VSG 2.1 SVLFG: Tierhaltung.',
      'Sicherheitsstiefel mit Stahlkappe',
      'ArbSchG §5; VSG 2.1 SVLFG; DGUV Information 214-016',
      'DE',
    ]
  );

  // Children rules
  db.run(
    `INSERT INTO children_rules (age_group, activity, permitted, conditions, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['unter-13', 'Fahren oder Mitfahren auf einem Traktor', 0, 'Strikt verboten.', 'JArbSchG §5; VSG 3.1 SVLFG', 'DE']
  );
  db.run(
    `INSERT INTO children_rules (age_group, activity, permitted, conditions, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['13-14', 'Bedienung von Maschinen oder Fahrzeugen', 0, 'Verboten. Keine Bedienung von landwirtschaftlichen Maschinen.', 'JArbSchG §5; VSG 3.1 SVLFG', 'DE']
  );
  db.run(
    `INSERT INTO children_rules (age_group, activity, permitted, conditions, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['15-17', 'Traktorfahren auf dem Betriebsgelaende', 1, 'Auf dem Betriebsgelaende erlaubt mit ROPS-Traktor und Sicherheitsgurt nach Unterweisung.', 'JArbSchG; FeV §10', 'DE']
  );

  // COSHH / Gefahrstoffe
  db.run(
    `INSERT INTO coshh_guidance (substance_type, activity, assessment_required, ppe, storage_requirements, disposal_requirements, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Pflanzenschutzmittel',
      'Ansetzen, Spritzen und Reinigung',
      1,
      'Chemikalienschutzhandschuhe (EN 374), Schutzanzug, Atemschutz A2P3',
      'Abschliessbarer, beluefteter Lagerraum mit Auffangwanne.',
      'Leere Verpackungen dreimal spuelen und ueber PAMIRA entsorgen.',
      'GefStoffV §6, §14; PflSchG §9',
      'DE',
    ]
  );

  // Reporting
  db.run(
    `INSERT INTO reporting_requirements (incident_type, reportable, deadline, notify, method, record_retention_years, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Toedlicher Arbeitsunfall',
      1,
      'Sofortige Meldung',
      'SVLFG',
      'Sofortige telefonische Meldung an die SVLFG. Unfallanzeige innerhalb von 3 Tagen.',
      30,
      'SGB VII §193; DGUV Vorschrift 1 §6',
      'DE',
    ]
  );

  // Risk assessment
  db.run(
    `INSERT INTO risk_assessment_templates (activity, hazards, controls, residual_risk, review_frequency, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'Traktor fahren',
      'Ueberrollen auf Haengen; Erfassen durch Zapfwelle; Absturz vom Traktor',
      'ROPS montiert; Sicherheitsgurt angelegt; Zapfwellenschutz angebracht',
      'Gering bei Einhaltung aller Massnahmen.',
      'Jaehrlich',
      'DE',
    ]
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Traktor Ueberrollschutz ROPS Sicherheitsgurt', 'ROPS Pflicht auf allen Traktoren. Sicherheitsgurt. Ueberrollen auf Haengen. BetrSichV. VSG 3.1 SVLFG.', 'machinery', 'DE']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Rinder Fixierung Fangstand Treibgang', 'Fangstand und Treibgang fuer Rinder. Quetschen Tritte. ArbSchG §5. VSG 2.1 SVLFG.', 'livestock', 'DE']
  );
  db.run(
    `INSERT INTO search_index (title, body, topic, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Pflanzenschutzmittel Gefahrstoffe GefStoffV Betriebsanweisung', 'Sachkundenachweis Pflicht. Schutzhandschuhe EN 374. Lagerraum Auffangwanne. GefStoffV §14. PflSchG.', 'chemical', 'DE']
  );

  // Metadata
  const today = new Date().toISOString().split('T')[0];
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [today]);
  db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [today]);

  return db;
}
