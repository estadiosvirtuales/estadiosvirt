// ========================================================
// 👤 ESTADIOSVIRTUALES.COM - MÓDULO: PERFIL, CARTAS FUT Y LOGROS
// ========================================================

const URL_BASE = 'https://estadiosvirtuales.github.io/estadiosvirt/escudos/';

const ESCUDOS_MAP = {
  'ev': URL_BASE + 'Logo.webp',
  
  // 🌍 PAÍSES / SELECCIONES (URLs externas en PNG)
  'ar': 'https://flagcdn.com/w80/ar.png', 'br': 'https://flagcdn.com/w80/br.png',
  'es': 'https://flagcdn.com/w80/es.png', 'it': 'https://flagcdn.com/w80/it.png',
  'fr': 'https://flagcdn.com/w80/fr.png', 'de': 'https://flagcdn.com/w80/de.png',
  'gb-eng': 'https://flagcdn.com/w80/gb-eng.png', 'pt': 'https://flagcdn.com/w80/pt.png',
  'uy': 'https://flagcdn.com/w80/uy.png', 'co': 'https://flagcdn.com/w80/co.png',
  'mx': 'https://flagcdn.com/w80/mx.png', 'cl': 'https://flagcdn.com/w80/cl.png',
  'nl': 'https://flagcdn.com/w80/nl.png', 'be': 'https://flagcdn.com/w80/be.png',
  'hr': 'https://flagcdn.com/w80/hr.png', 'us': 'https://flagcdn.com/w80/us.png',
  'jp': 'https://flagcdn.com/w80/jp.png', 'can': 'https://flagcdn.com/w80/ca.png',
  'mar': 'https://flagcdn.com/w80/ma.png', 'sen': 'https://flagcdn.com/w80/sn.png',
  'kor': 'https://flagcdn.com/w80/kr.png', 'aus': 'https://flagcdn.com/w80/au.png',
  'sui': 'https://flagcdn.com/w80/ch.png', 'ecu': 'https://flagcdn.com/w80/ec.png',
  'per': 'https://flagcdn.com/w80/pe.png', 'den': 'https://flagcdn.com/w80/dk.png',
  'srb': 'https://flagcdn.com/w80/rs.png', 'pol': 'https://flagcdn.com/w80/pl.png',
  'wal': 'https://flagcdn.com/w80/gb-wls.png', 'swe': 'https://flagcdn.com/w80/se.png',
  'civ': 'https://flagcdn.com/w80/ci.png', 'cmr': 'https://flagcdn.com/w80/cm.png',
  'gha': 'https://flagcdn.com/w80/gh.png', 'nga': 'https://flagcdn.com/w80/ng.png',
  'ksa': 'https://flagcdn.com/w80/sa.png', 'irn': 'https://flagcdn.com/w80/ir.png',
  'egy': 'https://flagcdn.com/w80/eg.png', 'alg': 'https://flagcdn.com/w80/dz.png',
  'tun': 'https://flagcdn.com/w80/tn.png', 'mli': 'https://flagcdn.com/w80/ml.png',
  'qat': 'https://flagcdn.com/w80/qa.png', 'par': 'https://flagcdn.com/w80/py.png',
  'ven': 'https://flagcdn.com/w80/ve.png', 'bol': 'https://flagcdn.com/w80/bo.png',
  'crc': 'https://flagcdn.com/w80/cr.png', 'pan': 'https://flagcdn.com/w80/pa.png',
  'jam': 'https://flagcdn.com/w80/jm.png', 'nzl': 'https://flagcdn.com/w80/nz.png',
  'sco': 'https://flagcdn.com/w80/gb-sct.png', 'nor': 'https://flagcdn.com/w80/no.png',
  'aut': 'https://flagcdn.com/w80/at.png', 'gre': 'https://flagcdn.com/w80/gr.png',
  'tur': 'https://flagcdn.com/w80/tr.png', 'ukr': 'https://flagcdn.com/w80/ua.png',
  'cze': 'https://flagcdn.com/w80/cz.png', 'rsa': 'https://flagcdn.com/w80/za.png',
  'hon': 'https://flagcdn.com/w80/hn.png', 'irl': 'https://flagcdn.com/w80/ie.png',

  // 🇦🇷 ARGENTINA
  'arg_acassuso': URL_BASE + 'acasuso.webp',
  'arg_agropecuario': URL_BASE + 'agropecuario.webp',
  'arg_aldosivi': URL_BASE + 'Aldosivi.svg.webp',
  'arg_allboys': URL_BASE + 'Allboys.webp',
  'arg_almagro': URL_BASE + 'Almagro.webp',
  'arg_almirantebrown': URL_BASE + 'Almirante.webp',
  'arg_argentinos': URL_BASE + 'argentinos.svg.webp',
  'arg_atlanta': URL_BASE + 'Atlanta.webp',
  'arg_atleticotucuman': URL_BASE + 'atucuman.webp',
  'arg_atleticode rafaela': URL_BASE + 'atleticorafaela.webp',
  'arg_banfield': URL_BASE + 'Banfield.webp',
  'arg_barracas': URL_BASE + 'Barracas.svg.webp',
  'arg_belgrano': URL_BASE + 'Belgrano.webp',
  'arg_boca': URL_BASE + 'Boca.webp',
  'arg_centralcordoba': URL_BASE + 'Central Cordoba.webp',
  'arg_centralnorte': URL_BASE + 'Centralnorte.webp',
  'arg_chacarita': URL_BASE + 'Chacarita.webp',
  'arg_chacoforever': URL_BASE + 'cfe.webp',
  'arg_ciudadbolivar': URL_BASE + 'Bolivar.webp',
  'arg_colegiales': URL_BASE + 'Colegiales.webp',
  'arg_colon': URL_BASE + 'Colon.webp',
  'arg_defensa': URL_BASE + 'defensa.webp',
  'arg_defensores': URL_BASE + 'defensores.webp',
  'arg_depmadryn': URL_BASE + 'madryn.webp',
  'arg_maipu': URL_BASE + 'maipu.webp',
  'arg_moron': URL_BASE + 'Moron.webp',
  'arg_riestra': URL_BASE + 'Riestra.webp',
  'arg_estudiantesba': URL_BASE + 'Estudiantesba.webp',
  'arg_estudiantes': URL_BASE + 'Estudiantes.webp',
  'arg_estudiantesrc': URL_BASE + 'estudiantesrc.webp',
  'arg_ferro': URL_BASE + 'Ferro.webp',
  'arg_gimnasiajujuy': URL_BASE + 'Gimnasiaj.webp',
  'arg_gimnasiamza': URL_BASE + 'gimnasiam.webp',
  'arg_gimnasia': URL_BASE + 'Gimnasia.webp',
  'arg_gimnasiatirosalta': URL_BASE + 'gyt.webp',
  'arg_godoycruz': URL_BASE + 'godoycruz.webp',
  'arg_guemes': URL_BASE + 'guemessantiago.webp',
  'arg_huracan': URL_BASE + 'Huracan.webp',
  'arg_independiente': URL_BASE + 'Independiente.webp',
  'arg_indrivadavia': URL_BASE + 'irivadavia.webp',
  'arg_instituto': URL_BASE + 'Instituto.webp',
  'arg_lanus': URL_BASE + 'Lanus.webp',
  'arg_losandes': URL_BASE + 'Losandes.webp',
  'arg_midland': URL_BASE + 'midland.webp',
  'arg_mitre': URL_BASE + 'mitresantiago.webp',
  'arg_newells': URL_BASE + 'Newells.webp',
  'arg_nuevachicago': URL_BASE + 'Chicago.webp',
  'arg_patronato': URL_BASE + 'patronato.webp',
  'arg_platense': URL_BASE + 'Platense.webp',
  'arg_quilmes': URL_BASE + 'Quilmes.webp',
  'arg_racingcba': URL_BASE + 'racingc.webp',
  'arg_racing': URL_BASE + 'Racing.webp',
  'arg_river': URL_BASE + 'River.webp',
  'arg_rosario': URL_BASE + 'Rosario Central.webp',
  'arg_sanlorenzo': URL_BASE + 'San Lorenzo.webp',
  'arg_sanmartinsj': URL_BASE + 'smjuan.webp',
  'arg_sanmartintuc': URL_BASE + 'SMTucuman.webp',
  'arg_sanmiguel': URL_BASE + 'sanmiguel.webp',
  'arg_santelmo': URL_BASE + 'santelmo.webp',
  'arg_sarmiento': URL_BASE + 'Sarmiento.webp',
  'arg_talleres': URL_BASE + 'Talleres.webp',
  'arg_temperley': URL_BASE + 'Temperley.webp',
  'arg_tigre': URL_BASE + 'Tigre.webp',
  'arg_tristansuarez': URL_BASE + 'tristansuarez.webp',
  'arg_union': URL_BASE + 'Union.webp',
  'arg_velez': URL_BASE + 'Velez.webp',

  // 🇧🇷 BRASIL
  'bra_flamengo': URL_BASE + 'Flamengo.webp',
  'bra_palmeiras': URL_BASE + 'Palmeiras.webp',
  'bra_saopaulo': URL_BASE + 'SaoPaulo.webp',
  'bra_corinthians': URL_BASE + 'Corinthians.webp',
  'bra_santos': URL_BASE + 'Santos.webp',
  'bra_vasco': URL_BASE + 'VascoGama.webp',
  'bra_fluminense': URL_BASE + 'Fluminense.webp',
  'bra_botafogo': URL_BASE + 'Botafogo.webp',
  'bra_atleticomg': URL_BASE + 'AtleticoMineiro.webp',
  'bra_cruzeiro': URL_BASE + 'Cruzeiro.webp',
  'bra_gremio': URL_BASE + 'Gremio.webp',
  'bra_internacional': URL_BASE + 'Internacional.webp',
  'bra_athleticopr': URL_BASE + 'Paranaense.webp',
  'bra_bahia': URL_BASE + 'Bahia.webp',
  'bra_bragantino': URL_BASE + 'Bragantino.webp',
  'bra_coritiba': URL_BASE + 'Coritiba.webp',
  'bra_chapecoense': URL_BASE + 'Chapecoense.webp',
  'bra_mirassol': URL_BASE + 'Mirassol.webp',
  'bra_vitoria': URL_BASE + 'Vitoria.webp',
  'bra_remo': URL_BASE + 'Remo.webp',

  // 🇨🇴 COLOMBIA
  'col_aguilas': URL_BASE + 'aguilas_doradas.webp',
  'col_alianza': URL_BASE + 'alianza.webp',
  'col_america': URL_BASE + 'america.webp',
  'col_nacional': URL_BASE + 'atlnacional.webp',
  'col_chico': URL_BASE + 'boyacachico.webp',
  'col_bucaramanga': URL_BASE + 'bucaramanga.webp',
  'col_cucuta': URL_BASE + 'cucuta.webp',
  'col_cali': URL_BASE + 'depcali.webp',
  'col_medellin': URL_BASE + 'dim.webp',
  'col_fortaleza': URL_BASE + 'fortaleza.webp',
  'col_interpalmira': URL_BASE + 'internacional_bogota.webp',
  'col_jaguares': URL_BASE + 'jaguares.webp',
  'col_junior': URL_BASE + 'junior.webp',
  'col_llaneros': URL_BASE + 'llaneros.webp',
  'col_millonarios': URL_BASE + 'millonarios.webp',
  'col_oncecaldas': URL_BASE + 'oncecaldas.webp',
  'col_pasto': URL_BASE + 'pasto.webp',
  'col_pereira': URL_BASE + 'pereira.webp',
  'col_santafe': URL_BASE + 'santafe.webp',
  'col_tolima': URL_BASE + 'tolima.webp',

  // 🇪🇸 ESPAÑA
  'esp_realmadrid': URL_BASE + 'Real.webp',
  'esp_barcelona': URL_BASE + 'Barca.webp',
  'esp_atletico': URL_BASE + 'AMadrid.webp',
  'esp_athletic': URL_BASE + 'AtlClub.webp',
  'esp_betis': URL_BASE + 'Betis.webp',
  'esp_realsociedad': URL_BASE + 'Sociedad.webp',
  'esp_sevilla': URL_BASE + 'Sevilla.webp',
  'esp_villarreal': URL_BASE + 'Villarreal.webp',
  'esp_valencia': URL_BASE + 'Valencia.webp',
  'esp_osasuna': URL_BASE + 'Osasuna.webp',
  'esp_celta': URL_BASE + 'celta.webp',
  'esp_alaves': URL_BASE + 'Alaves.webp',
  'esp_getafe': URL_BASE + 'Getafe.webp',
  'esp_mallorca': URL_BASE + 'Mallorca.webp',
  'esp_laspalmas': URL_BASE + 'udlaspalmas.webp',
  'esp_rayo': URL_BASE + 'Rayo.webp',
  'esp_girona': URL_BASE + 'Girona.webp',
  'esp_leganes': URL_BASE + 'leganes.webp',
  'esp_valladolid': URL_BASE + 'valladolid.webp',
  'esp_espanyol': URL_BASE + 'Espanyol.webp',

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 INGLATERRA
  'eng_arsenal': URL_BASE + 'arsenal.webp',
  'eng_astonvilla': URL_BASE + 'astonvilla.webp',
  'eng_bournemouth': URL_BASE + 'bournemouth.webp',
  'eng_brentford': URL_BASE + 'brentford.webp',
  'eng_brighton': URL_BASE + 'brighton.webp',
  'eng_chelsea': URL_BASE + 'chelsea.webp',
  'eng_crystalpalace': URL_BASE + 'crystalpalace.webp',
  'eng_everton': URL_BASE + 'everton.webp',
  'eng_fulham': URL_BASE + 'fulham.webp',
  'eng_ipswich': URL_BASE + 'ipswich_town​.webp',
  'eng_leeds': URL_BASE + 'leeds.webp',
  'eng_liverpool': URL_BASE + 'liverpool.webp',
  'eng_mancity': URL_BASE + 'manchestercity.webp',
  'eng_manunited': URL_BASE + 'manchesterunited.webp',
  'eng_newcastle': URL_BASE + 'newcastle.webp',
  'eng_nottingham': URL_BASE + 'nottingham_forest.webp',
  'eng_sunderland': URL_BASE + 'sunderland.webp',
  'eng_tottenham': URL_BASE + 'tottenham.webp',
  'eng_coventry': URL_BASE + 'coventry.webp',
  'eng_hull': URL_BASE + 'hull_city.webp',

  // 🇮🇹 ITALIA
  'ita_juventus': URL_BASE + 'juventus.webp',
  'ita_inter': URL_BASE + 'inter.webp',
  'ita_milan': URL_BASE + 'milan.webp',
  'ita_roma': URL_BASE + 'roma.webp',
  'ita_lazio': URL_BASE + 'lazio.webp',
  'ita_napoli': URL_BASE + 'napoli.webp',
  'ita_fiorentina': URL_BASE + 'fiorentina.webp',
  'ita_atalanta': URL_BASE + 'atalanta.webp',
  'ita_bologna': URL_BASE + 'bologna.webp',
  'ita_torino': URL_BASE + 'torino.webp',
  'ita_udinese': URL_BASE + 'udinese.webp',
  'ita_genoa': URL_BASE + 'genoa.webp',
  'ita_verona': URL_BASE + 'hellasverona.webp',
  'ita_empoli': URL_BASE + 'empoli.webp',
  'ita_lecce': URL_BASE + 'lecce.webp',
  'ita_monza': URL_BASE + 'monza.webp',
  'ita_cagliari': URL_BASE + 'cagliari.webp',
  'ita_parma': URL_BASE + 'parma.webp',
  'ita_como': URL_BASE + 'como.webp',
  'ita_venezia': URL_BASE + 'venezia.webp',

  // 🇨🇱 CHILE
  'chi_colocolo': URL_BASE + 'ColoColo.webp',
  'chi_ucatolica': URL_BASE + 'ucatolica.webp',
  'chi_coquimbo': URL_BASE + 'Coquimbo.webp',
  'chi_everton': URL_BASE + 'Everton.webp',
  'chi_huachipato': URL_BASE + 'Huachipato.webp',
  'chi_limache': URL_BASE + 'DeportesLimache.webp',
  'chi_palestino': URL_BASE + 'Palestino.webp',
  'chi_nublense': URL_BASE + 'Nublense.webp',
  'chi_uchile': URL_BASE + 'udechile.webp',
  'chi_ohiggins': URL_BASE + 'OHiggins.webp',
  'chi_uconcepcion': URL_BASE + 'udeconcepcion.webp',
  'chi_laserena': URL_BASE + 'LaSerena.webp',
  'chi_audax': URL_BASE + 'AudaxItaliano.webp',
  'chi_cobresal': URL_BASE + 'Cobresal.webp',
  'chi_dconcepcion': URL_BASE + 'DeportesConcepcion.webp',
  'chi_calera': URL_BASE + 'unionlacalera.webp',

  // 🇫🇷 FRANCIA
  'fra_psg': URL_BASE + 'psg.webp',
  'fra_marseille': URL_BASE + 'olimpiquemarsella.webp',
  'fra_lyon': URL_BASE + 'olympiquelyon.webp',
  'fra_lille': URL_BASE + 'lille.webp',
  'fra_monaco': URL_BASE + 'monaco.webp',
  'fra_lens': URL_BASE + 'racinglens.webp',
  'fra_nice': URL_BASE + 'niza.webp',
  'fra_rennes': URL_BASE + 'rennais.webp',
  'fra_strasbourg': URL_BASE + 'racingetrasburgo.webp',
  'fra_toulouse': URL_BASE + 'toulouse.webp',
  'fra_lehavre': URL_BASE + 'havre.webp',
  'fra_angers': URL_BASE + 'angers.webp',
  'fra_auxerre': URL_BASE + 'auxerre.webp',
  'fra_brest': URL_BASE + 'stadebretois.webp',
  'fra_lorient': URL_BASE + 'lorient.webp',
  'fra_lemans': URL_BASE + 'lemans.webp',
  'fra_parisfc': URL_BASE + 'paris_fc.webp',
  'fra_troyes': URL_BASE + 'troyes.webp',

  // 🇩🇪 ALEMANIA
  'ger_bayern': URL_BASE + 'bayernmunchen.webp',
  'ger_dortmund': URL_BASE + 'borussiadortmund.webp',
  'ger_leverkusen': URL_BASE + 'bayerleverkusen.webp',
  'ger_leipzig': URL_BASE + 'rbleipzig.webp',
  'ger_stuttgart': URL_BASE + 'stuttgart.webp',
  'ger_frankfurt': URL_BASE + 'eintrachtfrankfurt.webp',
  'ger_freiburg': URL_BASE + 'freiburg.webp',
  'ger_hoffenheim': URL_BASE + 'hoffenheim.webp',
  'ger_bremen': URL_BASE + 'werderbremen.webp',
  'ger_monchengladbach': URL_BASE + 'bmonchengladbach.webp',
  'ger_mainz': URL_BASE + 'mainz05.webp',
  'ger_augsburg': URL_BASE + 'augsburgo.webp',
  'ger_unionberlin': URL_BASE + 'unionberlin.webp',
  'ger_koln': URL_BASE + 'koln.webp',
  'ger_hamburg': URL_BASE + 'hamburgo.webp',
  'ger_schalke': URL_BASE + 'schalke.webp',
  'ger_paderborn': URL_BASE + 'paderborn.webp',
  'ger_elversberg': URL_BASE + 'elversberg.webp',

  // 🇵🇹 PORTUGAL
  'por_benfica': URL_BASE + 'benfica.webp',
  'por_porto': URL_BASE + 'porto.webp',
  'por_sporting': URL_BASE + 'sporting.webp',
  'por_braga': URL_BASE + 'braga.webp',
  'por_vitoria': URL_BASE + 'vitoria.webp',
  'por_rioave': URL_BASE + 'rioave.webp',
  'por_famalicao': URL_BASE + 'famalicao.webp',
  'por_arouca': URL_BASE + 'arouca.webp',
  'por_gilvicente': URL_BASE + 'gilvicente.webp',
  'por_estoril': URL_BASE + 'estoril.webp',
  'por_casapia': URL_BASE + 'casa_pia.webp',
  'por_nacional': URL_BASE + 'nacional.webp',
  'por_moreirense': URL_BASE + 'moreirense.webp',
  'por_estrela': URL_BASE + 'estrella.webp',
  'por_santaclara': URL_BASE + 'santaclara.webp',
  'por_avs': URL_BASE + 'avs.webp',
  'por_alverca': URL_BASE + 'alverca.webp',
  'por_tondela': URL_BASE + 'tondela.webp',

  // 🇳🇱 PAÍSES BAJOS
  'ned_ajax': URL_BASE + 'ajax.webp',
  'ned_psv': URL_BASE + 'psv.webp',
  'ned_feyenoord': URL_BASE + 'feyenoord.webp',
  'ned_az': URL_BASE + 'az.webp',
  'ned_twente': URL_BASE + 'twente.webp',
  'ned_utrecht': URL_BASE + 'utrecht.webp',
  'ned_heerenveen': URL_BASE + 'scheerenveen.webp',
  'ned_groningen': URL_BASE + 'gronningen.webp',
  'ned_goaheadeagles': URL_BASE + 'go_ahead_eagles.webp',
  'ned_nec': URL_BASE + 'nec.webp',
  'ned_willem': URL_BASE + 'willem.webp',
  'ned_ado': URL_BASE + 'ado.webp',
  'ned_sparta': URL_BASE + 'sparta.webp',
  'ned_excelsior': URL_BASE + 'excelsior.webp',
  'ned_fortuna': URL_BASE + 'fortunasittard.webp',
  'ned_cambuur': URL_BASE + 'cambuur.webp',
  'ned_telstar': URL_BASE + 'telstar.webp'
};

