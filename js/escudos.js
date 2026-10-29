// ========================================================
// 🛡️ ESTADIOSVIRTUALES.COM - MÓDULO: ESCUDOS Y BANDERAS
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

  // 🇦🇷 ARGENTINA (Clubes a WebP)
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
  'arg_gimnasiatirosalta': URL_BASE + 'GYT.webp',
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
  'eng_everton': URL_BASE + 'Everton.webp',
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
  'chi_everton': 'https://upload.wikimedia.org/wikipedia/commons/1/17/Everton_De_Vi%C3%B1a_Del_Mar.png',
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
  'por_vitoria': URL_BASE + 'Vitoria.webp',
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
  'ned_telstar': URL_BASE + 'telstar.webp',

  // 🇲🇽 MÉXICO (LIGA MX)
  'mex_america': URL_BASE + 'america1.webp',
  'mex_chivas': URL_BASE + 'guadalajara.webp',
  'mex_cruzazul': URL_BASE + 'cruzazul.webp',
  'mex_pumas': URL_BASE + 'pumas.webp',
  'mex_tigres': URL_BASE + 'tigres.webp',
  'mex_monterrey': URL_BASE + 'monterrey.webp',
  'mex_toluca': URL_BASE + 'toluca.webp',
  'mex_pachuca': URL_BASE + 'pachuca.webp',
  'mex_santos': URL_BASE + 'santos_laguna_oficial.webp?v=2',
  'mex_leon': URL_BASE + 'leon.webp',
  'mex_atlas': URL_BASE + 'atlas.webp',
  'mex_tijuana': URL_BASE + 'tijuana.webp',
  'mex_puebla': URL_BASE + 'puebla.webp',
  'mex_necaxa': URL_BASE + 'necaxa.webp',
  'mex_sanluis': URL_BASE + 'atleticosl.webp',
  'mex_juarez': URL_BASE + 'juarez.webp',
  'mex_queretaro': URL_BASE + 'queretaro.webp',
  'mex_atlante': URL_BASE + 'Atlante_FC_2022_Logo.svg.webp',

  // 🇺🇸 ESTADOS UNIDOS / MLS (30 Clubes)
  'usa_atlantaunited': URL_BASE + 'atlanta.webp',
  'usa_atlanta': URL_BASE + 'atlanta.webp',
  'usa_charlotte': URL_BASE + 'charlotte.webp',
  'usa_chicagofire': URL_BASE + 'chicagofire.webp',
  'usa_montreal': URL_BASE + 'montreal.webp',
  'usa_dcunited': URL_BASE + 'dcunited.webp',
  'usa_cincinnati': URL_BASE + 'cincinnati.webp',
  'usa_intermiami': URL_BASE + 'intermiami.webp',
  'usa_nashville': URL_BASE + 'nashville.webp',
  'usa_newengland': URL_BASE + 'newengland.webp',
  'usa_newyorkcity': URL_BASE + 'newyorkcity.webp',
  'usa_newyork': URL_BASE + 'newyork.webp',
  'usa_orlandocity': URL_BASE + 'orlandocity.webp',
  'usa_philadelphia': URL_BASE + 'philadelphia.webp',
  'usa_toronto': URL_BASE + 'toronto.webp',
  'usa_columbus': URL_BASE + 'columbus.webp',
  'usa_austinfc': URL_BASE + 'austin.webp',
  'usa_austin': URL_BASE + 'austin.webp',
  'usa_colorado': URL_BASE + 'colorado.webp',
  'usa_dallas': URL_BASE + 'dallas.webp',
  'usa_houstondynamo': URL_BASE + 'houstondynamo.webp',
  'usa_lagalaxy': URL_BASE + 'losangelesgalaxy.webp',
  'usa_lafc': URL_BASE + 'losangeles.webp',
  'usa_minnesota': URL_BASE + 'minnesota.webp',
  'usa_portland': URL_BASE + 'portland.webp',
  'usa_realsaltlake': URL_BASE + 'realstaltlake.webp',
  'usa_saltlake': URL_BASE + 'realstaltlake.webp',
  'usa_sandiego': URL_BASE + 'sandiego.webp',
  'usa_sanjose': URL_BASE + 'sanjose.webp',
  'usa_seattle': URL_BASE + 'seattle.webp',
  'usa_kansascity': URL_BASE + 'kansascity.webp',
  'usa_stlouiscity': URL_BASE + 'st_louis_city.webp',
  'usa_vancouver': URL_BASE + 'vancouver.webp'
};

