import type { Species, Watershed } from '../types';

/**
 * Demo fauna catalogue. Taxa are real invasive alien animals present in
 * Catalonia, but dates, scores, legal flags and every occurrence derived from
 * this file are illustrative values for the MVP — not the official EXOCAT data.
 */
export interface SpeciesSeed extends Species {
  /** Relative number of records to generate. */
  abundance: number;
  /** Weighted watershed affinity; 'all' spreads records evenly. */
  basins: Partial<Record<Watershed, number>> | 'all';
}

const LOWLAND_RIVERS: Partial<Record<Watershed, number>> = {
  Ebre: 4, Segre: 3, Llobregat: 3, Ter: 3, Besòs: 2, Fluvià: 1, Muga: 1, Tordera: 1, Francolí: 1,
};
const URBAN: Partial<Record<Watershed, number>> = {
  Besòs: 5, Llobregat: 5, Foix: 2, Tordera: 2, Ter: 2, Francolí: 2, Segre: 1,
};

export const SPECIES_SEED: SpeciesSeed[] = [
  // ——— Fish ———
  {
    id: 'silurus-glanis', scientificName: 'Silurus glanis', group: 'Fish', family: 'Siluridae',
    commonNames: { ca: 'Silur', es: 'Siluro', en: 'Wels catfish' },
    origin: 'centralEurope', pathway: 'angling', firstRecord: 1974, risk: 'high', riskScore: 89,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 5, basins: { Ebre: 6, Segre: 4, Ter: 2, 'Noguera Ribagorçana': 1 },
    description: {
      en: 'Apex predator reaching over 2 m that preys on native fish, waterbirds and amphibians in reservoirs and large rivers.',
      ca: 'Depredador apical que supera els 2 m i s’alimenta de peixos autòctons, ocells aquàtics i amfibis en embassaments i grans rius.',
      es: 'Superdepredador que supera los 2 m y se alimenta de peces autóctonos, aves acuáticas y anfibios en embalses y grandes ríos.',
    },
    management: {
      en: 'Targeted removal programmes; prohibit release of caught individuals.',
      ca: 'Programes d’extracció dirigida; prohibició de retornar a l’aigua els exemplars capturats.',
      es: 'Programas de extracción dirigida; prohibición de devolver al agua los ejemplares capturados.',
    },
  },
  {
    id: 'gambusia-holbrooki', scientificName: 'Gambusia holbrooki', group: 'Fish', family: 'Poeciliidae',
    commonNames: { ca: 'Gambúsia', es: 'Gambusia', en: 'Eastern mosquitofish' },
    origin: 'northAmerica', pathway: 'mosquitoControl', firstRecord: 1921, risk: 'high', riskScore: 85,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 6, basins: LOWLAND_RIVERS,
    description: {
      en: 'Small aggressive fish that outcompetes endangered native toothcarps such as Aphanius iberus.',
      ca: 'Peix petit i agressiu que desplaça ciprinodòntids autòctons amenaçats com el fartet (Aphanius iberus).',
      es: 'Pez pequeño y agresivo que desplaza a ciprinodóntidos autóctonos amenazados como el fartet (Aphanius iberus).',
    },
    management: {
      en: 'Drying and refilling of small ponds; reintroduction of native fish after removal.',
      ca: 'Assecat i reompliment de basses petites; reintroducció de peixos autòctons després de l’eliminació.',
      es: 'Secado y rellenado de balsas pequeñas; reintroducción de peces autóctonos tras la eliminación.',
    },
  },
  {
    id: 'lepomis-gibbosus', scientificName: 'Lepomis gibbosus', group: 'Fish', family: 'Centrarchidae',
    commonNames: { ca: 'Peix sol', es: 'Pez sol', en: 'Pumpkinseed' },
    origin: 'northAmerica', pathway: 'angling', firstRecord: 1910, risk: 'medium', riskScore: 66,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 4, basins: LOWLAND_RIVERS,
    description: {
      en: 'Sunfish that feeds on invertebrates and the eggs of native fish and amphibians.',
      ca: 'Peix que s’alimenta d’invertebrats i d’ous de peixos i amfibis autòctons.',
      es: 'Pez que se alimenta de invertebrados y de huevos de peces y anfibios autóctonos.',
    },
    management: {
      en: 'Electrofishing and netting in priority conservation ponds.',
      ca: 'Pesca elèctrica i amb xarxes en basses prioritàries per a la conservació.',
      es: 'Pesca eléctrica y con redes en balsas prioritarias para la conservación.',
    },
  },
  {
    id: 'micropterus-salmoides', scientificName: 'Micropterus salmoides', group: 'Fish', family: 'Centrarchidae',
    commonNames: { ca: 'Perca americana', es: 'Black bass', en: 'Largemouth bass' },
    origin: 'northAmerica', pathway: 'angling', firstRecord: 1955, risk: 'high', riskScore: 80,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 4, basins: { Ebre: 3, Segre: 3, Llobregat: 2, Ter: 2, Tordera: 1 },
    description: {
      en: 'Voracious predator in reservoirs that reduces native fish and amphibian populations.',
      ca: 'Depredador voraç d’embassaments que redueix les poblacions de peixos i amfibis autòctons.',
      es: 'Depredador voraz de embalses que reduce las poblaciones de peces y anfibios autóctonos.',
    },
    management: {
      en: 'Removal campaigns and angling regulations that forbid catch-and-release.',
      ca: 'Campanyes d’extracció i normativa de pesca que prohibeix la captura i solta.',
      es: 'Campañas de extracción y normativa de pesca que prohíbe la captura y suelta.',
    },
  },
  {
    id: 'alburnus-alburnus', scientificName: 'Alburnus alburnus', group: 'Fish', family: 'Leuciscidae',
    commonNames: { ca: 'Alburn', es: 'Alburno', en: 'Bleak' },
    origin: 'centralEurope', pathway: 'liveBait', firstRecord: 1992, risk: 'medium', riskScore: 62,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 4, basins: { Ebre: 4, Segre: 3, Llobregat: 2, Ter: 2 },
    description: {
      en: 'Shoaling fish that hybridises with and competes against native cyprinids.',
      ca: 'Peix gregari que s’hibrida i competeix amb els ciprínids autòctons.',
      es: 'Pez gregario que se hibrida y compite con los ciprínidos autóctonos.',
    },
    management: {
      en: 'Ban on live-bait use; monitoring of headwater expansion.',
      ca: 'Prohibició de l’esquer viu; seguiment de l’expansió cap a les capçaleres.',
      es: 'Prohibición del cebo vivo; seguimiento de la expansión hacia las cabeceras.',
    },
  },

  {
    id: 'sander-lucioperca', scientificName: 'Sander lucioperca', group: 'Fish', family: 'Percidae',
    commonNames: { ca: 'Lucioperca', es: 'Lucioperca', en: 'Zander' },
    origin: 'centralEurope', pathway: 'angling', firstRecord: 1975, risk: 'high', riskScore: 82,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 3, basins: { Ebre: 4, Segre: 3, Muga: 2, Ter: 2 },
    description: {
      en: 'Large piscivorous perch stocked in reservoirs; preys heavily on native cyprinids such as barbels and nases.',
      ca: 'Pèrcid piscívor de grans dimensions alliberat en embassaments; depreda intensament ciprínids autòctons com barbs i madrilles.',
      es: 'Pércido piscívoro de gran tamaño soltado en embalses; depreda intensamente ciprínidos autóctonos como barbos y madrillas.',
    },
    management: {
      en: 'Intensive angling without catch limits and monitoring of spread to upstream reaches.',
      ca: 'Pesca intensiva sense límit de captures i seguiment de l’expansió aigües amunt.',
      es: 'Pesca intensiva sin cupo de capturas y seguimiento de la expansión aguas arriba.',
    },
  },
  {
    id: 'ameiurus-melas', scientificName: 'Ameiurus melas', group: 'Fish', family: 'Ictaluridae',
    commonNames: { ca: 'Peix gat', es: 'Pez gato negro', en: 'Black bullhead' },
    origin: 'northAmerica', pathway: 'angling', firstRecord: 1910, risk: 'medium', riskScore: 63,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 3, basins: { Ter: 4, Fluvià: 2, Llobregat: 2, Ebre: 2, Muga: 1 },
    description: {
      en: 'Hardy bottom-dwelling catfish tolerant of poor water quality; feeds on invertebrates, eggs and small fish.',
      ca: 'Silúrid de fons molt resistent a la mala qualitat de l’aigua; s’alimenta d’invertebrats, ous i peixos petits.',
      es: 'Siluriforme de fondo muy resistente a la mala calidad del agua; se alimenta de invertebrados, huevos y peces pequeños.',
    },
    management: {
      en: 'Netting and trapping in lakes and ponds of conservation interest.',
      ca: 'Captura amb xarxes i nanses en estanys i basses d’interès per a la conservació.',
      es: 'Captura con redes y nasas en lagos y balsas de interés para la conservación.',
    },
  },
  {
    id: 'esox-lucius', scientificName: 'Esox lucius', group: 'Fish', family: 'Esocidae',
    commonNames: { ca: 'Lluç de riu', es: 'Lucio', en: 'Northern pike' },
    origin: 'centralEurope', pathway: 'angling', firstRecord: 1950, risk: 'high', riskScore: 78,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 3, basins: { Ebre: 4, Segre: 3, 'Noguera Ribagorçana': 1, Llobregat: 1 },
    description: {
      en: 'Ambush predator of slow waters and reservoirs that feeds on native fish, amphibians and waterbird chicks.',
      ca: 'Depredador a l’aguait d’aigües lentes i embassaments que s’alimenta de peixos autòctons, amfibis i polls d’ocells aquàtics.',
      es: 'Depredador al acecho de aguas lentas y embalses que se alimenta de peces autóctonos, anfibios y pollos de aves acuáticas.',
    },
    management: {
      en: 'Ban on stocking and transfers between basins; selective removal in sensitive stretches.',
      ca: 'Prohibició de repoblacions i trasllats entre conques; extracció selectiva en trams sensibles.',
      es: 'Prohibición de repoblaciones y traslados entre cuencas; extracción selectiva en tramos sensibles.',
    },
  },
  {
    id: 'pseudorasbora-parva', scientificName: 'Pseudorasbora parva', group: 'Fish', family: 'Gobionidae',
    commonNames: { ca: 'Pseudorasbora', es: 'Pseudorasbora', en: 'Topmouth gudgeon' },
    origin: 'eastAsia', pathway: 'aquaculture', firstRecord: 2001, risk: 'medium', riskScore: 71,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 2, basins: { Ebre: 4, Segre: 2, Llobregat: 1, Ter: 1 },
    description: {
      en: 'Small fish spread as a contaminant of fish stocks; carries the parasite Sphaerothecum destruens, lethal to native cyprinids.',
      ca: 'Peix petit dispersat com a contaminant de lots de peixos; transporta el paràsit Sphaerothecum destruens, letal per als ciprínids autòctons.',
      es: 'Pez pequeño dispersado como contaminante de lotes de peces; transporta el parásito Sphaerothecum destruens, letal para los ciprínidos autóctonos.',
    },
    management: {
      en: 'Biosecurity checks on fish transfers and eradication in isolated ponds.',
      ca: 'Controls de bioseguretat en els trasllats de peixos i eradicació en basses aïllades.',
      es: 'Controles de bioseguridad en los traslados de peces y erradicación en balsas aisladas.',
    },
  },

  // ——— Invertebrates ———
  {
    id: 'pomacea-maculata', scientificName: 'Pomacea maculata', group: 'Invertebrates', family: 'Ampullariidae',
    commonNames: { ca: 'Cargol poma', es: 'Caracol manzana', en: 'Island apple snail' },
    origin: 'southAmerica', pathway: 'aquariumTrade', firstRecord: 2009, risk: 'high', riskScore: 91,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 4, basins: { Ebre: 9 },
    description: {
      en: 'Large freshwater snail that devours rice seedlings and aquatic plants; established in the Ebro Delta rice fields.',
      ca: 'Cargol d’aigua dolça de grans dimensions que devora plançons d’arròs i plantes aquàtiques; establert als arrossars del delta de l’Ebre.',
      es: 'Caracol de agua dulce de gran tamaño que devora plántulas de arroz y plantas acuáticas; establecido en los arrozales del delta del Ebro.',
    },
    management: {
      en: 'Field flooding with seawater, egg-mass removal and strict controls on moving machinery between fields.',
      ca: 'Inundació de camps amb aigua de mar, retirada de postes i controls estrictes del moviment de maquinària entre camps.',
      es: 'Inundación de campos con agua de mar, retirada de puestas y controles estrictos del movimiento de maquinaria entre campos.',
    },
  },
  {
    id: 'pacifastacus-leniusculus', scientificName: 'Pacifastacus leniusculus', group: 'Invertebrates', family: 'Astacidae',
    commonNames: { ca: 'Cranc senyal', es: 'Cangrejo señal', en: 'Signal crayfish' },
    origin: 'northAmerica', pathway: 'aquaculture', firstRecord: 1985, risk: 'high', riskScore: 88,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 3, basins: { Garona: 3, 'Noguera Pallaresa': 3, Segre: 2, 'Noguera Ribagorçana': 2, Ter: 1 },
    description: {
      en: 'Crayfish of cold mountain rivers that carries crayfish plague and displaces the native white-clawed crayfish.',
      ca: 'Cranc de rius freds de muntanya, portador de l’afanomicosi, que desplaça el cranc de riu autòcton.',
      es: 'Cangrejo de ríos fríos de montaña, portador de la afanomicosis, que desplaza al cangrejo de río autóctono.',
    },
    management: {
      en: 'Intensive trapping and barriers that keep it out of the last native crayfish streams.',
      ca: 'Trampeig intensiu i barreres que l’allunyen dels darrers torrents amb cranc autòcton.',
      es: 'Trampeo intensivo y barreras que lo alejan de los últimos arroyos con cangrejo autóctono.',
    },
  },
  {
    id: 'linepithema-humile', scientificName: 'Linepithema humile', group: 'Invertebrates', family: 'Formicidae',
    commonNames: { ca: 'Formiga argentina', es: 'Hormiga argentina', en: 'Argentine ant' },
    origin: 'southAmerica', pathway: 'ornamentalTrade', firstRecord: 1923, risk: 'high', riskScore: 80,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 6, basins: { ...URBAN, Muga: 2, Fluvià: 2 },
    description: {
      en: 'Ant forming vast cooperative supercolonies that eliminate native ants and disrupt seed dispersal.',
      ca: 'Formiga que forma enormes supercolònies cooperatives, elimina les formigues autòctones i altera la dispersió de llavors.',
      es: 'Hormiga que forma enormes supercolonias cooperativas, elimina las hormigas autóctonas y altera la dispersión de semillas.',
    },
    management: {
      en: 'Bait-based control around high-value natural areas and checks on nursery plant shipments.',
      ca: 'Control amb esquers al voltant d’espais naturals d’alt valor i inspecció dels enviaments de vivers.',
      es: 'Control con cebos alrededor de espacios naturales de alto valor e inspección de los envíos de viveros.',
    },
  },
  {
    id: 'paysandisia-archon', scientificName: 'Paysandisia archon', group: 'Invertebrates', family: 'Castniidae',
    commonNames: { ca: 'Papallona de les palmeres', es: 'Polilla de las palmeras', en: 'Palm borer moth' },
    origin: 'southAmerica', pathway: 'palmTrade', firstRecord: 2001, risk: 'medium', riskScore: 67,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 3, basins: { Muga: 2, Fluvià: 2, Ter: 2, Tordera: 2, Besòs: 2, Llobregat: 1 },
    description: {
      en: 'Day-flying moth whose larvae tunnel into palms, including the native dwarf fan palm (Chamaerops humilis).',
      ca: 'Papallona diürna les larves de la qual excaven galeries a les palmeres, inclòs el margalló autòcton (Chamaerops humilis).',
      es: 'Mariposa diurna cuyas larvas excavan galerías en las palmeras, incluido el palmito autóctono (Chamaerops humilis).',
    },
    management: {
      en: 'Preventive treatments in nurseries and gardens; removal of heavily infested palms.',
      ca: 'Tractaments preventius en vivers i jardins; retirada de les palmeres molt afectades.',
      es: 'Tratamientos preventivos en viveros y jardines; retirada de las palmeras muy afectadas.',
    },
  },
  {
    id: 'vespa-velutina', scientificName: 'Vespa velutina', group: 'Invertebrates', family: 'Vespidae',
    commonNames: { ca: 'Vespa asiàtica', es: 'Avispa asiática', en: 'Asian hornet' },
    origin: 'seAsia', pathway: 'cargoStowaway', firstRecord: 2012, risk: 'high', riskScore: 90,
    habitats: ['terrestrial'], legal: { eu: true, spain: true }, abundance: 8, basins: { Muga: 4, Fluvià: 4, Ter: 5, Tordera: 3, Besòs: 2, Llobregat: 2, Garona: 2 },
    description: {
      en: 'Predatory hornet that hunts honeybees and wild pollinators; spreading rapidly south from the Pyrenees.',
      ca: 'Vespa depredadora que caça abelles de la mel i pol·linitzadors silvestres; s’expandeix ràpidament cap al sud des dels Pirineus.',
      es: 'Avispa depredadora que caza abejas melíferas y polinizadores silvestres; se expande rápidamente hacia el sur desde los Pirineos.',
    },
    management: {
      en: 'Nest location and destruction by specialists; citizen reporting of sightings.',
      ca: 'Localització i destrucció de nius per part d’especialistes; notificació ciutadana d’observacions.',
      es: 'Localización y destrucción de nidos por especialistas; notificación ciudadana de avistamientos.',
    },
  },
  {
    id: 'procambarus-clarkii', scientificName: 'Procambarus clarkii', group: 'Invertebrates', family: 'Cambaridae',
    commonNames: { ca: 'Cranc vermell americà', es: 'Cangrejo rojo americano', en: 'Red swamp crayfish' },
    origin: 'northAmerica', pathway: 'aquaculture', firstRecord: 1978, risk: 'high', riskScore: 92,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 7, basins: LOWLAND_RIVERS,
    description: {
      en: 'Burrowing crayfish carrying crayfish plague; damages rice paddies and eliminates native crayfish.',
      ca: 'Cranc excavador portador de l’afanomicosi; malmet els arrossars i elimina el cranc de riu autòcton.',
      es: 'Cangrejo excavador portador de la afanomicosis; daña los arrozales y elimina el cangrejo de río autóctono.',
    },
    management: {
      en: 'Trapping and barriers protecting native crayfish refuges.',
      ca: 'Trampeig i barreres que protegeixen els refugis del cranc de riu autòcton.',
      es: 'Trampeo y barreras que protegen los refugios del cangrejo de río autóctono.',
    },
  },
  {
    id: 'dreissena-polymorpha', scientificName: 'Dreissena polymorpha', group: 'Invertebrates', family: 'Dreissenidae',
    commonNames: { ca: 'Musclo zebrat', es: 'Mejillón cebra', en: 'Zebra mussel' },
    origin: 'pontoCaspian', pathway: 'boatsGear', firstRecord: 2001, risk: 'high', riskScore: 93,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 4, basins: { Ebre: 6, Segre: 3, 'Noguera Ribagorçana': 1 },
    description: {
      en: 'Biofouling mussel clogging water intakes and irrigation infrastructure along the lower Ebro.',
      ca: 'Musclo incrustant que obstrueix preses d’aigua i infraestructures de reg al tram baix de l’Ebre.',
      es: 'Mejillón incrustante que obstruye tomas de agua e infraestructuras de riego en el tramo bajo del Ebro.',
    },
    management: {
      en: 'Boat disinfection stations and navigation restrictions between reservoirs.',
      ca: 'Estacions de desinfecció d’embarcacions i restriccions de navegació entre embassaments.',
      es: 'Estaciones de desinfección de embarcaciones y restricciones de navegación entre embalses.',
    },
  },
  {
    id: 'corbicula-fluminea', scientificName: 'Corbicula fluminea', group: 'Invertebrates', family: 'Cyrenidae',
    commonNames: { ca: 'Cloïssa asiàtica', es: 'Almeja asiática', en: 'Asian clam' },
    origin: 'eastAsia', pathway: 'ballast', firstRecord: 1995, risk: 'medium', riskScore: 70,
    habitats: ['freshwater'], legal: { eu: false, spain: true }, abundance: 4, basins: { Ebre: 4, Segre: 2, Llobregat: 2, Ter: 2 },
    description: {
      en: 'Clam reaching very high densities on riverbeds, competing with native freshwater mussels.',
      ca: 'Bivalve que assoleix densitats molt altes als llits fluvials i competeix amb les nàiades autòctones.',
      es: 'Bivalvo que alcanza densidades muy altas en los lechos fluviales y compite con las náyades autóctonas.',
    },
    management: {
      en: 'No effective eradication; prevention of spread to new basins is key.',
      ca: 'No hi ha eradicació eficaç; és clau evitar-ne l’expansió a noves conques.',
      es: 'No existe erradicación eficaz; es clave evitar su expansión a nuevas cuencas.',
    },
  },
  {
    id: 'aedes-albopictus', scientificName: 'Aedes albopictus', group: 'Invertebrates', family: 'Culicidae',
    commonNames: { ca: 'Mosquit tigre', es: 'Mosquito tigre', en: 'Tiger mosquito' },
    origin: 'seAsia', pathway: 'tyreTrade', firstRecord: 2004, risk: 'high', riskScore: 81,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 9, basins: URBAN,
    description: {
      en: 'Day-biting mosquito and vector of dengue, chikungunya and Zika; established in urban areas.',
      ca: 'Mosquit de picada diürna i vector del dengue, el chikungunya i el Zika; establert en zones urbanes.',
      es: 'Mosquito de picadura diurna y vector del dengue, el chikungunya y el Zika; establecido en zonas urbanas.',
    },
    management: {
      en: 'Removal of standing water in containers and larvicide treatment of drains.',
      ca: 'Eliminació d’aigua estancada en recipients i tractament larvicida d’embornals.',
      es: 'Eliminación de agua estancada en recipientes y tratamiento larvicida de imbornales.',
    },
  },
  {
    id: 'harmonia-axyridis', scientificName: 'Harmonia axyridis', group: 'Invertebrates', family: 'Coccinellidae',
    commonNames: { ca: 'Marieta asiàtica', es: 'Mariquita asiática', en: 'Harlequin ladybird' },
    origin: 'eastAsia', pathway: 'biocontrol', firstRecord: 1995, risk: 'medium', riskScore: 59,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 4, basins: 'all',
    description: {
      en: 'Ladybird that outcompetes and preys on native coccinellids; overwinters in buildings.',
      ca: 'Marieta que desplaça i depreda coccinèl·lids autòctons; hiverna dins d’edificis.',
      es: 'Mariquita que desplaza y depreda coccinélidos autóctonos; inverna dentro de edificios.',
    },
    management: {
      en: 'Discontinue commercial release; monitor native ladybird declines.',
      ca: 'Aturar-ne l’alliberament comercial; fer seguiment del declivi de les marietes autòctones.',
      es: 'Detener su suelta comercial; hacer seguimiento del declive de las mariquitas autóctonas.',
    },
  },
  {
    id: 'cydalima-perspectalis', scientificName: 'Cydalima perspectalis', group: 'Invertebrates', family: 'Crambidae',
    commonNames: { ca: 'Papallona del boix', es: 'Polilla del boj', en: 'Box tree moth' },
    origin: 'eastAsia', pathway: 'ornamentalTrade', firstRecord: 2014, risk: 'high', riskScore: 79,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 6, basins: { Garona: 3, 'Noguera Pallaresa': 3, Segre: 3, Llobregat: 3, Ter: 3, Fluvià: 2 },
    description: {
      en: 'Moth whose caterpillars defoliate wild box (Buxus sempervirens) forests across the Pre-Pyrenees.',
      ca: 'Arna les erugues de la qual defolien les boixedes silvestres (Buxus sempervirens) del Prepirineu.',
      es: 'Polilla cuyas orugas defolian los bojedales silvestres (Buxus sempervirens) del Prepirineo.',
    },
    management: {
      en: 'Bacillus thuringiensis treatments and pheromone traps in high-value stands.',
      ca: 'Tractaments amb Bacillus thuringiensis i trampes de feromones a les boixedes d’alt valor.',
      es: 'Tratamientos con Bacillus thuringiensis y trampas de feromonas en bojedales de alto valor.',
    },
  },
  {
    id: 'rhynchophorus-ferrugineus', scientificName: 'Rhynchophorus ferrugineus', group: 'Invertebrates', family: 'Curculionidae',
    commonNames: { ca: 'Morrut de les palmeres', es: 'Picudo rojo', en: 'Red palm weevil' },
    origin: 'seAsia', pathway: 'palmTrade', firstRecord: 2005, risk: 'high', riskScore: 78,
    habitats: ['terrestrial'], legal: { eu: false, spain: false }, abundance: 5, basins: { ...URBAN, Ebre: 2, Gaià: 2 },
    description: {
      en: 'Weevil whose larvae bore through palm trunks, killing ornamental and native palms.',
      ca: 'Escarabat les larves del qual perforen els troncs de les palmeres i maten exemplars ornamentals i autòctons.',
      es: 'Escarabajo cuyas larvas perforan los troncos de las palmeras y matan ejemplares ornamentales y autóctonos.',
    },
    management: {
      en: 'Preventive insecticide or nematode treatments; destruction of infested palms.',
      ca: 'Tractaments preventius amb insecticides o nematodes; destrucció de les palmeres infestades.',
      es: 'Tratamientos preventivos con insecticidas o nematodos; destrucción de las palmeras infestadas.',
    },
  },
  {
    id: 'callinectes-sapidus', scientificName: 'Callinectes sapidus', group: 'Invertebrates', family: 'Portunidae',
    commonNames: { ca: 'Cranc blau', es: 'Cangrejo azul', en: 'Atlantic blue crab' },
    origin: 'westernAtlantic', pathway: 'ballast', firstRecord: 2012, risk: 'high', riskScore: 87,
    habitats: ['marine', 'freshwater'], legal: { eu: false, spain: false }, abundance: 4, basins: { Ebre: 8, Muga: 1, Fluvià: 1 },
    description: {
      en: 'Aggressive swimming crab now abundant in the Ebro Delta lagoons, impacting fisheries and native fauna.',
      ca: 'Cranc nedador agressiu, ara abundant a les llacunes del delta de l’Ebre, amb impacte sobre la pesca i la fauna autòctona.',
      es: 'Cangrejo nadador agresivo, ahora abundante en las lagunas del delta del Ebro, con impacto en la pesca y la fauna autóctona.',
    },
    management: {
      en: 'Commercial harvesting incentives and trapping in lagoons.',
      ca: 'Incentius a la captura comercial i trampeig a les llacunes.',
      es: 'Incentivos a la captura comercial y trampeo en las lagunas.',
    },
  },

  // ——— Birds ———
  {
    id: 'myiopsitta-monachus', scientificName: 'Myiopsitta monachus', group: 'Birds', family: 'Psittacidae',
    commonNames: { ca: 'Cotorra de pit gris', es: 'Cotorra argentina', en: 'Monk parakeet' },
    origin: 'southAmerica', pathway: 'petEscapes', firstRecord: 1975, risk: 'medium', riskScore: 64,
    habitats: ['terrestrial'], legal: { eu: false, spain: true }, abundance: 5, basins: { Besòs: 5, Llobregat: 5, Foix: 2, Francolí: 1, Tordera: 1 },
    description: {
      en: 'Colonial parakeet building large communal nests in urban trees; crop damage and noise conflicts.',
      ca: 'Cotorra colonial que construeix grans nius comunals en arbres urbans; danys als conreus i conflictes per soroll.',
      es: 'Cotorra colonial que construye grandes nidos comunales en árboles urbanos; daños a cultivos y conflictos por ruido.',
    },
    management: {
      en: 'Nest removal and population control programmes in metropolitan areas.',
      ca: 'Retirada de nius i programes de control poblacional a les àrees metropolitanes.',
      es: 'Retirada de nidos y programas de control poblacional en las áreas metropolitanas.',
    },
  },
  {
    id: 'psittacula-krameri', scientificName: 'Psittacula krameri', group: 'Birds', family: 'Psittaculidae',
    commonNames: { ca: 'Cotorra de Kramer', es: 'Cotorra de Kramer', en: 'Rose-ringed parakeet' },
    origin: 'southAsiaAfrica', pathway: 'petEscapes', firstRecord: 1985, risk: 'medium', riskScore: 60,
    habitats: ['terrestrial'], legal: { eu: false, spain: true }, abundance: 3, basins: { Besòs: 4, Llobregat: 4, Tordera: 1 },
    description: {
      en: 'Cavity-nesting parakeet competing with native birds and bats for tree holes.',
      ca: 'Cotorra que nia en cavitats i competeix amb ocells i ratpenats autòctons pels forats dels arbres.',
      es: 'Cotorra que anida en cavidades y compite con aves y murciélagos autóctonos por los huecos de los árboles.',
    },
    management: {
      en: 'Capture programmes and ban on possession and trade.',
      ca: 'Programes de captura i prohibició de la tinença i el comerç.',
      es: 'Programas de captura y prohibición de la tenencia y el comercio.',
    },
  },

  {
    id: 'estrilda-astrild', scientificName: 'Estrilda astrild', group: 'Birds', family: 'Estrildidae',
    commonNames: { ca: 'Bec de corall senegalès', es: 'Pico de coral', en: 'Common waxbill' },
    origin: 'subSaharanAfrica', pathway: 'petEscapes', firstRecord: 1987, risk: 'low', riskScore: 38,
    habitats: ['terrestrial', 'freshwater'], legal: { eu: false, spain: true }, abundance: 2, basins: { Llobregat: 3, Ebre: 2, Besòs: 1, Ter: 1 },
    description: {
      en: 'Small seed-eating finch living in reedbeds and riverside grasslands; may compete with native seed-eaters.',
      ca: 'Ocell granívor petit que viu en canyissars i herbassars de ribera; pot competir amb els granívors autòctons.',
      es: 'Ave granívora pequeña que vive en carrizales y herbazales de ribera; puede competir con los granívoros autóctonos.',
    },
    management: {
      en: 'Population monitoring and enforcement of the trade ban on cage birds.',
      ca: 'Seguiment de les poblacions i compliment de la prohibició de comerç d’ocells de gàbia.',
      es: 'Seguimiento de las poblaciones y cumplimiento de la prohibición de comercio de aves de jaula.',
    },
  },
  {
    id: 'alopochen-aegyptiaca', scientificName: 'Alopochen aegyptiaca', group: 'Birds', family: 'Anatidae',
    commonNames: { ca: 'Oca egípcia', es: 'Ganso del Nilo', en: 'Egyptian goose' },
    origin: 'subSaharanAfrica', pathway: 'collectionEscapes', firstRecord: 2005, risk: 'medium', riskScore: 58,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 1, basins: { Muga: 2, Fluvià: 2, Ebre: 2, Llobregat: 1 },
    description: {
      en: 'Territorial waterfowl that aggressively displaces native ducks and waders from nesting sites.',
      ca: 'Anàtida territorial que desplaça de manera agressiva ànecs i limícoles autòctons dels llocs de nidificació.',
      es: 'Anátida territorial que desplaza de forma agresiva a patos y limícolas autóctonos de los lugares de nidificación.',
    },
    management: {
      en: 'Early removal of breeding pairs before a population establishes; control of private collections.',
      ca: 'Retirada primerenca de parelles reproductores abans que s’estableixi una població; control de col·leccions privades.',
      es: 'Retirada temprana de parejas reproductoras antes de que se establezca una población; control de colecciones privadas.',
    },
  },

  // ——— Herptiles ———
  {
    id: 'trachemys-scripta', scientificName: 'Trachemys scripta', group: 'Herptiles', family: 'Emydidae',
    commonNames: { ca: 'Tortuga de Florida', es: 'Galápago de Florida', en: 'Pond slider' },
    origin: 'northAmerica', pathway: 'petReleases', firstRecord: 1990, risk: 'high', riskScore: 77,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 5, basins: LOWLAND_RIVERS,
    description: {
      en: 'Released pet turtle competing with the native European pond turtle and Mediterranean pond turtle.',
      ca: 'Tortuga de companyia alliberada que competeix amb la tortuga d’estany i la tortuga de rierol autòctones.',
      es: 'Tortuga de compañía liberada que compite con el galápago europeo y el galápago leproso autóctonos.',
    },
    management: {
      en: 'Basking traps and public amnesty / collection points for unwanted pets.',
      ca: 'Trampes d’insolació i punts de recollida per a mascotes no desitjades.',
      es: 'Trampas de insolación y puntos de recogida para mascotas no deseadas.',
    },
  },
  {
    id: 'discoglossus-pictus', scientificName: 'Discoglossus pictus', group: 'Herptiles', family: 'Alytidae',
    commonNames: { ca: 'Granota pintada', es: 'Sapillo pintojo mediterráneo', en: 'Painted frog' },
    origin: 'northAfrica', pathway: 'accidental', firstRecord: 1906, risk: 'low', riskScore: 34,
    habitats: ['freshwater', 'terrestrial'], legal: { eu: false, spain: false }, abundance: 3, basins: { Muga: 3, Fluvià: 3, Ter: 3, Tordera: 2, Besòs: 1 },
    description: {
      en: 'Frog spreading southwards from the Roussillon through the Empordà; impacts still being assessed.',
      ca: 'Granota que s’expandeix cap al sud des del Rosselló a través de l’Empordà; els impactes encara s’estan avaluant.',
      es: 'Rana que se expande hacia el sur desde el Rosellón a través del Ampurdán; sus impactos aún se están evaluando.',
    },
    management: {
      en: 'Monitoring of range expansion and interactions with native amphibians.',
      ca: 'Seguiment de l’expansió i de les interaccions amb els amfibis autòctons.',
      es: 'Seguimiento de la expansión y de las interacciones con los anfibios autóctonos.',
    },
  },

  // ——— Mammals ———
  {
    id: 'neogale-vison', scientificName: 'Neogale vison', group: 'Mammals', family: 'Mustelidae',
    commonNames: { ca: 'Visó americà', es: 'Visón americano', en: 'American mink' },
    origin: 'northAmerica', pathway: 'furFarms', firstRecord: 1990, risk: 'high', riskScore: 86,
    habitats: ['freshwater', 'terrestrial'], legal: { eu: true, spain: true }, abundance: 2, basins: { Ter: 3, Fluvià: 2, Segre: 2, Llobregat: 1, 'Noguera Pallaresa': 1 },
    description: {
      en: 'Semi-aquatic predator threatening the European mink, water vole and riverside nesting birds.',
      ca: 'Depredador semiaquàtic que amenaça el visó europeu, la rata d’aigua i els ocells que nien a les ribes.',
      es: 'Depredador semiacuático que amenaza al visón europeo, la rata de agua y las aves que anidan en las riberas.',
    },
    management: {
      en: 'Live-trapping on rafts along river corridors; closure of fur farms.',
      ca: 'Captura en viu amb plataformes flotants als corredors fluvials; tancament de granges peleteres.',
      es: 'Captura en vivo con plataformas flotantes en los corredores fluviales; cierre de granjas peleteras.',
    },
  },
  {
    id: 'myocastor-coypus', scientificName: 'Myocastor coypus', group: 'Mammals', family: 'Echimyidae',
    commonNames: { ca: 'Coipú', es: 'Coipú', en: 'Coypu' },
    origin: 'southAmerica', pathway: 'furFarms', firstRecord: 2008, risk: 'medium', riskScore: 69,
    habitats: ['freshwater'], legal: { eu: true, spain: true }, abundance: 1, basins: { Garona: 2, Muga: 2, Fluvià: 1 },
    description: {
      en: 'Large rodent burrowing into riverbanks and dikes and grazing aquatic vegetation.',
      ca: 'Rosegador gran que excava galeries a les ribes i motes i consumeix vegetació aquàtica.',
      es: 'Roedor grande que excava galerías en riberas y diques y consume vegetación acuática.',
    },
    management: {
      en: 'Early trapping of individuals arriving from established French populations.',
      ca: 'Captura primerenca dels exemplars que arriben des de les poblacions establertes a França.',
      es: 'Captura temprana de los ejemplares que llegan desde las poblaciones establecidas en Francia.',
    },
  },
  {
    id: 'ammotragus-lervia', scientificName: 'Ammotragus lervia', group: 'Mammals', family: 'Bovidae',
    commonNames: { ca: 'Arruí', es: 'Arruí', en: 'Barbary sheep' },
    origin: 'northAfrica', pathway: 'hunting', firstRecord: 2011, risk: 'low', riskScore: 42,
    habitats: ['terrestrial'], legal: { eu: false, spain: true }, abundance: 1, basins: { Ebre: 3, Francolí: 1 },
    description: {
      en: 'Wild ungulate that competes with native Iberian ibex and browses rare mountain flora.',
      ca: 'Ungulat salvatge que competeix amb la cabra salvatge autòctona i ramoneja flora de muntanya rara.',
      es: 'Ungulado salvaje que compite con la cabra montés autóctona y ramonea flora de montaña escasa.',
    },
    management: {
      en: 'Culling of dispersing individuals before populations establish.',
      ca: 'Control dels exemplars en dispersió abans que s’estableixin poblacions.',
      es: 'Control de los ejemplares en dispersión antes de que se establezcan poblaciones.',
    },
  },
];