const BANDERAS_LISTA = [
  { id: 'ev', label: 'Estadios Virt.', cat: 'paises' },
  { id: 'ar', label: 'Argentina', cat: 'paises' }, { id: 'br', label: 'Brasil', cat: 'paises' },
  { id: 'es', label: 'España', cat: 'paises' }, { id: 'it', label: 'Italia', cat: 'paises' },
  { id: 'fr', label: 'Francia', cat: 'paises' }, { id: 'de', label: 'Alemania', cat: 'paises' },
  { id: 'gb-eng', label: 'Inglaterra', cat: 'paises' }, { id: 'pt', label: 'Portugal', cat: 'paises' },
  { id: 'uy', label: 'Uruguay', cat: 'paises' }, { id: 'co', label: 'Colombia', cat: 'paises' },
  { id: 'mx', label: 'México', cat: 'paises' }, { id: 'cl', label: 'Chile', cat: 'paises' },
  { id: 'nl', label: 'Países Bajos', cat: 'paises' }, { id: 'be', label: 'Bélgica', cat: 'paises' },
  { id: 'hr', label: 'Croacia', cat: 'paises' }, { id: 'us', label: 'EE.UU.', cat: 'paises' },
  { id: 'jp', label: 'Japón', cat: 'paises' }, { id: 'can', label: 'Canadá', cat: 'paises' },
  { id: 'mar', label: 'Marruecos', cat: 'paises' }, { id: 'sen', label: 'Senegal', cat: 'paises' },
  { id: 'kor', label: 'Corea del Sur', cat: 'paises' }, { id: 'aus', label: 'Australia', cat: 'paises' },
  { id: 'sui', label: 'Suiza', cat: 'paises' }, { id: 'ecu', label: 'Ecuador', cat: 'paises' },
  { id: 'per', label: 'Perú', cat: 'paises' }, { id: 'den', label: 'Dinamarca', cat: 'paises' },
  { id: 'srb', label: 'Serbia', cat: 'paises' }, { id: 'pol', label: 'Polonia', cat: 'paises' },
  { id: 'wal', label: 'Gales', cat: 'paises' }, { id: 'swe', label: 'Suecia', cat: 'paises' },
  { id: 'civ', label: 'Costa de Marfil', cat: 'paises' }, { id: 'cmr', label: 'Camerún', cat: 'paises' },
  { id: 'gha', label: 'Ghana', cat: 'paises' }, { id: 'nga', label: 'Nigeria', cat: 'paises' },
  { id: 'ksa', label: 'Arabia Saudita', cat: 'paises' }, { id: 'irn', label: 'Irán', cat: 'paises' },
  { id: 'egy', label: 'Egipto', cat: 'paises' }, { id: 'alg', label: 'Argelia', cat: 'paises' },
  { id: 'tun', label: 'Túnez', cat: 'paises' }, { id: 'mli', label: 'Malí', cat: 'paises' },
  { id: 'qat', label: 'Qatar', cat: 'paises' }, { id: 'par', label: 'Paraguay', cat: 'paises' },
  { id: 'ven', label: 'Venezuela', cat: 'paises' }, { id: 'bol', label: 'Bolivia', cat: 'paises' },
  { id: 'crc', label: 'Costa Rica', cat: 'paises' }, { id: 'pan', label: 'Panamá', cat: 'paises' },
  { id: 'jam', label: 'Jamaica', cat: 'paises' }, { id: 'nzl', label: 'Nueva Zelanda', cat: 'paises' },
  { id: 'sco', label: 'Escocia', cat: 'paises' }, { id: 'nor', label: 'Noruega', cat: 'paises' },
  { id: 'aut', label: 'Austria', cat: 'paises' }, { id: 'gre', label: 'Grecia', cat: 'paises' },
  { id: 'tur', label: 'Turquía', cat: 'paises' }, { id: 'ukr', label: 'Ucrania', cat: 'paises' },
  { id: 'cze', label: 'Rep. Checa', cat: 'paises' }, { id: 'rsa', label: 'Sudáfrica', cat: 'paises' },
  { id: 'hon', label: 'Honduras', cat: 'paises' }, { id: 'irl', label: 'Irlanda', cat: 'paises' },

  // Clubes Argentina
  { id: 'arg_acassuso', label: 'Acassuso', cat: 'arg' },
  { id: 'arg_agropecuario', label: 'Agropecuario', cat: 'arg' },
  { id: 'arg_aldosivi', label: 'Aldosivi', cat: 'arg' },
  { id: 'arg_allboys', label: 'All Boys', cat: 'arg' },
  { id: 'arg_almagro', label: 'Almagro', cat: 'arg' },
  { id: 'arg_almirantebrown', label: 'Almirante Brown', cat: 'arg' },
  { id: 'arg_argentinos', label: 'Argentinos Juniors', cat: 'arg' },
  { id: 'arg_atlanta', label: 'Atlanta', cat: 'arg' },
  { id: 'arg_atleticotucuman', label: 'Atlético Tucumán', cat: 'arg' },
  { id: 'arg_atleticode rafaela', label: 'Atlético de Rafaela', cat: 'arg' },
  { id: 'arg_banfield', label: 'Banfield', cat: 'arg' },
  { id: 'arg_barracas', label: 'Barracas Central', cat: 'arg' },
  { id: 'arg_belgrano', label: 'Belgrano de Córdoba', cat: 'arg' },
  { id: 'arg_boca', label: 'Boca Juniors', cat: 'arg' },
  { id: 'arg_centralcordoba', label: 'Central Córdoba (SdE)', cat: 'arg' },
  { id: 'arg_centralnorte', label: 'Central Norte', cat: 'arg' },
  { id: 'arg_chacarita', label: 'Chacarita Juniors', cat: 'arg' },
  { id: 'arg_chacoforever', label: 'Chaco For Ever', cat: 'arg' },
  { id: 'arg_ciudadbolivar', label: 'Ciudad de Bolívar', cat: 'arg' },
  { id: 'arg_colegiales', label: 'Colegiales', cat: 'arg' },
  { id: 'arg_colon', label: 'Colón', cat: 'arg' },
  { id: 'arg_defensa', label: 'Defensa y Justicia', cat: 'arg' },
  { id: 'arg_defensores', label: 'Defensores de Belgrano', cat: 'arg' },
  { id: 'arg_depmadryn', label: 'Deportivo Madryn', cat: 'arg' },
  { id: 'arg_maipu', label: 'Deportivo Maipú', cat: 'arg' },
  { id: 'arg_moron', label: 'Deportivo Morón', cat: 'arg' },
  { id: 'arg_riestra', label: 'Deportivo Riestra', cat: 'arg' },
  { id: 'arg_estudiantesba', label: 'Estudiantes (BA)', cat: 'arg' },
  { id: 'arg_estudiantes', label: 'Estudiantes de La Plata', cat: 'arg' },
  { id: 'arg_estudiantesrc', label: 'Estudiantes de Río Cuarto', cat: 'arg' },
  { id: 'arg_ferro', label: 'Ferro Carril Oeste', cat: 'arg' },
  { id: 'arg_gimnasiajujuy', label: 'Gimnasia (J)', cat: 'arg' },
  { id: 'arg_gimnasiamza', label: 'Gimnasia de Mendoza', cat: 'arg' },
  { id: 'arg_gimnasia', label: 'Gimnasia y Esgrima LP', cat: 'arg' },
  { id: 'arg_gimnasiatirosalta', label: 'Gimnasia y Tiro (Salta)', cat: 'arg' },
  { id: 'arg_godoycruz', label: 'Godoy Cruz', cat: 'arg' },
  { id: 'arg_guemes', label: 'Güemes (SdE)', cat: 'arg' },
  { id: 'arg_huracan', label: 'Huracán', cat: 'arg' },
  { id: 'arg_independiente', label: 'Independiente', cat: 'arg' },
  { id: 'arg_indrivadavia', label: 'Independiente Rivadavia', cat: 'arg' },
  { id: 'arg_instituto', label: 'Instituto', cat: 'arg' },
  { id: 'arg_lanus', label: 'Lanús', cat: 'arg' },
  { id: 'arg_losandes', label: 'Los Andes', cat: 'arg' },
  { id: 'arg_midland', label: 'Midland', cat: 'arg' },
  { id: 'arg_mitre', label: 'Mitre (SdE)', cat: 'arg' },
  { id: 'arg_newells', label: "Newell's Old Boys", cat: 'arg' },
  { id: 'arg_nuevachicago', label: 'Nueva Chicago', cat: 'arg' },
  { id: 'arg_patronato', label: 'Patronato', cat: 'arg' },
  { id: 'arg_platense', label: 'Platense', cat: 'arg' },
  { id: 'arg_quilmes', label: 'Quilmes', cat: 'arg' },
  { id: 'arg_racingcba', label: 'Racing (CBA)', cat: 'arg' },
  { id: 'arg_racing', label: 'Racing Club', cat: 'arg' },
  { id: 'arg_river', label: 'River Plate', cat: 'arg' },
  { id: 'arg_rosario', label: 'Rosario Central', cat: 'arg' },
  { id: 'arg_sanlorenzo', label: 'San Lorenzo', cat: 'arg' },
  { id: 'arg_sanmartinsj', label: 'San Martín (SJ)', cat: 'arg' },
  { id: 'arg_sanmartintuc', label: 'San Martín (T)', cat: 'arg' },
  { id: 'arg_sanmiguel', label: 'San Miguel', cat: 'arg' },
  { id: 'arg_santelmo', label: 'San Telmo', cat: 'arg' },
  { id: 'arg_sarmiento', label: 'Sarmiento de Junín', cat: 'arg' },
  { id: 'arg_talleres', label: 'Talleres de Córdoba', cat: 'arg' },
  { id: 'arg_temperley', label: 'Temperley', cat: 'arg' },
  { id: 'arg_tigre', label: 'Tigre', cat: 'arg' },
  { id: 'arg_tristansuarez', label: 'Tristán Suárez', cat: 'arg' },
  { id: 'arg_union', label: 'Unión de Santa Fe', cat: 'arg' },
  { id: 'arg_velez', label: 'Vélez Sarsfield', cat: 'arg' },

  // Clubes Brasil
  { id: 'bra_flamengo', label: 'Flamengo', cat: 'bra' },
  { id: 'bra_palmeiras', label: 'Palmeiras', cat: 'bra' },
  { id: 'bra_saopaulo', label: 'São Paulo', cat: 'bra' },
  { id: 'bra_corinthians', label: 'Corinthians', cat: 'bra' },
  { id: 'bra_santos', label: 'Santos', cat: 'bra' },
  { id: 'bra_vasco', label: 'Vasco da Gama', cat: 'bra' },
  { id: 'bra_fluminense', label: 'Fluminense', cat: 'bra' },
  { id: 'bra_botafogo', label: 'Botafogo', cat: 'bra' },
  { id: 'bra_atleticomg', label: 'Atlético Mineiro', cat: 'bra' },
  { id: 'bra_cruzeiro', label: 'Cruzeiro', cat: 'bra' },
  { id: 'bra_gremio', label: 'Grêmio', cat: 'bra' },
  { id: 'bra_internacional', label: 'Internacional', cat: 'bra' },
  { id: 'bra_athleticopr', label: 'Athletico Paranaense', cat: 'bra' },
  { id: 'bra_bahia', label: 'Bahía', cat: 'bra' },
  { id: 'bra_bragantino', label: 'Bragantino', cat: 'bra' },
  { id: 'bra_coritiba', label: 'Coritiba', cat: 'bra' },
  { id: 'bra_chapecoense', label: 'Chapecoense', cat: 'bra' },
  { id: 'bra_mirassol', label: 'Mirassol', cat: 'bra' },
  { id: 'bra_vitoria', label: 'Vitória', cat: 'bra' },
  { id: 'bra_remo', label: 'Remo', cat: 'bra' },

  // Clubes Colombia
  { id: 'col_aguilas', label: 'Águilas Doradas', cat: 'col' },
  { id: 'col_alianza', label: 'Alianza FC', cat: 'col' },
  { id: 'col_america', label: 'América de Cali', cat: 'col' },
  { id: 'col_nacional', label: 'Atlético Nacional', cat: 'col' },
  { id: 'col_chico', label: 'Boyacá Chicó', cat: 'col' },
  { id: 'col_bucaramanga', label: 'Atlético Bucaramanga', cat: 'col' },
  { id: 'col_cucuta', label: 'Cúcuta Deportivo', cat: 'col' },
  { id: 'col_cali', label: 'Deportivo Cali', cat: 'col' },
  { id: 'col_medellin', label: 'Independiente Medellín', cat: 'col' },
  { id: 'col_fortaleza', label: 'Fortaleza CEIF', cat: 'col' },
  { id: 'col_interpalmira', label: 'Internacional de Bogotá', cat: 'col' },
  { id: 'col_jaguares', label: 'Jaguares de Córdoba', cat: 'col' },
  { id: 'col_junior', label: 'Junior de Barranquilla', cat: 'col' },
  { id: 'col_llaneros', label: 'Llaneros FC', cat: 'col' },
  { id: 'col_millonarios', label: 'Millonarios', cat: 'col' },
  { id: 'col_oncecaldas', label: 'Once Caldas', cat: 'col' },
  { id: 'col_pasto', label: 'Deportivo Pasto', cat: 'col' },
  { id: 'col_pereira', label: 'Deportivo Pereira', cat: 'col' },
  { id: 'col_santafe', label: 'Santa Fe', cat: 'col' },
  { id: 'col_tolima', label: 'Deportes Tolima', cat: 'col' },

  // Clubes España
  { id: 'esp_realmadrid', label: 'Real Madrid', cat: 'esp' },
  { id: 'esp_barcelona', label: 'FC Barcelona', cat: 'esp' },
  { id: 'esp_atletico', label: 'Atlético de Madrid', cat: 'esp' },
  { id: 'esp_athletic', label: 'Athletic Club', cat: 'esp' },
  { id: 'esp_betis', label: 'Real Betis', cat: 'esp' },
  { id: 'esp_realsociedad', label: 'Real Sociedad', cat: 'esp' },
  { id: 'esp_sevilla', label: 'Sevilla FC', cat: 'esp' },
  { id: 'esp_villarreal', label: 'Villarreal CF', cat: 'esp' },
  { id: 'esp_valencia', label: 'Valencia CF', cat: 'esp' },
  { id: 'esp_osasuna', label: 'CA Osasuna', cat: 'esp' },
  { id: 'esp_celta', label: 'RC Celta de Vigo', cat: 'esp' },
  { id: 'esp_alaves', label: 'Deportivo Alavés', cat: 'esp' },
  { id: 'esp_getafe', label: 'Getafe CF', cat: 'esp' },
  { id: 'esp_mallorca', label: 'RCD Mallorca', cat: 'esp' },
  { id: 'esp_laspalmas', label: 'UD Las Palmas', cat: 'esp' },
  { id: 'esp_rayo', label: 'Rayo Vallecano', cat: 'esp' },
  { id: 'esp_girona', label: 'Girona FC', cat: 'esp' },
  { id: 'esp_leganes', label: 'CD Leganés', cat: 'esp' },
  { id: 'esp_valladolid', label: 'Real Valladolid', cat: 'esp' },
  { id: 'esp_espanyol', label: 'RCD Espanyol', cat: 'esp' },

  // Clubes Inglaterra
  { id: 'eng_arsenal', label: 'Arsenal', cat: 'eng' },
  { id: 'eng_astonvilla', label: 'Aston Villa', cat: 'eng' },
  { id: 'eng_bournemouth', label: 'Bournemouth', cat: 'eng' },
  { id: 'eng_brentford', label: 'Brentford', cat: 'eng' },
  { id: 'eng_brighton', label: 'Brighton & Hove Albion', cat: 'eng' },
  { id: 'eng_chelsea', label: 'Chelsea', cat: 'eng' },
  { id: 'eng_crystalpalace', label: 'Crystal Palace', cat: 'eng' },
  { id: 'eng_everton', label: 'Everton', cat: 'eng' },
  { id: 'eng_fulham', label: 'Fulham', cat: 'eng' },
  { id: 'eng_ipswich', label: 'Ipswich Town', cat: 'eng' },
  { id: 'eng_leeds', label: 'Leeds United', cat: 'eng' },
  { id: 'eng_liverpool', label: 'Liverpool', cat: 'eng' },
  { id: 'eng_mancity', label: 'Manchester City', cat: 'eng' },
  { id: 'eng_manunited', label: 'Manchester United', cat: 'eng' },
  { id: 'eng_newcastle', label: 'Newcastle United', cat: 'eng' },
  { id: 'eng_nottingham', label: 'Nottingham Forest', cat: 'eng' },
  { id: 'eng_sunderland', label: 'Sunderland', cat: 'eng' },
  { id: 'eng_tottenham', label: 'Tottenham Hotspur', cat: 'eng' },
  { id: 'eng_coventry', label: 'Coventry City', cat: 'eng' },
  { id: 'eng_hull', label: 'Hull City', cat: 'eng' },

  // Clubes Italia
  { id: 'ita_juventus', label: 'Juventus', cat: 'ita' },
  { id: 'ita_inter', label: 'Inter de Milán', cat: 'ita' },
  { id: 'ita_milan', label: 'AC Milan', cat: 'ita' },
  { id: 'ita_roma', label: 'AS Roma', cat: 'ita' },
  { id: 'ita_lazio', label: 'SS Lazio', cat: 'ita' },
  { id: 'ita_napoli', label: 'Napoli', cat: 'ita' },
  { id: 'ita_fiorentina', label: 'Fiorentina', cat: 'ita' },
  { id: 'ita_atalanta', label: 'Atalanta', cat: 'ita' },
  { id: 'ita_bologna', label: 'Bologna', cat: 'ita' },
  { id: 'ita_torino', label: 'Torino', cat: 'ita' },
  { id: 'ita_udinese', label: 'Udinese', cat: 'ita' },
  { id: 'ita_genoa', label: 'Genoa', cat: 'ita' },
  { id: 'ita_verona', label: 'Hellas Verona', cat: 'ita' },
  { id: 'ita_empoli', label: 'Empoli', cat: 'ita' },
  { id: 'ita_lecce', label: 'Lecce', cat: 'ita' },
  { id: 'ita_monza', label: 'Monza', cat: 'ita' },
  { id: 'ita_cagliari', label: 'Cagliari', cat: 'ita' },
  { id: 'ita_parma', label: 'Parma', cat: 'ita' },
  { id: 'ita_como', label: 'Como 1907', cat: 'ita' },
  { id: 'ita_venezia', label: 'Venezia FC', cat: 'ita' },

  // Clubes Chile
  { id: 'chi_colocolo', label: 'Colo Colo', cat: 'chi' },
  { id: 'chi_ucatolica', label: 'Universidad Católica', cat: 'chi' },
  { id: 'chi_coquimbo', label: 'Coquimbo Unido', cat: 'chi' },
  { id: 'chi_everton', label: 'Everton CD', cat: 'chi' },
  { id: 'chi_huachipato', label: 'Huachipato', cat: 'chi' },
  { id: 'chi_limache', label: 'Deportes Limache', cat: 'chi' },
  { id: 'chi_palestino', label: 'Palestino', cat: 'chi' },
  { id: 'chi_nublense', label: 'Ñublense', cat: 'chi' },
  { id: 'chi_uchile', label: 'Universidad de Chile', cat: 'chi' },
  { id: 'chi_ohiggins', label: "O'Higgins", cat: 'chi' },
  { id: 'chi_uconcepcion', label: 'Universidad de Concepción', cat: 'chi' },
  { id: 'chi_laserena', label: 'La Serena', cat: 'chi' },
  { id: 'chi_audax', label: 'Audax Italiano', cat: 'chi' },
  { id: 'chi_cobresal', label: 'Cobresal', cat: 'chi' },
  { id: 'chi_dconcepcion', label: 'Deportes Concepción', cat: 'chi' },
  { id: 'chi_calera', label: 'Unión La Calera', cat: 'chi' },

  // Clubes Francia
  { id: 'fra_psg', label: 'Paris Saint-Germain', cat: 'fra' },
  { id: 'fra_marseille', label: 'Marseille', cat: 'fra' },
  { id: 'fra_lyon', label: 'Lyon', cat: 'fra' },
  { id: 'fra_lille', label: 'Lille', cat: 'fra' },
  { id: 'fra_monaco', label: 'Monaco', cat: 'fra' },
  { id: 'fra_lens', label: 'Lens', cat: 'fra' },
  { id: 'fra_nice', label: 'Nice', cat: 'fra' },
  { id: 'fra_rennes', label: 'Rennes', cat: 'fra' },
  { id: 'fra_strasbourg', label: 'Strasbourg', cat: 'fra' },
  { id: 'fra_toulouse', label: 'Toulouse', cat: 'fra' },
  { id: 'fra_lehavre', label: 'Le Havre', cat: 'fra' },
  { id: 'fra_angers', label: 'Angers', cat: 'fra' },
  { id: 'fra_auxerre', label: 'Auxerre', cat: 'fra' },
  { id: 'fra_brest', label: 'Brest', cat: 'fra' },
  { id: 'fra_lorient', label: 'Lorient', cat: 'fra' },
  { id: 'fra_lemans', label: 'Le Mans', cat: 'fra' },
  { id: 'fra_parisfc', label: 'Paris FC', cat: 'fra' },
  { id: 'fra_troyes', label: 'Troyes', cat: 'fra' },

  // Clubes Alemania
  { id: 'ger_bayern', label: 'Bayern Munich', cat: 'ger' },
  { id: 'ger_dortmund', label: 'Borussia Dortmund', cat: 'ger' },
  { id: 'ger_leverkusen', label: 'Bayer Leverkusen', cat: 'ger' },
  { id: 'ger_leipzig', label: 'RB Leipzig', cat: 'ger' },
  { id: 'ger_stuttgart', label: 'VfB Stuttgart', cat: 'ger' },
  { id: 'ger_frankfurt', label: 'Eintracht Frankfurt', cat: 'ger' },
  { id: 'ger_freiburg', label: 'SC Freiburg', cat: 'ger' },
  { id: 'ger_hoffenheim', label: 'TSG Hoffenheim', cat: 'ger' },
  { id: 'ger_bremen', label: 'Werder Bremen', cat: 'ger' },
  { id: 'ger_monchengladbach', label: 'Borussia Mönchengladbach', cat: 'ger' },
  { id: 'ger_mainz', label: 'Mainz 05', cat: 'ger' },
  { id: 'ger_augsburg', label: 'FC Augsburg', cat: 'ger' },
  { id: 'ger_unionberlin', label: 'Union Berlin', cat: 'ger' },
  { id: 'ger_koln', label: '1. FC Köln', cat: 'ger' },
  { id: 'ger_hamburg', label: 'Hamburger SV', cat: 'ger' },
  { id: 'ger_schalke', label: 'Schalke 04', cat: 'ger' },
  { id: 'ger_paderborn', label: 'SC Paderborn', cat: 'ger' },
  { id: 'ger_elversberg', label: 'SV Elversberg', cat: 'ger' },

  // Clubes Portugal
  { id: 'por_benfica', label: 'Benfica', cat: 'por' },
  { id: 'por_porto', label: 'FC Porto', cat: 'por' },
  { id: 'por_sporting', label: 'Sporting CP', cat: 'por' },
  { id: 'por_braga', label: 'SC Braga', cat: 'por' },
  { id: 'por_vitoria', label: 'Vitória de Guimarães', cat: 'por' },
  { id: 'por_rioave', label: 'Rio Ave', cat: 'por' },
  { id: 'por_famalicao', label: 'FC Famalicão', cat: 'por' },
  { id: 'por_arouca', label: 'Arouca', cat: 'por' },
  { id: 'por_gilvicente', label: 'Gil Vicente', cat: 'por' },
  { id: 'por_estoril', label: 'Estoril', cat: 'por' },
  { id: 'por_casapia', label: 'Casa Pia', cat: 'por' },
  { id: 'por_nacional', label: 'C.D. Nacional', cat: 'por' },
  { id: 'por_moreirense', label: 'Moreirense', cat: 'por' },
  { id: 'por_estrela', label: 'Estrela', cat: 'por' },
  { id: 'por_santaclara', label: 'Santa Clara', cat: 'por' },
  { id: 'por_avs', label: 'AVS', cat: 'por' },
  { id: 'por_alverca', label: 'Alverca', cat: 'por' },
  { id: 'por_tondela', label: 'C.D. Tondela', cat: 'por' },

  // Clubes Países Bajos
  { id: 'ned_ajax', label: 'Ajax Amsterdam', cat: 'ned' },
  { id: 'ned_psv', label: 'PSV Eindhoven', cat: 'ned' },
  { id: 'ned_feyenoord', label: 'Feyenoord Rotterdam', cat: 'ned' },
  { id: 'ned_az', label: 'AZ Alkmaar', cat: 'ned' },
  { id: 'ned_twente', label: 'FC Twente', cat: 'ned' },
  { id: 'ned_utrecht', label: 'FC Utrecht', cat: 'ned' },
  { id: 'ned_heerenveen', label: 'Heerenveen', cat: 'ned' },
  { id: 'ned_groningen', label: 'FC Groningen', cat: 'ned' },
  { id: 'ned_goaheadeagles', label: 'Go Ahead Eagles', cat: 'ned' },
  { id: 'ned_nec', label: 'NEC Nijmegen', cat: 'ned' },
  { id: 'ned_willem', label: 'Willem II', cat: 'ned' },
  { id: 'ned_ado', label: 'ADO Den Haag', cat: 'ned' },
  { id: 'ned_sparta', label: 'Sparta Rotterdam', cat: 'ned' },
  { id: 'ned_excelsior', label: 'Excelsior', cat: 'ned' },
  { id: 'ned_fortuna', label: 'Fortuna Sittard', cat: 'ned' },
  { id: 'ned_cambuur', label: 'SC Cambuur', cat: 'ned' },
  { id: 'ned_telstar', label: 'Telstar', cat: 'ned' }
];