const BANDERAS_LISTA = [
    { id: 'ev', label: 'Estadios Virt.', cat: 'paises' },
    // PAÍSES
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

    // ARGENTINA (66 Clubes exactos del catálogo)
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

    // BRASIL (Nombres exactos de tu catálogo)
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

    // COLOMBIA (Liga BetPlay)
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

    // ESPAÑA (Nombres exactos de tu catálogo)
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

    // INGLATERRA (Nombres exactos de tu catálogo)
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

    // ITALIA (Nombres exactos de tu catálogo)
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

    // 🇨🇱 CHILE
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

    // 🇫🇷 FRANCIA
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

    // 🇩🇪 ALEMANIA
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

    // 🇵🇹 PORTUGAL
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

    // 🇳🇱 PAÍSES BAJOS
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
    { id: 'ned_telstar', label: 'Telstar', cat: 'ned' },

    // 🇲🇽 MÉXICO (LIGA MX)
    { id: 'mex_america', label: 'Club América', cat: 'mex' },
    { id: 'mex_chivas', label: 'Chivas Guadalajara', cat: 'mex' },
    { id: 'mex_cruzazul', label: 'Cruz Azul', cat: 'mex' },
    { id: 'mex_pumas', label: 'Pumas UNAM', cat: 'mex' },
    { id: 'mex_tigres', label: 'Tigres UANL', cat: 'mex' },
    { id: 'mex_monterrey', label: 'CF Monterrey', cat: 'mex' },
    { id: 'mex_toluca', label: 'Toluca', cat: 'mex' },
    { id: 'mex_pachuca', label: 'Pachuca', cat: 'mex' },
    { id: 'mex_santos', label: 'Santos Laguna', cat: 'mex' },
    { id: 'mex_leon', label: 'Club León', cat: 'mex' },
    { id: 'mex_atlas', label: 'Atlas', cat: 'mex' },
    { id: 'mex_tijuana', label: 'Club Tijuana', cat: 'mex' },
    { id: 'mex_puebla', label: 'Puebla', cat: 'mex' },
    { id: 'mex_necaxa', label: 'Necaxa', cat: 'mex' },
    { id: 'mex_sanluis', label: 'Atlético San Luis', cat: 'mex' },
    { id: 'mex_juarez', label: 'FC Juárez', cat: 'mex' },
    { id: 'mex_queretaro', label: 'Querétaro', cat: 'mex' },
    { id: 'mex_atlante', label: 'Atlante', cat: 'mex' },

    // ESTADOS UNIDOS / CANADÁ - MLS (30 Clubes)
    { id: 'usa_atlantaunited', label: 'Atlanta United FC', cat: 'usa' },
    { id: 'usa_charlotte', label: 'Charlotte FC', cat: 'usa' },
    { id: 'usa_chicagofire', label: 'Chicago Fire FC', cat: 'usa' },
    { id: 'usa_montreal', label: 'CF Montréal', cat: 'usa' },
    { id: 'usa_dcunited', label: 'D.C. United', cat: 'usa' },
    { id: 'usa_cincinnati', label: 'FC Cincinnati', cat: 'usa' },
    { id: 'usa_intermiami', label: 'Inter Miami CF', cat: 'usa' },
    { id: 'usa_nashville', label: 'Nashville SC', cat: 'usa' },
    { id: 'usa_newengland', label: 'New England Revolution', cat: 'usa' },
    { id: 'usa_newyorkcity', label: 'New York City FC', cat: 'usa' },
    { id: 'usa_newyork', label: 'New York Red Bulls', cat: 'usa' },
    { id: 'usa_orlandocity', label: 'Orlando City SC', cat: 'usa' },
    { id: 'usa_philadelphia', label: 'Philadelphia Union', cat: 'usa' },
    { id: 'usa_toronto', label: 'Toronto FC', cat: 'usa' },
    { id: 'usa_columbus', label: 'Columbus Crew', cat: 'usa' },
    { id: 'usa_austinfc', label: 'Austin FC', cat: 'usa' },
    { id: 'usa_colorado', label: 'Colorado Rapids', cat: 'usa' },
    { id: 'usa_dallas', label: 'FC Dallas', cat: 'usa' },
    { id: 'usa_houstondynamo', label: 'Houston Dynamo FC', cat: 'usa' },
    { id: 'usa_lagalaxy', label: 'LA Galaxy', cat: 'usa' },
    { id: 'usa_lafc', label: 'LAFC (Los Angeles Football Club)', cat: 'usa' },
    { id: 'usa_minnesota', label: 'Minnesota United FC', cat: 'usa' },
    { id: 'usa_portland', label: 'Portland Timbers', cat: 'usa' },
    { id: 'usa_realsaltlake', label: 'Real Salt Lake', cat: 'usa' },
    { id: 'usa_sandiego', label: 'San Diego FC', cat: 'usa' },
    { id: 'usa_sanjose', label: 'San Jose Earthquakes', cat: 'usa' },
    { id: 'usa_seattle', label: 'Seattle Sounders FC', cat: 'usa' },
    { id: 'usa_kansascity', label: 'Sporting Kansas City', cat: 'usa' },
    { id: 'usa_stlouiscity', label: 'St. Louis CITY SC', cat: 'usa' },
    { id: 'usa_vancouver', label: 'Vancouver Whitecaps FC', cat: 'usa' }
];