let categoriaEscudosActual = 'todos';
let cacheAvataresUsuarios = {};

function obtenerUrlEscudo(id) {
  const aWebp = (url) => (!url || url.includes('flagcdn.com')) ? url : url.replace(/\.png$/i, '.webp');
  if (!id || id === 'ev') return aWebp(ESCUDOS_MAP['ev']);
  if (ESCUDOS_MAP[id]) return aWebp(ESCUDOS_MAP[id]);
  
  const cached = localStorage.getItem('ev_escudo_url_' + id);
  if (cached) {
    const urlFinal = aWebp(cached);
    ESCUDOS_MAP[id] = urlFinal;
    return urlFinal;
  }

  if (typeof catalogoGlobal !== 'undefined' && catalogoGlobal && catalogoGlobal.length > 0) {
    const item = BANDERAS_LISTA.find(b => b.id === id);
    if (item && item.cat !== 'paises') {
      const limpiar = (txt) => (txt || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
      const nombreBuscado = limpiar(item.label);
      const encontrado = catalogoGlobal.find(f => limpiar(bscarPropiedad(f, 'Club')) === nombreBuscado);
      if (encontrado) {
        const foto = bscarPropiedad(encontrado, 'Foto');
        if (foto && foto.trim()) {
          const urlLimpia = aWebp(foto.trim());
          ESCUDOS_MAP[id] = urlLimpia;
          localStorage.setItem('ev_escudo_url_' + id, urlLimpia);
          return urlLimpia;
        }
      }
    }
  }

  const fallbackUrl = aWebp(ESCUDOS_MAP[id] || ESCUDOS_MAP['ev']);
  ESCUDOS_MAP[id] = fallbackUrl;
  return fallbackUrl;
}

window.desplazarTabsEscudos = function(desplazamiento) {
  const bar = document.getElementById('escudos-tabs-bar');
  if (bar) bar.scrollBy({ left: desplazamiento, behavior: 'smooth' });
};

window.abrirModalSelectorEscudo = function() {
  const m = document.getElementById('escudo-selector-modal');
  if (!m) return;
  m.style.display = 'flex';
  const input = document.getElementById('buscador-escudos');
  if (input) input.value = '';
  renderizarEscudosGrid(BANDERAS_LISTA);
};

window.cerrarModalSelectorEscudo = function() {
  const m = document.getElementById('escudo-selector-modal');
  if (m) m.style.display = 'none';
};

window.cambiarCategoriaEscudos = function(cat, btn) {
  categoriaEscudosActual = cat;
  document.querySelectorAll('.escudo-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const input = document.getElementById('buscador-escudos');
  const term = input ? input.value.toLowerCase().trim() : '';
  let filtrados = cat === 'todos' ? BANDERAS_LISTA : BANDERAS_LISTA.filter(e => e.cat === cat);
  if (term) filtrados = filtrados.filter(e => e.label.toLowerCase().includes(term));
  renderizarEscudosGrid(filtrados);
};

window.filtrarEscudosEnVivo = function(term) {
  const q = term.toLowerCase().trim();
  let lista = categoriaEscudosActual === 'todos' ? BANDERAS_LISTA : BANDERAS_LISTA.filter(e => e.cat === categoriaEscudosActual);
  if (q) lista = lista.filter(e => e.label.toLowerCase().includes(q));
  renderizarEscudosGrid(lista);
};

function renderizarEscudosGrid(lista) {
  const container = document.getElementById('escudos-grid-container');
  if (!container) return;
  const actual = document.getElementById('avatar-logo-input')?.value || 'ev';

  if (!lista.length) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px 10px; color:var(--text-muted); font-size:0.85rem;">No se encontraron escudos o banderas.</div>`;
    return;
  }

  container.innerHTML = lista.map(item => {
    const isSel = item.id === actual;
    const urlImg = obtenerUrlEscudo(item.id);
    const fond = item.id === 'ev' ? 'linear-gradient(135deg, #0f1419, #1a2233)' : (typeof obtenerFondoClub === 'function' ? obtenerFondoClub(item.label, item.label) : '#1a2233');

    return `
    <div class="escudo-card-item ${isSel ? 'selected' : ''}" style="background: ${fond};" onclick="seleccionarEscudoDirecto('${item.id}')">
      <img src="${urlImg}" alt="${item.label}" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
      <span>${item.label}</span>
    </div>`;
  }).join('');
}

window.seleccionarEscudoDirecto = function(id) {
  const input = document.getElementById('avatar-logo-input');
  const preview = document.getElementById('avatar-logo-preview');
  const futClub = document.getElementById('fut-club-display');
  const urlFinal = obtenerUrlEscudo(id);

  if (input) input.value = id;
  if (preview) preview.src = urlFinal;
  if (futClub) {
    futClub.src = urlFinal;
    futClub.setAttribute('referrerpolicy', 'no-referrer');
  }

  if (typeof setPref === 'function') setPref('ev_avatar_logo', id);
  if (urlFinal && urlFinal !== ESCUDOS_MAP['ev']) {
    localStorage.setItem('ev_escudo_url_' + id, urlFinal);
    ESCUDOS_MAP[id] = urlFinal;
  }

  actualizarAvatarLive();
  cerrarModalSelectorEscudo();
};

function obtenerNombreBandera(id) {
  const item = BANDERAS_LISTA.find(b => b.id === id);
  return item ? item.label : 'Estadios Virt.';
}

window.cambiarBanderaPaso = function(direccion) {
  abrirModalSelectorEscudo();
};

function generarAvatarHTML(avatarImg, forzarDesbloqueado = false) {
  let imgNombre = (avatarImg || '1.webp').replace(/\.png$/i, '.webp');
  if (!imgNombre.includes('.')) imgNombre += '.webp';
  
  const nivelReq = obtenerNivelAvatar(imgNombre);
  const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
  const estaBloqueado = !forzarDesbloqueado && (nivelUser < nivelReq);

  if (estaBloqueado) {
    return `
    <div class="ac-avatar-full is-locked">
      <img src="${imgNombre}" class="ac-avatar-img-full avatar-locked-blur" alt="Avatar">
      <div class="avatar-card-lock-badge">
        <i class="ph-fill ph-lock-key"></i>
        <span>NIVEL ${nivelReq}</span>
      </div>
    </div>`;
  }
  
  return `<div class="ac-avatar-full"><img src="${imgNombre}" class="ac-avatar-img-full" alt="Avatar"></div>`;
}

const TEMAS_LISTA = [
  { k: 'ger', l: 'GER', nombre: 'Alemania' }, { k: 'ksa', l: 'KSA', nombre: 'Arabia Saudita' },
  { k: 'alg', l: 'ALG', nombre: 'Argelia' }, { k: 'arg', l: 'ARG', nombre: 'Argentina' },
  { k: 'aus', l: 'AUS', nombre: 'Australia' }, { k: 'aut', l: 'AUT', nombre: 'Austria' },
  { k: 'bel', l: 'BEL', nombre: 'Bélgica' }, { k: 'bol', l: 'BOL', nombre: 'Bolivia' },
  { k: 'bra', l: 'BRA', nombre: 'Brasil' }, { k: 'cmr', l: 'CMR', nombre: 'Camerún' },
  { k: 'can', l: 'CAN', nombre: 'Canadá' }, { k: 'chi', l: 'CHI', nombre: 'Chile' },
  { k: 'col', l: 'COL', nombre: 'Colombia' }, { k: 'kor', l: 'KOR', nombre: 'Corea del Sur' },
  { k: 'civ', l: 'CIV', nombre: 'Costa de Marfil' }, { k: 'crc', l: 'CRC', nombre: 'Costa Rica' },
  { k: 'cro', l: 'CRO', nombre: 'Croacia' }, { k: 'den', l: 'DEN', nombre: 'Dinamarca' },
  { k: 'ecu', l: 'ECU', nombre: 'Ecuador' }, { k: 'egy', l: 'EGY', nombre: 'Egipto' },
  { k: 'sco', l: 'SCO', nombre: 'Escocia' }, { k: 'esp', l: 'ESP', nombre: 'España' },
  { k: 'usa', l: 'USA', nombre: 'Estados Unidos' }, { k: 'fra', l: 'FRA', nombre: 'Francia' },
  { k: 'wal', l: 'WAL', nombre: 'Gales' }, { k: 'gha', l: 'GHA', nombre: 'Ghana' },
  { k: 'gre', l: 'GRE', nombre: 'Grecia' }, { k: 'hon', l: 'HON', nombre: 'Honduras' },
  { k: 'eng', l: 'ENG', nombre: 'Inglaterra' }, { k: 'irn', l: 'IRN', nombre: 'Irán' },
  { k: 'irl', l: 'IRL', nombre: 'Irlanda' }, { k: 'ita', l: 'ITA', nombre: 'Italia' },
  { k: 'jam', l: 'JAM', nombre: 'Jamaica' }, { k: 'jpn', l: 'JPN', nombre: 'Japón' },
  { k: 'mli', l: 'MLI', nombre: 'Malí' }, { k: 'mar', l: 'MAR', nombre: 'Marruecos' },
  { k: 'mex', l: 'MEX', nombre: 'México' }, { k: 'nga', l: 'NGA', nombre: 'Nigeria' },
  { k: 'nor', l: 'NOR', nombre: 'Noruega' }, { k: 'nzl', l: 'NZL', nombre: 'Nueva Zelanda' },
  { k: 'ned', l: 'NED', nombre: 'Países Bajos' }, { k: 'pan', l: 'PAN', nombre: 'Panamá' },
  { k: 'par', l: 'PAR', nombre: 'Paraguay' }, { k: 'per', l: 'PER', nombre: 'Perú' },
  { k: 'pol', l: 'POL', nombre: 'Polonia' }, { k: 'por', l: 'POR', nombre: 'Portugal' },
  { k: 'qat', l: 'QAT', nombre: 'Qatar' }, { k: 'cze', l: 'CZE', nombre: 'República Checa' },
  { k: 'sen', l: 'SEN', nombre: 'Senegal' }, { k: 'srb', l: 'SRB', nombre: 'Serbia' },
  { k: 'rsa', l: 'RSA', nombre: 'Sudáfrica' }, { k: 'swe', l: 'SWE', nombre: 'Suecia' },
  { k: 'sui', l: 'SUI', nombre: 'Suiza' }, { k: 'tun', l: 'TUN', nombre: 'Túnez' },
  { k: 'tur', l: 'TUR', nombre: 'Turquía' }, { k: 'ukr', l: 'UKR', nombre: 'Ucrania' },
  { k: 'uru', l: 'URU', nombre: 'Uruguay' }, { k: 'ven', l: 'VEN', nombre: 'Venezuela' }
];

window.cambiarTemaPaso = function(direccion) {
  const input = document.getElementById('card-theme-input');
  const badge = document.getElementById('theme-current-badge');
  if (!input) return;
  let valActual = input.value || 'arg';
  let idx = TEMAS_LISTA.findIndex(t => t.k === valActual);
  if (idx === -1) idx = 0;
  idx = (idx + direccion + TEMAS_LISTA.length) % TEMAS_LISTA.length;
  const nuevo = TEMAS_LISTA[idx];
  input.value = nuevo.k;
  if (badge) {
    badge.className = `theme-dot td-${nuevo.k} active`;
    badge.dataset.tema = nuevo.k;
  }
  previsualizarTema(nuevo.k);
};

window.toggleCustomization = function() {
  const panel = document.getElementById('customization-panel-wrapper');
  const btn = document.getElementById('btn-toggle-custom');
  if (!panel) return;
  if (!panel.classList.contains('open')) {
    panel.classList.add('open');
    if (btn) btn.innerHTML = '<img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼';
  } else {
    panel.classList.remove('open');
    if (btn) btn.innerHTML = '<img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼';
  }
};

const AVATARES_LISTA = [
  { id: '7.webp', label: 'El Canario', nivel: 0 },
  { id: '9.webp', label: 'El Mosquito', nivel: 0 },
  { id: '12.webp', label: 'El Halcón', nivel: 0 },
  { id: '13.webp', label: 'El Timón', nivel: 0 },
  { id: '55.webp', label: 'Yerry', nivel: 0 },
  { id: '61.webp', label: 'El Pitbull', nivel: 0 },
  { id: '16.webp', label: 'El Mariscal', nivel: 1 },
  { id: '17.webp', label: 'El Heredero', nivel: 2 },
  { id: '18.webp', label: 'El Motorcito', nivel: 3 },
  { id: '19.webp', label: 'La Araña', nivel: 4 },
  { id: '20.webp', label: 'El Toro', nivel: 5 },
  { id: '21.webp', label: 'El Muro', nivel: 6 },
  { id: '22.webp', label: 'El Carnicero', nivel: 7 },
  { id: '23.webp', label: 'El Colorado', nivel: 8 },
  { id: '24.webp', label: 'El Guardián', nivel: 9 },
  { id: '51.webp', label: 'Yerry', nivel: 10 },
  { id: '8.webp', label: 'La Muralla', nivel: 11 },
  { id: '10.webp', label: 'Hurricane', nivel: 12 },
  { id: '11.webp', label: 'Golden Boy', nivel: 13 },
  { id: '14.webp', label: 'Gigio', nivel: 14 },
  { id: '15.webp', label: 'El Fideo', nivel: 15 },
  { id: '26.webp', label: 'El Kun', nivel: 16 },
  { id: '36.webp', label: 'El Matador', nivel: 17 },
  { id: '52.webp', label: 'El 10 Cafetero', nivel: 18 },
  { id: '53.webp', label: 'El Tigre', nivel: 19 },
  { id: '59.webp', label: 'Niño Maravilla', nivel: 20 },
  { id: '5.webp', label: 'El Androide', nivel: 21 },
  { id: '4.webp', label: 'Kiki', nivel: 22 },
  { id: '6.webp', label: 'Ousadia', nivel: 23 },
  { id: '37.webp', label: 'El Gladiador', nivel: 24 },
  { id: '35.webp', label: 'El Pistolero', nivel: 25 },
  { id: '60.webp', label: 'Capitán América', nivel: 26 },
  { id: '54.webp', label: 'El Candado', nivel: 27 },
  { id: '45.webp', label: 'El Estratega', nivel: 28 },
  { id: '48.webp', label: 'El Muñeco', nivel: 29 },
  { id: '46.webp', label: 'El Filósofo', nivel: 30 },
  { id: '38.webp', label: 'El Relojito', nivel: 31 },
  { id: '43.webp', label: 'El Francotirador', nivel: 32 },
  { id: '42.webp', label: 'Mago Balcánico', nivel: 33 },
  { id: '58.webp', label: 'El Rey Arturo', nivel: 34 },
  { id: '27.webp', label: 'El Apache', nivel: 35 },
  { id: '49.webp', label: 'Special One', nivel: 36 },
  { id: '47.webp', label: 'Carletto', nivel: 37 },
  { id: '41.webp', label: 'El León Sueco', nivel: 38 },
  { id: '3.webp', label: 'O Menino', nivel: 39 },
  { id: '2.webp', label: 'El Bicho', nivel: 40 },
  { id: '39.webp', label: 'El Arquitecto', nivel: 41 },
  { id: '40.webp', label: 'El Ilusionista', nivel: 42 },
  { id: '44.webp', label: 'El Maestro', nivel: 43 },
  { id: '29.webp', label: 'La Brujita', nivel: 44 },
  { id: '28.webp', label: 'El Torero', nivel: 45 },
  { id: '34.webp', label: 'Il Pendolino', nivel: 46 },
  { id: '33.webp', label: 'El Hombre Bala', nivel: 47 },
  { id: '50.webp', label: 'Mago de Marsella', nivel: 48 },
  { id: '31.webp', label: 'Dinho', nivel: 49 },
  { id: '1.webp', label: 'La Pulga', nivel: 50 },
  { id: '56.webp', label: 'El Escorpión', nivel: 51 },
  { id: '57.webp', label: 'El Pibe', nivel: 52 },
  { id: '62.webp', label: 'Bam-Bam', nivel: 54 },
  { id: '63.webp', label: 'Gran Matador', nivel: 56 },
  { id: '32.webp', label: 'El Fenómeno', nivel: 58 },
  { id: '30.webp', label: 'O Rei', nivel: 59 },
  { id: '25.webp', label: 'El Barrilete', nivel: 60 },
  { id: '64.webp', label: 'Tiburón', nivel: 61 },
  { id: '65.webp', label: 'El Santo', nivel: 62 },
  { id: '66.webp', label: 'Sir David', nivel: 64 },
  { id: '67.webp', label: 'El Príncipe', nivel: 66 },
  { id: '68.webp', label: 'Superman', nivel: 68 },
  { id: '69.webp', label: 'Il Capitano', nivel: 70 },
  { id: '70.webp', label: 'Pepo', nivel: 71 },
  { id: '71.webp', label: 'Tití', nivel: 72 },
  { id: '72.webp', label: 'El Eterno', nivel: 74 },
  { id: '73.webp', label: 'Fútbol Total', nivel: 75 }
];

function obtenerNombreAvatar(id) {
  const idLimpio = (id || '').replace(/\.png$/i, '.webp');
  const item = AVATARES_LISTA.find(a => a.id === idLimpio);
  return item ? item.label : 'El Canario';
}

function obtenerNivelAvatar(id) {
  const idLimpio = (id || '').replace(/\.png$/i, '.webp');
  const item = AVATARES_LISTA.find(a => a.id === idLimpio);
  return (item && item.nivel !== undefined) ? item.nivel : 0;
}

window.cambiarAvatarPaso = function(direccion) {
  const input = document.getElementById('avatar-hair-input');
  if (!input) return;
  let valActual = (input.value || '1.webp').replace(/\.png$/i, '.webp');
  let idx = AVATARES_LISTA.findIndex(a => a.id === valActual);
  if (idx === -1) idx = 0;
  idx = (idx + direccion + AVATARES_LISTA.length) % AVATARES_LISTA.length;
  const nuevo = AVATARES_LISTA[idx];
  input.value = nuevo.id;
  actualizarAvatarLive();
};

window.abrirModalSelectorAvatar = function() {
  const m = document.getElementById('avatar-selector-modal');
  if (!m) return;
  m.style.display = 'flex';
  renderizarAvataresGrid();
};

window.cerrarModalSelectorAvatar = function() {
  const m = document.getElementById('avatar-selector-modal');
  if (m) m.style.display = 'none';
};

function renderizarAvataresGrid() {
  const container = document.getElementById('avatares-grid-container');
  const subInfo = document.getElementById('avatar-modal-sub-info');
  if (!container) return;

  const actual = (document.getElementById('avatar-hair-input')?.value || '1.webp').replace(/\.png$/i, '.webp');
  const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
  const desbloqueadosCount = AVATARES_LISTA.filter(a => miNivel >= a.nivel).length;

  if (subInfo) {
    subInfo.innerHTML = `Tu rango: <b>Nivel ${miNivel}</b> · Desbloqueados: <b style="color:var(--accent-color);">${desbloqueadosCount} / ${AVATARES_LISTA.length}</b>`;
  }

  container.innerHTML = AVATARES_LISTA.map(item => {
    const isSel = item.id === actual;
    const isLocked = miNivel < item.nivel;
    let overlayHTML = isLocked ? `
      <div class="avatar-grid-lock-mask">
        <i class="ph-fill ph-lock-key"></i>
        <span>NV. ${item.nivel}</span>
      </div>` : '';

    return `
    <div class="avatar-grid-card ${isSel ? 'selected' : ''} ${isLocked ? 'locked' : 'unlocked'}" 
         onclick="seleccionarAvatarDirecto('${item.id}', ${item.nivel})">
      <div class="avatar-grid-img-wrap">
        <img src="${item.id}" alt="${item.label}" class="${isLocked ? 'avatar-locked-blur' : ''}" decoding="async" loading="lazy">
        ${overlayHTML}
      </div>
      <span>${item.label}</span>
    </div>`;
  }).join('');
}

window.seleccionarAvatarDirecto = function(id, nivelReq) {
  const miNivel = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
  if (miNivel < nivelReq) {
    if (typeof showToast === 'function') showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! 🔒`, 'ph-lock-key', 'warning');
    return;
  }
  const input = document.getElementById('avatar-hair-input');
  if (input) input.value = id;
  actualizarAvatarLive();
  cerrarModalSelectorAvatar();
};

const POSICIONES_NOMBRES = {
  'POR': 'Arquero', 'DFC': 'Defensor Central', 'LD': 'Lateral Der.', 'LI': 'Lateral Izq.',
  'MCD': 'Medio Defensivo', 'MC': 'Mediocentro', 'MCO': 'Medio Ofensivo', 'MI': 'Medio Izq.',
  'MD': 'Medio Der.', 'EI': 'Extremo Izq.', 'ED': 'Extremo Der.', 'SD': 'Segundo Del.',
  'DC': 'Delantero', 'DT': 'Director Técnico'
};

const FORMACIONES_TACTICAS = {
  '4-3-3': {
    nombre: '4-3-3',
    posiciones: [
      { pos: 'DC', top: '14%', left: '50%' }, { pos: 'EI', top: '22%', left: '18%' },
      { pos: 'ED', top: '22%', left: '82%' }, { pos: 'MC', top: '48%', left: '30%' },
      { pos: 'MCD', top: '58%', left: '50%' }, { pos: 'MC', top: '48%', left: '70%' },
      { pos: 'LI', top: '76%', left: '18%' }, { pos: 'DFC', top: '78%', left: '38%' },
      { pos: 'DFC', top: '78%', left: '62%' }, { pos: 'LD', top: '76%', left: '82%' },
      { pos: 'POR', top: '92%', left: '50%' }
    ]
  },
  '4-4-2': {
    nombre: '4-4-2',
    posiciones: [
      { pos: 'DC', top: '16%', left: '36%' }, { pos: 'DC', top: '16%', left: '64%' },
      { pos: 'MI', top: '46%', left: '18%' }, { pos: 'MC', top: '50%', left: '38%' },
      { pos: 'MC', top: '50%', left: '62%' }, { pos: 'MD', top: '46%', left: '82%' },
      { pos: 'LI', top: '76%', left: '18%' }, { pos: 'DFC', top: '78%', left: '38%' },
      { pos: 'DFC', top: '78%', left: '62%' }, { pos: 'LD', top: '76%', left: '82%' },
      { pos: 'POR', top: '92%', left: '50%' }
    ]
  },
  '4-2-3-1': {
    nombre: '4-2-3-1',
    posiciones: [
      { pos: 'DC', top: '14%', left: '50%' }, { pos: 'MI', top: '34%', left: '18%' },
      { pos: 'MCO', top: '32%', left: '50%' }, { pos: 'MD', top: '34%', left: '82%' },
      { pos: 'MCD', top: '54%', left: '36%' }, { pos: 'MCD', top: '54%', left: '64%' },
      { pos: 'LI', top: '76%', left: '18%' }, { pos: 'DFC', top: '78%', left: '38%' },
      { pos: 'DFC', top: '78%', left: '62%' }, { pos: 'LD', top: '76%', left: '82%' },
      { pos: 'POR', top: '92%', left: '50%' }
    ]
  },
  '3-5-2': {
    nombre: '3-5-2',
    posiciones: [
      { pos: 'DC', top: '15%', left: '38%' }, { pos: 'SD', top: '20%', left: '62%' },
      { pos: 'MI', top: '45%', left: '16%' }, { pos: 'MC', top: '48%', left: '36%' },
      { pos: 'MCD', top: '58%', left: '50%' }, { pos: 'MC', top: '48%', left: '64%' },
      { pos: 'MD', top: '45%', left: '84%' }, { pos: 'DFC', top: '78%', left: '26%' },
      { pos: 'DFC', top: '80%', left: '50%' }, { pos: 'DFC', top: '78%', left: '74%' },
      { pos: 'POR', top: '92%', left: '50%' }
    ]
  }
};

let formacionTacticaActual = '4-3-3';

window.cambiarFormacionTactica = function(fKey) {
  if (!FORMACIONES_TACTICAS[fKey]) return;
  formacionTacticaActual = fKey;
  renderizarCanchaTactica();
};

window.renderizarCanchaTactica = function() {
  const container = document.getElementById('pitch-tactical-nodes');
  const tabs = document.querySelectorAll('.pitch-form-tab');
  if (!container) return;

  const f = FORMACIONES_TACTICAS[formacionTacticaActual] || FORMACIONES_TACTICAS['4-3-3'];
  const posActual = document.getElementById('avatar-pos-input')?.value || 'DC';

  tabs.forEach(t => t.classList.toggle('active', t.dataset.form === formacionTacticaActual));

  container.innerHTML = f.posiciones.map(item => {
    const isSel = item.pos === posActual;
    return `<button type="button" class="pitch-pos-node ${isSel ? 'active' : ''}" data-pos="${item.pos}" style="top: ${item.top}; left: ${item.left};" onclick="seleccionarPosicionCancha('${item.pos}')">${item.pos}</button>`;
  }).join('');

  const dtBtn = document.querySelector('.dt-node');
  if (dtBtn) dtBtn.classList.toggle('active', posActual === 'DT');
};

window.togglePitchPicker = function(el) {
  const pitchContainer = document.getElementById('pitch-picker-dropdown');
  const chev = el ? el.querySelector('.pitch-chevron') : document.querySelector('.pitch-chevron');
  if (pitchContainer) {
    const isOpen = pitchContainer.classList.toggle('open');
    if (chev) chev.className = isOpen ? 'ph-bold ph-caret-up pitch-chevron' : 'ph-bold ph-caret-down pitch-chevron';
    if (isOpen) renderizarCanchaTactica();
  }
};

window.seleccionarPosicionCancha = function(pos) {
  const input = document.getElementById('avatar-pos-input');
  const label = document.getElementById('pitch-pos-selected-name');
  const headerPreview = document.getElementById('pitch-header-preview');
  const textoCompleto = `${pos} — ${POSICIONES_NOMBRES[pos] || pos}`;
  if (input) input.value = pos;
  if (label) label.textContent = textoCompleto;
  if (headerPreview) headerPreview.textContent = pos;

  if (pos !== 'DT') {
    const actual = FORMACIONES_TACTICAS[formacionTacticaActual];
    const estaEnActual = actual && actual.posiciones.some(p => p.pos === pos);
    if (!estaEnActual) {
      for (let k in FORMACIONES_TACTICAS) {
        if (FORMACIONES_TACTICAS[k].posiciones.some(p => p.pos === pos)) {
          formacionTacticaActual = k;
          break;
        }
      }
    }
  }

  renderizarCanchaTactica();
  actualizarAvatarLive();
};

window.actualizarAvatarLive = function() {
  const hInput = document.getElementById('avatar-hair-input');
  const hLabel = document.getElementById('avatar-hair-label');

  if (hInput) {
    const imgId = hInput.value || '1.webp';
    const container = document.getElementById('fut-avatar-live-container');
    if (container) container.innerHTML = generarAvatarHTML(imgId);
    if (hLabel) {
      hLabel.innerHTML = `<span>${obtenerNombreAvatar(imgId)}</span> <i class="ph-bold ph-magnifying-glass" style="color:var(--accent-color); font-size:0.85rem; flex-shrink:0;"></i>`;
    }
  }

  const posInput = document.getElementById('avatar-pos-input');
  if (posInput) {
    const futPos = document.getElementById('fut-pos-display');
    if (futPos) futPos.textContent = posInput.value;
  }
  const logoInput = document.getElementById('avatar-logo-input');
  if (logoInput) {
    const futClub = document.getElementById('fut-club-display');
    if (futClub) {
      futClub.src = obtenerUrlEscudo(logoInput.value);
      futClub.setAttribute('referrerpolicy', 'no-referrer');
    }
  }
};

async function verificarApodoDisponible(apodoBuscado) {
  if (!supabaseClient || !apodoBuscado) return true;
  const apodoLimpio = apodoBuscado.trim();
  if (!apodoLimpio) return false;

  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const miEmail = (u && u.email) ? u.email.trim().toLowerCase() : '';
  const miId = typeof getUserId === 'function' ? getUserId() : 'guest';
  const apodoLower = apodoLimpio.toLowerCase();

  try {
    const { data: filasRanking, error: errRanking } = await supabaseClient
      .from('ranking')
      .select('nombre, email')
      .ilike('nombre', apodoLimpio)
      .limit(50);

    if (!errRanking && filasRanking && filasRanking.length > 0) {
      for (const fila of filasRanking) {
        if ((fila.nombre || '').trim().toLowerCase() === apodoLower) {
          const emailFila = (fila.email || '').trim().toLowerCase();
          if (miEmail && emailFila && emailFila === miEmail) continue;
          return false;
        }
      }
    }

    try {
      const { data: perfilesNube } = await supabaseClient.from('perfiles').select('id_usuario, datos_juego');
      if (perfilesNube && perfilesNube.length > 0) {
        for (const p of perfilesNube) {
          const nickGuardado = (p.datos_juego?.preferencias?.custom_nick || '').trim().toLowerCase();
          if (nickGuardado === apodoLower) {
            if (miId !== 'guest' && p.id_usuario === miId) continue;
            return false;
          }
        }
      }
    } catch (e) {}

    try {
      const [{ data: victorias }, { data: derrotas }] = await Promise.all([
        supabaseClient.from('victorias_versus').select('nombre, id_usuario').ilike('nombre', apodoLimpio).limit(20),
        supabaseClient.from('derrotas_versus').select('nombre, id_usuario').ilike('nombre', apodoLimpio).limit(20)
      ]);
      const partidasVersus = [...(victorias || []), ...(derrotas || [])];
      for (const partida of partidasVersus) {
        if ((partida.nombre || '').trim().toLowerCase() === apodoLower) {
          if (miId !== 'guest' && partida.id_usuario === miId) continue;
          return false;
        }
      }
    } catch (e) {}

    return true;
  } catch (err) {
    return true;
  }
}

async function guardarPersonalizacion() {
  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const nickViejo = (typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : 'Anónimo');
  const nickInput = document.getElementById('avatar-nick-input');
  let nickNuevo = nickViejo;
  if (nickInput && nickInput.value.trim() !== '') {
    nickNuevo = nickInput.value.trim().substring(0, 16);
  }

  if (nickNuevo.toLowerCase() !== nickViejo.toLowerCase()) {
    const disponible = await verificarApodoDisponible(nickNuevo);
    if (!disponible) {
      if (typeof showToast === 'function') showToast(`El apodo "${nickNuevo}" ya pertenece a otro jugador. Elegí otro 🚫`, 'ph-warning-circle', 'danger');
      if (nickInput) nickInput.value = nickViejo;
      const futName = document.getElementById('fut-name-display');
      if (futName) futName.textContent = nickViejo || (u ? u.name.split(' ')[0] : 'Jugador');
      return;
    }
  }

  const posSelect = document.getElementById('avatar-pos-input');
  if (posSelect && typeof setPref === 'function') {
    setPref('ev_user_pos', posSelect.value);
    const futPos = document.getElementById('fut-pos-display');
    if (futPos) futPos.textContent = posSelect.value;
  }

  const themeInput = document.getElementById('card-theme-input');
  if (themeInput && typeof setPref === 'function') {
    setPref('ev_card_theme', themeInput.value);
  }

  if (typeof setPref === 'function') setPref('ev_custom_nick', nickNuevo);
  const futName = document.getElementById('fut-name-display');
  if (futName) futName.textContent = nickNuevo || (u ? u.name.split(' ')[0] : 'Jugador');
  if (nickNuevo) {
    cacheAvataresUsuarios[nickNuevo.toLowerCase()] = document.getElementById('avatar-hair-input')?.value || '1.webp';
  }

  const hairInput = document.getElementById('avatar-hair-input');
  if (hairInput) {
    const nivelReq = obtenerNivelAvatar(hairInput.value);
    const nivelUser = (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) ? userStats.nivelActual : 0;
    if (nivelUser < nivelReq) {
      if (typeof showToast === 'function') showToast(`¡Este futbolista se desbloquea en el Nivel ${nivelReq}! Seguí sumando XP 🔒`, 'ph-lock-key', 'warning');
      return;
    }
    if (typeof setPref === 'function') setPref('ev_avatar_hair', hairInput.value);
  }

  const logoInput = document.getElementById('avatar-logo-input');
  if (logoInput && typeof setPref === 'function') setPref('ev_avatar_logo', logoInput.value);

  actualizarAvatarLive();
  if (typeof renderizarBotonLogin === 'function') renderizarBotonLogin();
  if (typeof ancestralHeaderNivel === 'function') ancestralHeaderNivel();
  if (typeof guardarStats === 'function') guardarStats();

  const futOvr = document.querySelector('.fut-ovr');
  if (futOvr) {
    const n = NIVELES[typeof calcularNivelIdx === 'function' ? calcularNivelIdx(userStats.xpTotal) : 0];
    futOvr.textContent = n.ovr;
  }

  const cardEl = document.getElementById('fut-card-main');
  if (cardEl) {
    let th = typeof getPref === 'function' ? getPref('ev_card_theme', 'arg') : 'arg';
    const validThemes = TEMAS_LISTA.map(t => t.k);
    if (!validThemes.includes(th)) th = 'arg';
    cardEl.className = 'fut-card ' + th;
  }

  if (document.getElementById('customization-panel-wrapper')?.classList.contains('open')) {
    toggleCustomization();
  }

  if (typeof showToast === 'function') showToast('¡Personalización guardada! 🎉', 'ph-check-circle', 'success');

  if (nickViejo.toLowerCase() !== nickNuevo.toLowerCase() && typeof supabaseClient !== 'undefined' && supabaseClient) {
    actualizarApodoEnTodoElSistema(nickViejo, nickNuevo);
  }
}

async function actualizarApodoEnTodoElSistema(nickViejo, nickNuevo) {
  if (!supabaseClient || !nickNuevo) return;
  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const miEmail = (u && u.email) ? u.email.trim() : '';
  const idUser = typeof getUserId === 'function' ? getUserId() : 'guest';
  const vLimpio = (nickViejo || '').trim();
  const nLimpio = (nickNuevo || '').trim();

  try {
    await supabaseClient.rpc('actualizar_apodo_global', {
      p_id_usuario: idUser,
      p_email: miEmail,
      p_nombre_viejo: vLimpio,
      p_nombre_nuevo: nLimpio
    });

    if (miEmail) {
      await supabaseClient.from('ranking').update({ nombre: nLimpio }).eq('email', miEmail);
    }
    if (vLimpio && vLimpio !== 'Anónimo' && vLimpio !== 'Invitado') {
      await supabaseClient.from('ranking').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
    }

    if (idUser && idUser !== 'guest') {
      await supabaseClient.from('victorias_versus').update({ nombre: nLimpio }).eq('id_usuario', idUser);
      await supabaseClient.from('derrotas_versus').update({ nombre: nLimpio }).eq('id_usuario', idUser);
    }
    if (vLimpio && vLimpio !== 'Anónimo' && vLimpio !== 'Invitado') {
      await supabaseClient.from('victorias_versus').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
      await supabaseClient.from('derrotas_versus').update({ nombre: nLimpio }).ilike('nombre', vLimpio);
    }

    const nombreLiga = localStorage.getItem('ev_codigo_liga_amigos');
    if (nombreLiga) {
      try {
        await supabaseClient.rpc('actualizar_apodo_liga', {
          p_liga: nombreLiga,
          p_nombre_viejo: vLimpio,
          p_nombre_nuevo: nLimpio
        });
      } catch(e) {}

      if (typeof ligaAmigosChannel !== 'undefined' && ligaAmigosChannel) {
        ligaAmigosChannel.send({ type: 'broadcast', event: 'fuerza_refresh', payload: {} });
      }
    }
  } catch (err) {}
}

function previsualizarTema(tema) {
  const card = document.getElementById('fut-card-main');
  if (!card) return;
  card.className = 'fut-card ' + tema;
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.tema === tema));
}

let logrosTabActual = 'todos';

function filtrarLogros(tipo) {
  logrosTabActual = tipo;
  document.querySelectorAll('.logro-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tipo === tipo));
  renderizarGridLogros();
}

function renderizarGridLogros() {
  const grid = document.getElementById('logros-grid-v2');
  if (!grid) return;
  const logros = calcularLogros();
  let filtrados;
  if (logrosTabActual === 'todos') filtrados = logros;
  else if (logrosTabActual === 'desbloqueados') filtrados = logros.filter(l => l.unlocked);
  else if (logrosTabActual === 'progreso') filtrados = logros.filter(l => !l.unlocked && l.pct > 0);
  else filtrados = logros.filter(l => !l.unlocked);
  
  const total = logros.length, desbloqueados = logros.filter(l => l.unlocked).length;
  const counterEl = document.getElementById('logros-counter');
  if (counterEl) counterEl.textContent = `${desbloqueados}/${total}`;
  
  if (!filtrados.length) {
    grid.innerHTML = `<div class="logros-empty"><i class="ph-duotone ph-smiley-wink"></i><span>${logrosTabActual==='desbloqueados'?'Aún no desbloqueaste logros. ¡A jugar!':logrosTabActual==='progreso'?'No tenés logros en progreso.':'¡Todos tus logros están desbloqueados!'}</span></div>`;
    return;
  }
  const rarityLabel = { common: 'Común', rare: 'Raro', epic: 'Épico' };
  grid.innerHTML = filtrados.map(l => {
    const rarityClass = l.rarity === 'epic' ? 'epic' : l.rarity === 'rare' ? 'rare' : '';
    const progressBar = (l.pct !== undefined && !l.unlocked && l.pct > 0) ? `<div class="logro-progress-mini"><div class="logro-progress-bar-bg"><div class="logro-progress-bar-fill" style="width:${l.pct}%;"></div></div><div class="logro-progress-text">${l.pctLabel||''}</div></div>` : '';
    const unlockBadge = l.unlocked ? `<div class="logro-unlock-badge">✓</div>` : '';
    const statusClass = l.unlocked ? 'unlocked' : (l.pct > 0 ? 'in-progress' : 'locked');
    return `<div class="logro-card-v2 ${rarityClass} ${statusClass}">${unlockBadge}<div class="logro-icon-v2">${l.icon}</div><div class="logro-name-v2">${l.name}</div><div class="logro-req-v2">${l.req}</div>${progressBar}<div class="logro-rarity-pill">${rarityLabel[l.rarity]||'Común'}</div></div>`;
  }).join('');
}

function calcularLogros() {
  const s = userStats;
  const logros = [];
  function addTierLogro(id, icon, baseName, currentVal, step, unit, rarity = 'common') {
    const val = currentVal || 0;
    const tierActual = Math.floor(val / step);
    const pct = Math.round(((val % step) / step) * 100);
    if (tierActual > 0) {
      logros.push({ id: `${id}_${tierActual}`, icon, name: `${baseName} ${tierActual}`, rarity, req: `${val.toLocaleString('es-AR')} de ${(tierActual*step).toLocaleString('es-AR')}${unit}`, unlocked: true, pct: 100, pctLabel: '' });
    }
    const siguiente = tierActual + 1;
    const progActual = val - (tierActual * step);
    logros.push({ id: `${id}_${siguiente}`, icon, name: `${baseName} ${siguiente}`, rarity, req: `Llegá a ${(siguiente*step).toLocaleString('es-AR')}${unit}`, unlocked: false, pct: tierActual === 0 ? pct : Math.round((progActual / step) * 100), pctLabel: `${val.toLocaleString('es-AR')}/${(siguiente*step).toLocaleString('es-AR')}${unit}` });
  }

  addTierLogro('voto', '<img src="catador.webp" class="logro-img-icon" alt="Catador">', 'Catador', s.votosRealizados, 5, ' califs', 'common');
  addTierLogro('trivia', '<img src="curioso.webp" class="logro-img-icon" alt="Curioso">', 'Curioso', s.triviasVistas, 5, ' trivias', 'common');
  addTierLogro('guessr', '<img src="piloto.webp" class="logro-img-icon" alt="Piloto">', 'Piloto', s.partidasJugadas, 5, ' partidas', 'common');
  addTierLogro('liga', '<img src="explorador.webp" class="logro-img-icon" alt="Explorador">', 'Explorador', s.ligasExploradas ? s.ligasExploradas.size : 0, 2, ' ligas', 'common');
  addTierLogro('aleat', '<img src="aventurero.webp" class="logro-img-icon" alt="Aventurero">', 'Aventurero', s.vuelosAleatorios || 0, 10, ' vuelos', 'common');
  addTierLogro('racha', '<img src="constante.webp" class="logro-img-icon" alt="Constante">', 'Constante', s.rachaActual || 1, 7, ' días', 'rare');
  addTierLogro('maxscore', '<img src="record.webp" class="logro-img-icon" alt="Récord">', 'Récord', s.maxScore || 0, 5000, ' pts', 'epic');
  addTierLogro('xptotal', '<img src="acumulador.webp" class="logro-img-icon" alt="Acumulador">', 'Acumulador', s.xpTotal || 0, 10000, ' XP', 'epic');
  addTierLogro('versus_win', '<img src="dominante.webp" class="logro-img-icon" alt="Dominante">', 'Dominante', s.partidasGanadas || 0, 3, ' victorias', 'epic');

  logros.push({ id: 'bienvenido', icon: '<img src="primer-despegue.webp" class="logro-img-icon" alt="Primer Despegue">', name: 'Primer Despegue', rarity: 'common', req: 'Abrí la app por primera vez', unlocked: (s.sesionesTotal || 0) >= 1, pct: (s.sesionesTotal || 0) >= 1 ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'nick', icon: '<img src="identidad.webp" class="logro-img-icon" alt="Identidad">', name: 'Identidad', rarity: 'common', req: 'Personalizá tu apodo', unlocked: !!(typeof getPref === 'function' && getPref('ev_custom_nick', '')), pct: (typeof getPref === 'function' && getPref('ev_custom_nick', '')) ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'primer_versus', icon: '<img src="bautismo-de-fuego.webp" class="logro-img-icon" alt="Bautismo de Fuego">', name: 'Bautismo de Fuego', rarity: 'common', req: 'Ganá tu primer Versus 1v1', unlocked: (s.partidasGanadas || 0) >= 1, pct: (s.partidasGanadas || 0) >= 1 ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'localista', icon: '<img src="gps-humano.webp" class="logro-img-icon" alt="GPS Humano">', name: 'GPS Humano', rarity: 'rare', req: 'Adiviná a menos de 5 km', unlocked: !!s.medallaLocalista, pct: s.medallaLocalista ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'unKm', icon: '<img src="ojo-de-aguila.webp" class="logro-img-icon" alt="Ojo de Águila">', name: 'Ojo de Águila', rarity: 'epic', req: 'Adiviná a menos de 1 km', unlocked: !!s.guessrUnKm, pct: s.guessrUnKm ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'perfecto', icon: '<img src="perfeccionista.webp" class="logro-img-icon" alt="Perfeccionista">', name: 'Perfeccionista', rarity: 'epic', req: 'Todo Guessr >4000 pts', unlocked: !!s.guessrPerfecto, pct: s.guessrPerfecto ? 100 : 0, pctLabel: '' });
  logros.push({ id: 'ordenPerfecto', icon: '<img src="estratega.webp" class="logro-img-icon" alt="Estratega">', name: 'Estratega', rarity: 'epic', req: 'Orden perfecto sin errores', unlocked: !!s.ordenSinFallar, pct: s.ordenSinFallar ? 100 : 0, pctLabel: '' });

  return logros;
}

function toggleLogrosMobile() {
  const wrapper = document.getElementById('logros-content-wrapper');
  const chev = document.getElementById('logros-chevron');
  if (wrapper) {
    const isOpen = wrapper.classList.toggle('open');
    if (chev) chev.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

function abrirModalPerfil() {
  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const esGoogle = u && u.loginMethod === 'google';
  const nombreDefault = u ? u.name.split(' ')[0] : 'Invitado';
  const nivelIdx = typeof calcularNivelIdx === 'function' ? calcularNivelIdx(userStats.xpTotal) : 0;
  const nivel = NIVELES[nivelIdx];
  const nivelSig = NIVELES[Math.min(nivelIdx + 1, NIVELES.length - 1)];

  let textoRankingTop = "⚽ COMUNIDAD";
  if (nivelIdx >= 50) textoRankingTop = "TOP 0.1% COMUNIDAD";
  else if (nivelIdx >= 35) textoRankingTop = "TOP 1% COMUNIDAD";
  else if (nivelIdx >= 25) textoRankingTop = "TOP 5% COMUNIDAD";
  else if (nivelIdx >= 15) textoRankingTop = "TOP 10% COMUNIDAD";
  else if (nivelIdx >= 5) textoRankingTop = "TOP 25% COMUNIDAD";
  else textoRankingTop = "🌱 PROMESA";

  const nombreRangoPuro = nivel.nombre.replace(/\s+Lvl\s+\d+/i, '').trim();
  const xpEnNivel = userStats.xpTotal - nivel.min;
  const xpNivelTotal = nivelSig.min === Infinity ? xpEnNivel : (nivelSig.min - nivel.min);
  const xpFaltante = nivelSig.min === Infinity ? 0 : Math.max(0, nivelSig.min - userStats.xpTotal);
  const xpPct = nivelIdx === NIVELES.length - 1 ? 100 : Math.min(100, Math.round((xpEnNivel / xpNivelTotal) * 100));

  const savedNick = typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '';
  const savedPos = typeof getPref === 'function' ? getPref('ev_user_pos', 'DT') : 'DT';
  let savedTheme = typeof getPref === 'function' ? getPref('ev_card_theme', 'arg') : 'arg';
  const validThemes = TEMAS_LISTA.map(t => t.k);
  if (!validThemes.includes(savedTheme)) savedTheme = 'arg';

  const savedHair = typeof getPref === 'function' ? getPref('ev_avatar_hair', '1.webp') : '1.webp';
  const savedShirt = typeof getPref === 'function' ? getPref('ev_avatar_shirt', 'solid') : 'solid';
  const savedNum = typeof getPref === 'function' ? getPref('ev_avatar_num', '10') : '10';
  const savedLogo = typeof getPref === 'function' ? getPref('ev_avatar_logo', 'ev') : 'ev';
  const activeCardClass = savedTheme;

  const authBtnHTML = esGoogle 
    ? `<div class="profile-login-wrapper">
        <button onclick="cerrarSesion()" class="btn-3d secondary profile-login-btn logout">
          <i class="ph-bold ph-sign-out"></i> Cerrar sesión
        </button>
       </div>`
    : `<div class="profile-login-wrapper">
        <button onclick="manejarClickLogin()" class="btn-3d secondary profile-login-btn">
          <i class="ph-bold ph-google-logo"></i> Iniciá sesión
        </button>
        <div class="profile-login-tooltip">
          Si querés que tu progreso se sincronice en todos tus dispositivos, ¡iniciá sesión con Google!
        </div>
       </div>`;

  const today = new Date();
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  let startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const activeStreakDates = new Set();
  let curr = new Date(today);
  curr.setHours(0,0,0,0);
  const todayStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  if (!userStats.activeDates || !userStats.activeDates.includes(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const dateStr = curr.getFullYear() + '-' + String(curr.getMonth() + 1).padStart(2, '0') + '-' + String(curr.getDate()).padStart(2, '0');
    if (userStats.activeDates && userStats.activeDates.includes(dateStr)) {
      activeStreakDates.add(dateStr);
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  let calHTML = '';
  for (let i = 0; i < startOffset; i++) { calHTML += `<div class="calendar-cell" style="visibility:hidden; border:none;"></div>`; }

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(currentYear, currentMonth, d);
    cellDate.setHours(0,0,0,0);
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0,0,0,0);

    const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    let cl = 'calendar-cell';

    if (cellDate > todayNormalized) cl += ' future-day';
    else if (activeStreakDates.has(dateStr)) cl += ' streak-active';
    else if (userStats.activeDates && userStats.activeDates.includes(dateStr)) cl += ' past-done';
    else cl += ' past-missed';

    calHTML += `<div class="${cl}">${d}</div>`;
  }

  const logros = calcularLogros(), totalLogros = logros.length, desbloqueados = logros.filter(l => l.unlocked).length;

  document.getElementById('profile-modal-body').innerHTML = `
    <div class="split-profile-layout">
      <div class="left-fut-column">
        <div class="fut-card ${activeCardClass}" id="fut-card-main">
          <div class="fut-card-shine"></div>
          <div class="fut-top">
            <div class="fut-badge-meta">
              <div class="fut-ovr" title="Overall: sube con tu XP">${nivel.ovr}</div>
              <div class="fut-pos" id="fut-pos-display" title="Tu posición">${savedPos}</div>
              <img src="${obtenerUrlEscudo(savedLogo)}" class="fut-club-icon" id="fut-club-display" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
            </div>
            <div class="fut-avatar-container" id="fut-avatar-live-container">${generarAvatarHTML(savedHair)}</div>
          </div>
          <div class="fut-name" id="fut-name-display" title="Tu apodo">${savedNick || nombreDefault}</div>
          <div class="fut-stats-row">
            <div class="fut-stat-item" title="Votos realizados"><span class="fut-stat-num">${userStats.votosRealizados}</span><span class="fut-stat-label">VOT</span></div>
            <div class="fut-stat-item" title="Trivias descubiertas"><span class="fut-stat-num">${userStats.triviasVistas}</span><span class="fut-stat-label">TRV</span></div>
            <div class="fut-stat-item" title="Partidas jugadas"><span class="fut-stat-num">${userStats.partidasJugadas}</span><span class="fut-stat-label">PJ</span></div>
            <div class="fut-stat-item" title="Partidos ganados 1v1"><span class="fut-stat-num">${userStats.partidasGanadas || 0}</span><span class="fut-stat-label">PG</span></div>
            <div class="fut-stat-item" title="XP total acumulado"><span class="fut-stat-num">${userStats.xpTotal>999?(userStats.xpTotal/1000).toFixed(1)+'K':userStats.xpTotal}</span><span class="fut-stat-label">XP</span></div>
          </div>
        </div>

        <div class="profile-card-actions-row">
          <button class="btn-3d secondary" id="btn-toggle-custom" onclick="toggleCustomization()"><img src="personaliza-tu-carta.webp" class="btn-custom-icon" alt="Icono"> PERSONALIZÁ TU CARTA ▼</button>
          <div class="share-btn-wrapper">
            <button class="btn-3d secondary" id="btn-share-card" onclick="compartirCartaFUT()"><i class="ph-bold ph-share-network"></i></button>
            <div class="share-tooltip">Compartí tu carta</div>
          </div>
        </div>

        <div id="customization-panel-wrapper">
          <div class="avatar-picker">
            <div class="avatar-picker-label theme-stepper-wrapper">
              <span class="theme-stepper-title"><img src="diseño-de-la-carta.webp" class="custom-label-icon" alt="Diseño"> DISEÑO DE LA CARTA</span>
              <div class="theme-stepper-control">
                <button type="button" class="avatar-stepper-btn" onclick="cambiarTemaPaso(-1)"><i class="ph-bold ph-caret-left"></i></button>
                <div class="theme-dot td-${savedTheme} active" id="theme-current-badge" data-tema="${savedTheme}"></div>
                <button type="button" class="avatar-stepper-btn" onclick="cambiarTemaPaso(1)"><i class="ph-bold ph-caret-right"></i></button>
                <input type="hidden" id="card-theme-input" value="${savedTheme}">
              </div>
            </div>
            <div class="avatar-divider"></div>
            <label class="avatar-nick-label"><img src="selecciona-tu-jugador.webp" class="custom-label-icon" alt="Jugador"> SELECCIONÁ TU JUGADOR/A</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
              <div class="avatar-stepper-box" onclick="abrirModalSelectorAvatar()" style="cursor:pointer;" title="Elegir futbolista">
                <span class="avatar-stepper-label" id="avatar-hair-label" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                  <span>${obtenerNombreAvatar(savedHair)}</span>
                  <i class="ph-bold ph-magnifying-glass" style="color:var(--accent-color); font-size:0.85rem; flex-shrink:0;"></i>
                </span>
                <input type="hidden" id="avatar-hair-input" value="${savedHair}">
              </div>
              <div class="avatar-stepper-box" onclick="abrirModalSelectorEscudo()" style="cursor:pointer;" title="Elegir escudo o bandera">
                <span class="avatar-stepper-label" id="avatar-logo-label" style="display:flex;align-items:center;justify-content:center;gap:6px;">
                  <img src="${obtenerUrlEscudo(savedLogo)}" id="avatar-logo-preview" referrerpolicy="no-referrer" style="width:28px;height:24px;object-fit:contain;border-radius:3px;box-shadow:0 0 6px rgba(0,0,0,0.5);" onerror="this.src='${ESCUDOS_MAP['ev']}';">
                  <span style="font-size:0.75rem; color:var(--accent-color); font-weight:800;"><i class="ph-bold ph-magnifying-glass"></i> Elegir</span>
                </span>
                <input type="hidden" id="avatar-logo-input" value="${savedLogo}">
              </div>
            </div>
            <div class="avatar-picker-label pitch-stepper-wrapper" onclick="window.togglePitchPicker(this)">
              <img src="posicion.webp" class="custom-label-icon" alt="Posición">
              <span class="theme-stepper-title pitch-title-text">POSICIÓN</span>
              <div class="pitch-header-control">
                <span class="pitch-current-preview" id="pitch-header-preview">${savedPos}</span>
                <i class="ph-bold ph-caret-down pitch-chevron"></i>
              </div>
            </div>
            <div class="pitch-picker-container" id="pitch-picker-dropdown">
              <div class="pitch-formations-bar">
                <button type="button" class="pitch-form-tab active" data-form="4-3-3" onclick="cambiarFormacionTactica('4-3-3')">4-3-3</button>
                <button type="button" class="pitch-form-tab" data-form="4-4-2" onclick="cambiarFormacionTactica('4-4-2')">4-4-2</button>
                <button type="button" class="pitch-form-tab" data-form="4-2-3-1" onclick="cambiarFormacionTactica('4-2-3-1')">4-2-3-1</button>
                <button type="button" class="pitch-form-tab" data-form="3-5-2" onclick="cambiarFormacionTactica('3-5-2')">3-5-2</button>
              </div>

              <div class="pitch-tactical-field">
                <div class="pitch-line-center"></div>
                <div class="pitch-circle-center"></div>
                <div class="pitch-box-top"></div>
                <div class="pitch-box-bottom"></div>
                <div id="pitch-tactical-nodes"></div>
              </div>

              <div class="pitch-footer-bar">
                <span class="pitch-selected-badge" id="pitch-pos-selected-name">${savedPos} — ${POSICIONES_NOMBRES[savedPos] || savedPos}</span>
                <button type="button" class="pitch-pos-node dt-node" data-pos="DT" onclick="seleccionarPosicionCancha('DT')">
                  <i class="ph-bold ph-clipboard-text"></i> DT
                </button>
              </div>
              <input type="hidden" id="avatar-pos-input" value="${savedPos}">
            </div>
            <label class="avatar-nick-label"><img src="apodo.webp" class="custom-label-icon" alt="Apodo"> APODO</label>
            <div class="avatar-nickname-row">
              <input type="text" class="avatar-nickname-input" id="avatar-nick-input" placeholder="Tu apodo…" maxlength="16" value="${savedNick}" oninput="const fn=document.getElementById('fut-name-display');if(fn)fn.textContent=this.value||'${nombreDefault.replace(/'/g,"\\'")}';">
            </div>
            <button class="avatar-save-btn" onclick="guardarPersonalizacion()"><img src="guardar-cambios.webp" class="btn-custom-icon" alt="Guardar"> GUARDAR CAMBIOS</button>
          </div>
        </div>
        ${authBtnHTML}
      </div>

      <div class="right-dashboard-column">
        <div class="right-dashboard-top-row">
          <div class="geoguessr-dash-box xp-profile-section" style="display:flex; flex-direction:column; justify-content:center; align-items:center; position:relative; overflow:hidden; padding: 20px 14px; background: radial-gradient(circle at center 35%, rgba(250, 204, 21, 0.12) 0%, transparent 65%), var(--bg-color);">
            <div style="position:absolute; top:-50px; right:-50px; width:180px; height:180px; background:var(--accent-color); filter:blur(90px); opacity:0.15; border-radius:50%; pointer-events:none;"></div>
            <div class="profile-level-icon-wrapper" style="margin-bottom:6px; display:flex; align-items:center; justify-content:center;">
              <img src="${nivel.iconUrl}" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 0 18px rgba(250, 204, 21, 0.65));">
            </div>
            <h3 style="font-size:1.4rem; font-weight:900; color:var(--text-main); margin-bottom:4px; text-transform:uppercase; letter-spacing:-0.5px; text-align:center;">${nombreRangoPuro}</h3>
            <div class="level-badge-inline ${nivel.cssClass}" style="font-size:0.75rem; padding:4px 12px; margin-bottom: 6px;">Nivel ${nivelIdx}</div>
            <span class="badge-ranking" style="margin-bottom: 12px;">${textoRankingTop}</span>
            <div style="width:100%; max-width: 92%; z-index:1;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.72rem; font-weight:800; align-items:center;">
                <span style="color:var(--text-muted);">${xpEnNivel.toLocaleString('es-AR')} / ${xpNivelTotal.toLocaleString('es-AR')} XP</span>
                <span style="color:var(--accent-color); font-weight:900; font-size:0.8rem;">${xpPct}%</span>
              </div>
              <div class="xp-bar-big" style="height:10px; background:var(--border-subtle); border:1px solid var(--border-strong); border-radius:20px; overflow:hidden; margin-bottom:8px;">
                <div class="xp-bar-big-fill" style="width:${xpPct}%; box-shadow:0 0 15px var(--accent-glow);"></div>
              </div>
              <div style="text-align:center; font-size:0.68rem; color:var(--text-muted); font-weight:700;">
                ${nivelSig.min === Infinity ? '🏆 ¡Alcanzaste el nivel máximo!' : `Faltan <b style="color:var(--text-main);">${xpFaltante.toLocaleString('es-AR')} XP</b> para el Nivel${nivelIdx + 1} 🚀`}
              </div>
            </div>
          </div>

          <div class="geoguessr-dash-box">
            <div class="dash-header-inline">
              <div class="dash-title-premium"><i class="ph-duotone ph-calendar-check" style="font-size:1.3rem;color:var(--accent-color);"></i> Reto Diario (${monthNames[currentMonth]})</div>
              <div class="streak-fire-badge">🔥 ${userStats.rachaActual||1} días</div>
            </div>
            <div class="calendar-matrix">
              <div class="calendar-day-label">LUN</div><div class="calendar-day-label">MAR</div><div class="calendar-day-label">MIÉ</div><div class="calendar-day-label">JUE</div><div class="calendar-day-label">VIE</div><div class="calendar-day-label">SÁB</div><div class="calendar-day-label">DOM</div>
              ${calHTML}
            </div>
          </div>
        </div>

        <div class="geoguessr-dash-box logros-box-mobile" style="flex:1; display:flex; flex-direction:column;">
          <div class="dash-header-inline logros-header-clickable" onclick="toggleLogrosMobile()">
            <div class="dash-title-premium">
              <i class="ph-duotone ph-medal" style="font-size:1.3rem;color:var(--accent-color);"></i> Vitrina de Logros 
              <i class="ph-bold ph-caret-down" id="logros-chevron" style="font-size:0.9rem; transition:transform 0.3s; margin-left:4px;"></i>
            </div>
            <div class="streak-fire-badge" id="logros-counter" style="color:var(--text-muted);">${desbloqueados}/${totalLogros}</div>
          </div>
          <div id="logros-content-wrapper" class="logros-wrapper-mobile">
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;margin-top:10px;">
              <span class="logro-rarity-pill" style="font-size:.6rem; padding:3px 10px;"></span>
              <span class="logro-rarity-pill rare" style="font-size:.6rem; padding:3px 10px;"></span>
              <span class="logro-rarity-pill epic" style="font-size:.6rem; padding:3px 10px;"></span>
            </div>
            <div class="logros-tabs-row">
              <button class="logro-tab-btn active" data-tipo="todos" onclick="filtrarLogros('todos')">Todos</button>
              <button class="logro-tab-btn" data-tipo="desbloqueados" onclick="filtrarLogros('desbloqueados')">✓ Logrados</button>
              <button class="logro-tab-btn" data-tipo="progreso" onclick="filtrarLogros('progreso')">⏳ Progreso</button>
              <button class="logro-tab-btn" data-tipo="bloqueados" onclick="filtrarLogros('bloqueados')">🔒 Bloq.</button>
            </div>
            <div class="logros-grid-v2" id="logros-grid-v2" style="flex:1;"></div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('profile-modal').style.display = 'flex';
  setTimeout(() => {
    if (typeof seleccionarPosicionCancha === 'function') seleccionarPosicionCancha(savedPos);
    const selHair = document.getElementById('avatar-hair-input'); if (selHair) selHair.value = savedHair;
    const selShirt = document.getElementById('avatar-shirt-input'); if (selShirt) selShirt.value = savedShirt;
    const selNum = document.getElementById('avatar-num-input'); if (selNum) selNum.value = savedNum;
    const selLogo = document.getElementById('avatar-logo-input'); if (selLogo) selLogo.value = savedLogo;
    renderizarGridLogros();
  }, 50);
}

function cerrarModalPerfil() {
  document.getElementById('profile-modal').style.display = 'none';
}

function reproducirSonidoApertura() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch(e) {}
}

function verificarSobreBienvenidaPostPartida() {
  const id = typeof getUserId === 'function' ? getUserId() : 'guest';
  const sobreYaAbierto = localStorage.getItem('ev_pack_bienvenida_abierto_' + id) || localStorage.getItem('ev_pack_bienvenida_abierto_global');
  const jugoOAbandono = localStorage.getItem('ev_primera_partida_finalizada_' + id) || 
                        localStorage.getItem('ev_primera_partida_finalizada_global') ||
                        localStorage.getItem('ev_primera_partida_iniciada_' + id) ||
                        localStorage.getItem('ev_primera_partida_iniciada_global');

  if (jugoOAbandono && !sobreYaAbierto) {
    setTimeout(() => {
      const rankingModal = document.getElementById('ranking-modal');
      const videoModal = document.getElementById('video-modal');
      const orderModal = document.getElementById('order-modal');
      const ligaModal = document.getElementById('liga-amigos-modal');

      const algunModalAbierto = (rankingModal && rankingModal.style.display === 'flex') ||
                                (videoModal && videoModal.style.display === 'flex') ||
                                (orderModal && orderModal.style.display === 'flex') ||
                                (ligaModal && ligaModal.style.display === 'flex');

      if (!algunModalAbierto) {
        const modal = document.getElementById('modal-pack-bienvenida');
        if (modal) modal.style.display = 'flex';
      }
    }, 350);
  }
}