function obtenerUrlEscudo(id) {
    const aWebp = (url) => (!url || url.includes('flagcdn.com') || url.includes('wikimedia.org')) ? url : url.replace(/\.png$/i, '.webp');

    if (!id || id === 'ev') return aWebp(ESCUDOS_MAP['ev']);
    
    // 1. Memoria persistente: si ya se resolvió antes, no espera a Supabase en el F5
    const cached = localStorage.getItem('ev_escudo_url_' + id);
    if (cached) {
        const cLow = cached.toLowerCase();
        const esClub = id.startsWith('mex_') || id.startsWith('usa_');
        // 🛡️ Limpieza anti-contaminación: si se guardó por error un escudo de federación o URL desactualizada para un club
        if (esClub && (cLow.endsWith('mexico.webp') || cLow.endsWith('mexico.png') || cLow.endsWith('usa.webp') || cLow.endsWith('usa.png') || cLow.endsWith('canada.webp') || cLow.endsWith('canada.png') || cLow.includes('austinfc') || cLow.includes('atlantaunited') || (cLow.includes('realsaltlake') && !cLow.includes('realstaltlake')))) {
            localStorage.removeItem('ev_escudo_url_' + id);
        } else {
            const urlFinal = aWebp(cached);
            ESCUDOS_MAP[id] = urlFinal;
            return urlFinal;
        }
    }

    if (ESCUDOS_MAP[id]) {
        const urlMap = ESCUDOS_MAP[id];
        const urlMapLow = (urlMap || '').toLowerCase();
        const esClub = id.startsWith('mex_') || id.startsWith('usa_');
        if (!esClub || (!urlMapLow.endsWith('mexico.webp') && !urlMapLow.endsWith('usa.webp') && !urlMapLow.endsWith('canada.webp'))) {
            return aWebp(urlMap);
        }
    }

    // 2. Si es un club, buscar en catalogoGlobal limpiando tildes y caracteres especiales
    if (typeof catalogoGlobal !== 'undefined' && catalogoGlobal && catalogoGlobal.length > 0) {
        const item = BANDERAS_LISTA.find(b => b.id === id);
        if (item && item.cat !== 'paises') {
            const limpiar = (txt) => (txt || '')
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "")
                .trim();

            const nombreBuscado = limpiar(item.label);

            const encontrado = catalogoGlobal.find(f => {
                const gid = String(bscarPropiedad(f, 'GID') || '').trim();
                // 🛡️ IMPORTANTE: Ignorar sedes del Mundial (879164460) para escudos de clubes (usan escudo de federación)
                if (gid === '879164460') return false;
                const clubDb = limpiar(bscarPropiedad(f, 'Club'));
                return clubDb === nombreBuscado;
            });

            if (encontrado) {
                const foto = bscarPropiedad(encontrado, 'Foto');
                if (foto && foto.trim()) {
                    const urlLimpia = aWebp(foto.trim());
                    const urlLimpiaLow = urlLimpia.toLowerCase();
                    if (!urlLimpiaLow.endsWith('mexico.webp') && !urlLimpiaLow.endsWith('usa.webp') && !urlLimpiaLow.endsWith('canada.webp')) {
                        ESCUDOS_MAP[id] = urlLimpia;
                        localStorage.setItem('ev_escudo_url_' + id, urlLimpia);
                        return urlLimpia;
                    }
                }
            }
        }
    }

    // 3. Diccionario oficial de respaldo y guardado en memoria RAM
    const fallbackUrl = aWebp(ESCUDOS_MAP[id] || ESCUDOS_MAP['ev']);
    ESCUDOS_MAP[id] = fallbackUrl;
    return fallbackUrl;
}