window.voltearCartaPick = function(elemento, avatarId) {
  if (!elemento.classList.contains('is-flipped')) {
    reproducirSonidoApertura();
    elemento.classList.add('is-flipped');
  } else {
    seleccionarCapitanInicial(avatarId);
  }
};

function animarAperturaSobre() {
  reproducirSonidoApertura();
  const sobre = document.getElementById('ev-pack-cerrado');
  if (!sobre) return;
  sobre.classList.add('ev-pack-abriendo');

  setTimeout(() => {
    sobre.style.display = 'none';
    if (typeof dispararEfectoPackOpening === 'function') dispararEfectoPackOpening();
    const contenedorGrilla = document.getElementById('ev-pack-grilla-iniciales');
    if (!contenedorGrilla) return;
    contenedorGrilla.innerHTML = '';

    const iniciales = AVATARES_LISTA.filter(a => a.nivel === 0);
    iniciales.forEach(jugador => {
      const item = document.createElement('div');
      item.className = 'ev-card-pick';
      item.setAttribute('onclick', `voltearCartaPick(this, '${jugador.id}')`);
      item.innerHTML = `
        <div class="ev-card-pick-inner">
          <div class="ev-card-pick-back">
            <div class="ev-card-back-pattern"></div>
            <img src="logo-cartas.webp" class="ev-card-back-logo" alt="EV">
            <span class="ev-card-back-text">TOCÁ</span>
          </div>
          <div class="ev-card-pick-front">
            <div class="ev-card-pick-avatar-wrap">
              <img src="${jugador.id}" alt="${jugador.label}">
            </div>
            <span class="ev-card-pick-name">${jugador.label}</span>
            <div class="ev-card-pick-btn">ELEGIR</div>
          </div>
        </div>
      `;
      contenedorGrilla.appendChild(item);
    });

    document.getElementById('ev-pack-revelado').style.display = 'block';
  }, 1100);
}

function seleccionarCapitanInicial(avatarId) {
  const id = typeof getUserId === 'function' ? getUserId() : 'guest';
  localStorage.setItem('ev_avatar_seleccionado_' + id, avatarId);
  localStorage.setItem('ev_pack_bienvenida_abierto_' + id, 'true');
  localStorage.setItem('ev_pack_bienvenida_abierto_global', 'true');
  if (typeof setPref === 'function') setPref('ev_avatar_hair', avatarId);

  const hairInput = document.getElementById('avatar-hair-input');
  if (hairInput) hairInput.value = avatarId;

  const futContainer = document.getElementById('fut-avatar-live-container');
  if (futContainer) futContainer.innerHTML = generarAvatarHTML(avatarId);

  actualizarAvatarLive();
  if (typeof renderizarBotonLogin === 'function') renderizarBotonLogin();
  if (typeof guardarStats === 'function') guardarStats();

  const modal = document.getElementById('modal-pack-bienvenida');
  if (modal) modal.style.display = 'none';

  if (typeof showToast === 'function') showToast(`¡Elegiste a ${obtenerNombreAvatar(avatarId)} como tu capitán! `, 'ph-check-circle', 'success');
}

window.voltearCartaPremio = function(el) {
  if (!el.classList.contains('is-flipped')) {
    reproducirSonidoApertura();
    el.classList.add('is-flipped');
    const actions = document.getElementById('ev-reward-actions-box');
    if (actions) actions.style.display = 'flex';
  }
};