let categoriaEscudosActual = 'todos';

window.desplazarTabsEscudos = function(desplazamiento) {
    const bar = document.getElementById('escudos-tabs-bar');
    if (bar) {
        bar.scrollBy({ left: desplazamiento, behavior: 'smooth' });
    }
};

window.abrirModalSelectorEscudo = function() {
    const m = document.getElementById('selector-escudos-modal');
    if (!m) return;
    m.style.display = 'flex';
    const input = document.getElementById('buscador-escudos');
    if (input) input.value = '';
    renderizarEscudosGrid(BANDERAS_LISTA);
};

window.cerrarModalSelectorEscudo = function() {
    const m = document.getElementById('selector-escudos-modal');
    if (m) m.style.display = 'none';
    selectorEscudoParaOnceActivo = false;
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
        const fond = item.id === 'ev' 
            ? 'linear-gradient(135deg, #0f1419, #1a2233)' 
            : obtenerFondoClub(item.label, item.label);

        return `
        <div class="escudo-card-item ${isSel ? 'selected' : ''}" style="background: ${fond};" onclick="seleccionarEscudoDirecto('${item.id}')">
            <img src="${urlImg}" alt="${item.label}" referrerpolicy="no-referrer" onerror="this.src='${ESCUDOS_MAP['ev']}';">
            <span>${item.label}</span>
        </div>`;
    }).join('');
}

let selectorEscudoParaOnceActivo = false;

window.abrirSelectorEscudoParaOnce = function() {
    selectorEscudoParaOnceActivo = true;
    const modalEscudos = document.getElementById('selector-escudos-modal');
    if (modalEscudos) modalEscudos.style.zIndex = '10055';
    abrirModalSelectorEscudo();
};

window.seleccionarEscudoDirecto = function(id) {
    const urlFinal = obtenerUrlEscudo(id);

    if (selectorEscudoParaOnceActivo) {
        selectorEscudoParaOnceActivo = false;
        userStats.onceEscudo = id;
        localStorage.setItem('ev_once_escudo_' + getUserId(), id);
        guardarStats();
        renderizarOnceInicial();
        cerrarModalSelectorEscudo();
        showToast("¡Escudo del club actualizado! 🛡️", "ph-shield-check", "success");
        return;
    }

    const input = document.getElementById('avatar-logo-input');
    const preview = document.getElementById('avatar-logo-preview');
    const futClub = document.getElementById('fut-club-display');

    if (input) input.value = id;
    if (preview) preview.src = urlFinal;
    if (futClub) {
        futClub.src = urlFinal;
        futClub.setAttribute('referrerpolicy', 'no-referrer');
    }

    setPref('ev_avatar_logo', id);
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


// Exposición global explícita para compatibilidad total
window.URL_BASE = URL_BASE;
window.ESCUDOS_MAP = ESCUDOS_MAP;
window.BANDERAS_LISTA = BANDERAS_LISTA;
window.obtenerUrlEscudo = obtenerUrlEscudo;
window.obtenerNombreBandera = obtenerNombreBandera;
window.renderizarEscudosGrid = renderizarEscudosGrid;