function comprobarRecompensaNivel(nivelActual) {
  const id = typeof getUserId === 'function' ? getUserId() : 'guest';
  const nivelNum = Number(nivelActual);
  const recompensasVistas = JSON.parse(localStorage.getItem('ev_recompensas_vistas_' + id) || '[]');

  const nuevoFichaje = AVATARES_LISTA.find(a => a.nivel > 0 && a.nivel <= nivelNum && !recompensasVistas.includes(a.id));
  if (!nuevoFichaje) return;

  recompensasVistas.push(nuevoFichaje.id);
  localStorage.setItem('ev_recompensas_vistas_' + id, JSON.stringify(recompensasVistas));

  const cardBox = document.getElementById('ev-reward-card-box');
  if (cardBox) cardBox.classList.remove('is-flipped');

  const actionsBox = document.getElementById('ev-reward-actions-box');
  if (actionsBox) actionsBox.style.display = 'none';

  document.getElementById('ev-reward-level-tag').textContent = `¡NIVEL ${nuevoFichaje.nivel} ALCANZADO!`;
  document.getElementById('ev-reward-img').src = nuevoFichaje.id;
  document.getElementById('ev-reward-name').textContent = nuevoFichaje.label;

  const btnEquipar = document.getElementById('ev-btn-equipar-premio');
  btnEquipar.onclick = () => {
    seleccionarCapitanInicial(nuevoFichaje.id);
    cerrarModalRecompensa();
  };

  document.getElementById('modal-recompensa-avatar').style.display = 'flex';
  if (typeof dispararEfectoPackOpening === 'function') dispararEfectoPackOpening();
}

function cerrarModalRecompensa() {
  document.getElementById('modal-recompensa-avatar').style.display = 'none';
  setTimeout(() => {
    if (typeof userStats !== 'undefined' && userStats.nivelActual !== undefined) {
      comprobarRecompensaNivel(userStats.nivelActual);
    }
  }, 350);
}

function obtenerAvatarParaUsuario(nombre) {
  const n = (nombre || '').trim();
  if (!n) return '1.webp';
  const nLower = n.toLowerCase();

  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const miNombre = ((typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : '')).trim().toLowerCase();
  if (nLower === miNombre || nLower === 'vos' || nLower === 'invitado') {
    return (typeof getPref === 'function' ? getPref('ev_avatar_hair', '1.webp') : '1.webp').replace(/\.png$/i, '.webp');
  }

  if (cacheAvataresUsuarios[nLower]) return cacheAvataresUsuarios[nLower];

  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = (hash << 5) - hash + n.charCodeAt(i);
    hash |= 0;
  }
  const listaAvatares = (typeof AVATARES_LISTA !== 'undefined' && AVATARES_LISTA.length) ? AVATARES_LISTA : [];
  if (listaAvatares.length) {
    const idx = Math.abs(hash) % listaAvatares.length;
    return listaAvatares[idx].id;
  }
  return '1.webp';
}

function obtenerAvatarCirculoHTML(nombreJugador, avatarDirecto = null) {
  const avatarImg = avatarDirecto || obtenerAvatarParaUsuario(nombreJugador);
  return `<div class="ranking-avatar-circle" title="${typeof sanitizarHTML === 'function' ? sanitizarHTML(nombreJugador) : nombreJugador}"><div class="ranking-avatar-inner">${generarAvatarHTML(avatarImg, true)}</div></div>`;
}

window.cerrarModalInspeccionarRival = function() {
  const m = document.getElementById('inspect-profile-modal');
  if (m) m.style.display = 'none';
};

async function precargarAvataresComunidad() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient.from('perfiles').select('datos_juego').limit(150);
    if (!error && data) {
      data.forEach(p => {
        const nick = p.datos_juego?.preferencias?.custom_nick;
        const avatar = p.datos_juego?.preferencias?.avatar_hair;
        if (nick && avatar) cacheAvataresUsuarios[nick.trim().toLowerCase()] = avatar;
      });
    }
  } catch(e) {}
}

window.inspeccionarPerfilRival = async function(nombreRival) {
  const n = (nombreRival || '').trim();
  if (!n || n.toLowerCase() === 'anónimo') return;

  const modal = document.getElementById('inspect-profile-modal');
  const body = document.getElementById('inspect-profile-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
      <i class="ph-duotone ph-circle-notch" style="font-size:2.2rem; color:var(--accent-color); animation:spinSlow 1s linear infinite;"></i>
      <p style="margin-top:12px; font-size:0.85rem; font-weight:700;">Cargando perfil de ${typeof sanitizarHTML === 'function' ? sanitizarHTML(n) : n}...</p>
    </div>
  `;
  modal.style.display = 'flex';

  let datosRival = {
    custom_nick: n, card_theme: 'arg', avatar_hair: obtenerAvatarParaUsuario(n),
    user_pos: 'DC', avatar_logo: 'ev', xpTotal: 0, nivelActual: 0, ovr: 60,
    rachaActual: 1, partidasGanadas: 0, votosRealizados: 0, triviasVistas: 0, partidasJugadas: 0
  };

  if (supabaseClient) {
    try {
      const { data: perfiles } = await supabaseClient.from('perfiles').select('experiencia, datos_juego').limit(200);
      if (perfiles && perfiles.length > 0) {
        const encontrado = perfiles.find(p => {
          const nick = p.datos_juego?.preferencias?.custom_nick;
          return nick && nick.trim().toLowerCase() === n.toLowerCase();
        });

        if (encontrado) {
          const dj = encontrado.datos_juego || {};
          const pref = dj.preferencias || {};
          datosRival.xpTotal = encontrado.experiencia || dj.xpTotal || 0;
          datosRival.nivelActual = typeof calcularNivelIdx === 'function' ? calcularNivelIdx(datosRival.xpTotal) : 0;
          datosRival.ovr = NIVELES[datosRival.nivelActual]?.ovr || 60;
          datosRival.card_theme = pref.card_theme || 'arg';
          datosRival.avatar_hair = pref.avatar_hair || datosRival.avatar_hair;
          datosRival.user_pos = pref.user_pos || 'DC';
          datosRival.avatar_logo = pref.avatar_logo || 'ev';
          datosRival.rachaActual = dj.rachaActual || 1;
          datosRival.partidasGanadas = dj.partidasGanadas || 0;
          datosRival.votosRealizados = dj.votosRealizados || 0;
          datosRival.triviasVistas = dj.triviasVistas || 0;
          datosRival.partidasJugadas = dj.partidasJugadas || 0;
        }
      }

      const { count: victoriasReales } = await supabaseClient.from('victorias_versus').select('*', { count: 'exact', head: true }).ilike('nombre', n);
      if (victoriasReales !== null && victoriasReales !== undefined) {
        datosRival.partidasGanadas = victoriasReales;
      }

      const uActual = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
      const miNickActual = ((typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (uActual ? uActual.name.split(' ')[0] : '')).trim().toLowerCase();
      if (n.toLowerCase() === miNickActual && victoriasReales !== null && victoriasReales !== undefined) {
        userStats.partidasGanadas = victoriasReales;
        if (typeof guardarStats === 'function') guardarStats();
      }
    } catch (e) {}
  }

  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const miNombre = ((typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : '')).trim().toLowerCase();
  const miLigaActual = localStorage.getItem('ev_codigo_liga_amigos');

  let botonInvitarLigaHTML = '';
  if (miLigaActual && n.toLowerCase() !== miNombre) {
    botonInvitarLigaHTML = `
      <button type="button" onclick="enviarInvitacionDirectaRival('${typeof sanitizarHTML === 'function' ? sanitizarHTML(miLigaActual) : miLigaActual}', '${typeof sanitizarHTML === 'function' ? sanitizarHTML(n) : n}', this)" class="btn-inspect-invite-liga">
        <i class="ph-bold ph-paper-plane-tilt"></i> Invitar a mi liga (${typeof sanitizarHTML === 'function' ? sanitizarHTML(miLigaActual.replace(/_/g, ' ')) : miLigaActual})
      </button>
    `;
  }

  body.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; width:100%;">
      <div class="fut-card ${datosRival.card_theme}" style="transform:scale(0.92); margin:4px 0 -12px 0;">
        <div class="fut-card-shine"></div>
        <div class="fut-top">
          <div class="fut-badge-meta">
            <div class="fut-ovr">${datosRival.ovr}</div>
            <div class="fut-pos">${datosRival.user_pos}</div>
            <img src="${obtenerUrlEscudo(datosRival.avatar_logo)}" class="fut-club-icon" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
          </div>
          <div class="fut-avatar-container">${generarAvatarHTML(datosRival.avatar_hair, true)}</div>
        </div>
        <div class="fut-name">${typeof sanitizarHTML === 'function' ? sanitizarHTML(datosRival.custom_nick) : datosRival.custom_nick}</div>
        <div class="fut-stats-row">
          <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.votosRealizados}</span><span class="fut-stat-label">VOT</span></div>
          <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.triviasVistas}</span><span class="fut-stat-label">TRV</span></div>
          <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.partidasJugadas}</span><span class="fut-stat-label">PJ</span></div>
          <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.partidasGanadas}</span><span class="fut-stat-label">PG</span></div>
          <div class="fut-stat-item"><span class="fut-stat-num">${datosRival.xpTotal > 999 ? (datosRival.xpTotal/1000).toFixed(1)+'K' : datosRival.xpTotal}</span><span class="fut-stat-label">XP</span></div>
        </div>
      </div>

      <div class="inspect-stats-grid">
        <div class="inspect-stat-pill">
          <i class="ph-bold ph-shield-star"></i>
          <span>Nivel</span>
          <strong>Nivel ${datosRival.nivelActual}</strong>
        </div>
        <div class="inspect-stat-pill">
          <i class="ph-bold ph-fire" style="color:#ff9f05;"></i>
          <span>Racha</span>
          <strong>${datosRival.rachaActual} Días</strong>
        </div>
        <div class="inspect-stat-pill">
          <i class="ph-bold ph-sword" style="color:#3b82f6;"></i>
          <span>Victorias</span>
          <strong>${datosRival.partidasGanadas} PG</strong>
        </div>
      </div>

      ${botonInvitarLigaHTML}
    </div>
  `;
};

const FALLBACK_PIXEL_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function urlABase64Seguro(url) {
  if (!url || typeof url !== 'string') return FALLBACK_PIXEL_BASE64;
  if (url.startsWith('data:image')) return url;

  let absUrl;
  try {
    absUrl = new URL(url, window.location.href).href;
  } catch (err) {
    return FALLBACK_PIXEL_BASE64;
  }

  try {
    const res = await fetch(absUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const dataUri = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
        return dataUri;
      }
    }
  } catch (e) {}

  if (absUrl.startsWith('http')) {
    try {
      const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(absUrl)}&output=png`;
      const resProxy = await fetch(proxyUrl, { mode: 'cors' });
      if (resProxy.ok) {
        const blob = await resProxy.blob();
        const dataUri = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (dataUri && typeof dataUri === 'string' && dataUri.startsWith('data:image')) {
          return dataUri;
        }
      }
    } catch (e) {}
  }

  return FALLBACK_PIXEL_BASE64;
}

async function compartirCartaFUT() {
  const cardElement = document.getElementById('fut-card-main');
  if (!cardElement) {
    if (typeof showToast === 'function') showToast("No se encontró la carta para exportar", "ph-warning-circle", "danger");
    return;
  }

  if (typeof showToast === 'function') showToast("Preparando tu carta", "ph-hourglass", "info");

  const nivelIdx = typeof calcularNivelIdx === 'function' ? calcularNivelIdx(userStats.xpTotal) : 0;
  const nivel = NIVELES[nivelIdx];
  const racha = userStats.rachaActual || 1;
  const victorias = userStats.partidasGanadas || 0;
  const u = typeof obtenerUsuarioLogueado === 'function' ? obtenerUsuarioLogueado() : null;
  const customNick = (typeof getPref === 'function' ? getPref('ev_custom_nick', '') : '') || (u ? u.name.split(' ')[0] : 'Jugador');

  const urlReto = `https://www.estadiosvirtuales.com?desafio=${encodeURIComponent(customNick)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlReto)}&color=00e676&bgcolor=142030`;

  const poster = document.createElement('div');
  poster.id = 'poster-export-container';
  poster.style.cssText = 'position: fixed; left: 0; top: 0; width: 450px; height: 800px; z-index: -9999; opacity: 1; pointer-events: none; background: #090e15; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 24px 20px 20px; box-sizing: border-box; font-family: "Segoe UI", system-ui, sans-serif; color: #ffffff;';

  const logoHeaderUrl = new URL('https://estadiosvirtuales.github.io/estadiosvirt/escudos/Logo.webp', window.location.href).href;
  const nivelIconUrl = new URL(nivel.iconUrl || 'pelota.webp', window.location.href).href;
  const fuegoIconUrl = new URL('fuego.webp', window.location.href).href;
  const trofeoIconUrl = new URL('trofeo.webp', window.location.href).href;
  const dueloIconUrl = new URL('liga-icon-historial.webp', window.location.href).href;

  poster.innerHTML = `
    <div class="poster-header" style="display:flex; align-items:center; gap:12px; width:100%; justify-content:center;">
      <img class="poster-logo" src="${logoHeaderUrl}" alt="Logo" style="width:38px; height:38px; border-radius:10px; border:1.5px solid var(--accent-color); object-fit:cover;">
      <div class="poster-header-text" style="display:flex; flex-direction:column; text-align:left;">
        <div class="poster-title" style="font-size:1.15rem; font-weight:900; letter-spacing:1.5px; color:#ffffff; text-transform:uppercase;">Estadios Virtuales</div>
        <div class="poster-subtitle" style="font-size:0.65rem; font-weight:800; letter-spacing:2px; color:var(--accent-color); text-transform:uppercase;">El mundo desde el aire</div>
      </div>
    </div>

    <div class="poster-card-wrapper" style="position:relative; display:flex; justify-content:center; align-items:center; margin:6px 0; width:100%; height:455px;">
      <div id="poster-card-clone-container" style="z-index:5;"></div>
    </div>

    <div class="poster-stats-badges">
      <div class="poster-badge">
        <img src="${nivelIconUrl}" class="poster-badge-icon icon-poster-rango" alt="Nivel">
        <div class="poster-badge-text-group">
          <span class="poster-badge-title">${nivel.nombre.replace(/\s+Lvl\s+\d+/i, '')}</span>
          <span class="poster-badge-sub sub-lvl">Nivel ${nivelIdx}</span>
        </div>
      </div>
      <div class="poster-badge">
        <img src="${fuegoIconUrl}" class="poster-badge-icon icon-poster-racha" alt="Racha">
        <div class="poster-badge-text-group">
          <span class="poster-badge-title">${racha} Días</span>
          <span class="poster-badge-sub sub-streak">Racha</span>
        </div>
      </div>
      <div class="poster-badge">
        <img src="${trofeoIconUrl}" class="poster-badge-icon icon-poster-victorias" alt="Victorias">
        <div class="poster-badge-text-group">
          <span class="poster-badge-title">${victorias} PG</span>
          <span class="poster-badge-sub sub-wins">Victorias</span>
        </div>
      </div>
    </div>

    <div class="poster-footer-cta">
      <img class="poster-qr" src="${qrApiUrl}" alt="QR">
      <div class="poster-cta-text">
        <strong>¿Te animás a ganarme?</strong>
        <span>Escaneá el QR y desafiame en vivo.</span>
      </div>
      <div class="poster-cta-duel">
        <img src="${dueloIconUrl}" alt="Duelo 1v1" class="poster-duel-img">
      </div>
    </div>
  `;

  document.body.appendChild(poster);

  const cardClone = cardElement.cloneNode(true);
  cardClone.id = "fut-card-clone";
  cardClone.style.transform = 'scale(1.16)';
  cardClone.style.transformOrigin = 'center center';
  cardClone.style.margin = '0';
  poster.querySelector('#poster-card-clone-container').appendChild(cardClone);

  try {
    const allImages = Array.from(poster.querySelectorAll('img'));
    await Promise.all(allImages.map(async (img) => {
      const rawSrc = img.getAttribute('src') || img.src;
      const b64 = await urlABase64Seguro(rawSrc);
      img.src = b64;
      img.removeAttribute('srcset');
      img.removeAttribute('crossorigin');
      img.removeAttribute('loading');
      img.removeAttribute('referrerpolicy');

      if (img.decode) {
        try { await img.decode(); } catch (e) {}
      } else if (!img.complete) {
        await new Promise(res => { img.onload = res; img.onerror = res; });
      }
    }));

    await new Promise(r => setTimeout(r, 200));

    const dataUrl = await htmlToImage.toJpeg(poster, {
      quality: 0.95,
      pixelRatio: 2.2,
      backgroundColor: '#090e15',
      width: 450,
      height: 800
    });

    poster.remove();

    const triggerDownload = () => {
      const link = document.createElement('a');
      link.download = `carta-fut-${customNick.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (typeof showToast === 'function') showToast("¡Póster descargado con éxito! 🏆", "ph-check-circle", "success");
    };

    const esMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (esMobile && navigator.canShare) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'mi-carta-estadiosvirtuales.jpg', { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Mi Carta en Estadios Virtuales ⚽',
            text: `🏆 ¡Mirá mi carta de Estadios Virtuales! ¿Podés ganarme en un 1v1? 🌍⚽`
          });
          if (typeof showToast === 'function') showToast("¡Listo para compartir!", "ph-share-network", "success");
          return;
        }
      } catch (shareErr) {}
    }

    triggerDownload();
  } catch (error) {
    if (poster && poster.parentNode) poster.remove();
    if (typeof showToast === 'function') showToast("Error al generar la imagen. Intentá de nuevo.", "ph-warning-circle", "danger");
  }
}