#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = path.join(ROOT, 'media', 'projects', 'midwest-2076-library');
const OUT = path.join(PROJECT, 'requests.json');

const CLASSIFICATION = 'Speculative worldbuilding artwork informed by materials culture. Not a forecast, architectural proposal, engineering design, scientific reference, simulation result, or evidence of a real deployment.';
const ENDPOINT = 'fal-ai/recraft/v4.1/pro/text-to-image';

const shared = {
  intent: 'Institutionally credible speculative worldbuilding in the American Midwest approximately fifty years from now. Reveal the future through material culture, geography, weather, logistics, maintenance, and public use—not gadgets or molecule decoration.',
  quality: 'Photographically coherent space, believable gravity and scale, tactile joints and weathering, quiet matter-of-fact editorial composition, culturally credible for a museum or enduring scientific institution, no promotional gloss. Weather must remain subordinate to the material subject.',
  prohibitions: 'No words, letters, numbers, labels, logos, flags, diagrams, screens, pseudo-data, molecules, DNA, lab-coat scientists, cyberpunk, neon rain, holograms, flying cars, generic smart-city towers, vertical forests, solarpunk illustration, apocalypse, picturesque barns, tractors, luxury villas, decorative science-fiction fins, dramatic cloudscape, shelf cloud, supercell, storm spectacle, disaster lighting, or weather as the main subject.',
};

const palettes = [
  'graphite, wet mineral gray, bone ceramic, and one restrained vermilion safety plane',
  'oxidized green metal, black composite, cold silver, and small amber work lights',
  'pale refractory ceramic, peat-black joints, frost blue-gray, and sulfur-yellow wayfinding surfaces',
  'dark clay, translucent mineral green, weathered copper, and neutral northern daylight',
  'carbon black, lake gray, chalk mineral foam, and one saturated red structural element',
];

const weathers = [
  'after ordinary rainfall, shown through wet surfaces, drainage, and soft neutral light',
  'in diffuse winter daylight with settled snow and frost on working edges',
  'in dry late-summer light with mild atmospheric haze',
  'after freezing rain, shown through thin ice and maintenance residue',
  'at quiet blue dusk after humid heat, with functional lights only',
  'in clear February sunlight with low shadows and salt wear',
  'during spring flood season under plain overcast daylight',
  'in steady prairie wind beneath an undramatic pale sky',
  'in low morning river fog that stays behind the primary subject',
  'in ordinary autumn wind with leaves and grit collecting at joints',
];

const compositions = [
  'wide large-format documentary photograph, primary infrastructure filling at least two thirds of the frame, sky no more than fifteen percent',
  'eye-level documentary architectural photograph with one long diagonal circulation path',
  'compressed telephoto landscape showing repeated systems across a flat horizon',
  'high oblique environmental view with legible service access and surrounding geography',
  'severe frontal elevation softened by weather, wear, and asymmetrical use',
  'section-like oblique interior view that reveals process without becoming a diagram',
  'radical material crop with structural negative space and a large functional focal point; no atmospheric spectacle',
  'long-lens view through foreground weather or structure, layered and spatially credible',
  'quiet central perspective disrupted by maintenance traces and off-axis movement',
  'broad panoramic view with ordinary vehicles or paths establishing scale and sky no more than fifteen percent',
];

const interiorCompositions = [
  'eye-level interior documentary view with ceiling, floor, and at least two enclosing walls visible; no exterior horizon',
  'close interior view organized around worn work surfaces, fixtures, storage, and human-scale circulation',
  'quiet central interior perspective with the requested public or workshop function filling the frame',
  'oblique room-scale view revealing process, access, furniture, and maintenance without becoming a diagram',
  'compressed interior view through foreground shelving, curtains, tools, or structural bays',
  'severe frontal interior elevation softened by repeated use, repairs, and ordinary belongings',
  'close process view with hands absent but tools, residue, and interrupted work clearly visible',
  'low interior view emphasizing material junctions while retaining legible room function',
  'high interior oblique with circulation, furnishings, and service access clearly connected',
  'intimate room-scale crop with no sky and no monumental exterior architecture',
];

const objectCompositions = [
  'close conservation-object photograph; the material assembly fills eighty percent of the frame; no horizon or sky',
  'macro architectural still life with shallow spatial depth and controlled neutral illumination; no landscape',
  'severe frontal object study showing cuts, seams, fasteners, residue, and wear; no environment',
  'oblique tabletop-scale material study with believable gravity and one quiet shadow plane',
  'tight crop across two joined materials with physical scale revealed by fasteners and surface grain',
  'museum conservation photography of one authored material assembly against a neutral mineral background',
  'close process photograph of membrane tension, sag, clamps, and repaired edges; no skyline',
  'macro optical-object study centered on apertures, condensation, dust, and serviceable joints',
  'section-like material object photograph revealing layers physically, without labels or diagram styling',
  'close worn-surface study with repair staples, water residue, and precise edge geometry',
];

const aspects = [
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'wide', label: '16:9', width: 2048, height: 1152 },
  { id: 'square', label: '1:1', width: 1536, height: 1536 },
  { id: 'square', label: '1:1', width: 1536, height: 1536 },
  { id: 'portrait', label: '4:5', width: 1280, height: 1600 },
  { id: 'portrait', label: '4:5', width: 1280, height: 1600 },
];

const classes = [
  {
    id: 'inland-climate-works', name: 'Inland Climate Works',
    grammar: 'Public water, heat, flood, ice, and filtration infrastructure integrated with inland terrain. Strangeness must arise from hydrological function and unfamiliar porous or phase-changing materials.',
    scenes: [
      'A county-scale river flood terrace made from dark porous ceramic shelves, translucent water-bearing membranes, stainless service bridges, and slow stormwater basins',
      'A winter civic thermal reservoir with pale aerogel vaults holding warm mist, black walkways, copper frost lines, and a low public shelter',
      'An aquifer recharge field of mineral foam channels and articulated weirs crossing a flat glacial outwash plain',
      'A municipal cooling basin embedded beside a dense inland neighborhood, with durable shaded public edges and maintenance access',
      'A porous levee and filtration garden where river freight, pedestrian circulation, and seasonal overflow coexist',
      'A network of fog-harvesting walls and condensate courts along a drought-stressed county reservoir',
      'A spring flood bypass built as stepped ceramic wetlands, service rails, and low observation rooms rather than a landscaped park',
      'A frozen stormwater exchange whose black composite gates and translucent ice-control membranes remain operable in deep winter',
      'A regional heat refuge formed by earth-coupled mineral chambers and open public water courts at the edge of a small city',
      'A river monitoring and sediment-recovery landscape using massive woven barriers, low service bridges, and weathered storage bays',
    ],
  },
  {
    id: 'prairie-machine-commons', name: 'Prairie Machine Commons',
    grammar: 'Shared field-scale material systems, seasonal fabrication, soil observation, wind control, and maintenance culture. Agricultural without nostalgia; no generic renewables or cute robotics.',
    scenes: [
      'Long woven mineral-fiber windbreaks folding across black-soil fields, linked to low ceramic maintenance houses and dark jointed instruments',
      'A seasonal rural fabrication yard with clay-composite sheds, translucent canopies, mobile material presses, and stacked porous components',
      'A county soil observatory of low articulated probes, sheltered sample courts, and service tracks across winter stubble',
      'A field-scale heat battery commons made from dark ceramic banks, copper manifolds, and shared loading shelters',
      'A mobile repair convoy stopped at a prairie machine commons, with modular mineral parts and tensioned weather shelters',
      'A drought-season water distribution field using woven channels, shade membranes, and visible maintenance paths rather than irrigation spectacle',
      'A seed and material archive built into a wind-carved rise, surrounded by instrument lines and working access roads',
      'A storm-damaged wind field undergoing ordinary repair, with replacement membrane rolls and weathered joint modules',
      'A cooperative winter machine hall where large soft implements dry, fold, and receive maintenance under diffuse roof light',
      'A county boundary landscape where field observatories, freight sidings, and public storm shelters form one shared system',
    ],
  },
  {
    id: 'lake-effect-foundry', name: 'Lake Effect Foundry',
    grammar: 'Great Lakes freshwater industry, freight, material recovery, research, and public shore infrastructure. Industrial dignity with condensation, repair, weather, and process—not spaceships or luxury waterfronts.',
    scenes: [
      'A colossal freshwater material-recovery hall with black structural arcs, silver transfer nodes, rail-water interfaces, and a cold lake horizon',
      'A storm-facing ceramic dry dock with pale refractory shells, articulated cranes, mineral foam breakwaters, and low work lights',
      'A rail-to-lake freight exchange enclosed by translucent weather membranes and oxidized metal service galleries',
      'A public shoreline route passing through an active low-emission foundry, separated by durable mineral walls and clear process thresholds',
      'A freshwater intake and materials research structure extending into violent lake weather on a long black service spine',
      'An inland port recovery yard sorting massive composite and metal components beneath snow-loaded tension roofs',
      'A lake laboratory built inside a reused industrial bay, with water-level chambers, maintenance gantries, and public viewing distance',
      'A breakwater manufacturing line where porous ceramic units move from wet casting halls to the storm edge',
      'A winter harbor transfer room filled with condensation, ice-control apparatus, and weathered freight equipment',
      'A regional materials depot where lake vessels, short freight trains, and repair halls meet beneath one monumental roofscape',
    ],
  },
  {
    id: 'civic-futures', name: 'Civic Futures',
    grammar: 'Public institutions for collective use: cooling, learning, repair, transit, archives, care, and winter shelter. Monumental quiet, intuitive circulation, accessibility, seasons, and visible repeated use.',
    scenes: [
      'A public library functioning as a neighborhood cooling shelter, with deep mineral walls, thermal curtains, durable seating terrain, and a light court',
      'A municipal material archive and repair school with suspended sample vaults, worn work surfaces, copper rails, and severe north light',
      'A winter conservatory integrated with a bus transfer room, using translucent ceramic screens and robust heated public benches',
      'A civic water court where residents collect, test, and exchange household filtration components without visible screens or labels',
      'A county courthouse converted into a public heat refuge and material stewardship center, retaining evidence of old and new construction',
      'A neighborhood clinic built around quiet thermal rooms, washable mineral surfaces, and sheltered outdoor circulation',
      'A public repair library where large shared tools and modular building components occupy an accessible central hall',
      'A small-city observatory chamber used for weather briefings and public meetings, with a monumental aperture and durable seating rings',
      'A transit waiting hall designed for severe seasonal weather, with drying zones, repair counters, and calm legible movement',
      'A civic archive courtyard that stores local material histories in weatherproof translucent vaults around a heavily used public path',
    ],
  },
  {
    id: 'regional-logistics', name: 'Regional Logistics',
    grammar: 'Inland rail, river, road, and autonomous freight as robust shared infrastructure. Emphasize transfer, waiting, repair, weather protection, and regional scale—not futuristic vehicles.',
    scenes: [
      'A river-rail transfer platform where low freight modules pass beneath a vast weather membrane beside working flood infrastructure',
      'A snowbound regional freight stop with heated mineral loading aprons, black articulated couplers, and ordinary maintenance sheds',
      'A rural intermodal yard built into a shallow quarry, with terraced access, reusable cargo shells, and repair scaffolds',
      'A night river crossing carrying slow modular freight across a bridge whose ceramic wind screens glow only from functional lighting',
      'A county logistics commons where delivery vehicles, farm materials, public transit, and repair bays share one durable covered court',
      'A flood-season elevated distribution spine crossing low fields with service stairs, refuge rooms, and water-tolerant supports',
      'A Great Lakes winter ferry terminal centered on cargo repair and passenger shelter rather than monumental tourism',
      'A regional cold-chain room using thick mineral walls, translucent thermal doors, and gravity-fed transfer rails',
      'A freight corridor reclaimed from an obsolete highway, with narrow rail lanes, water channels, and planted erosion edges without eco-utopian gloss',
      'A dawn maintenance interval at a long inland logistics bridge, showing replacement joints, wet tracks, and quiet operational scale',
    ],
  },
  {
    id: 'thermal-energy-commons', name: 'Thermal Energy Commons',
    grammar: 'District-scale storage and exchange of heat, cold, and seasonal energy through credible material systems. Avoid solar-panel shorthand, reactor spectacle, and glowing energy cores.',
    scenes: [
      'A neighborhood seasonal heat bank of deep ceramic chambers, insulated public terraces, copper exchange lines, and winter vapor',
      'A county cold-storage commons embedded in glacial terrain with pale mineral vaults and simple freight access',
      'A district thermal exchange beneath a public square, revealed through an oblique service level of pumps, membranes, and worn paths',
      'A summer night cooling field where broad radiative surfaces fold above reservoirs and maintenance walkways',
      'A repurposed quarry holding stacked thermal masses, water circulation channels, and a modest public observation route',
      'A school and clinic sharing an earth-coupled thermal court with visible seasonal maintenance equipment',
      'A winter heat distribution station at the edge of a small town, built from black composite frames and thick translucent panels',
      'A river industrial district exchanging waste heat through insulated bridges and municipal bath-like cooling rooms',
      'A prairie thermal battery protected by woven storm membranes and accessible through low repair galleries',
      'An emergency cooling commons during extreme wet heat, occupied indirectly through shade, wet surfaces, and ordinary belongings',
    ],
  },
  {
    id: 'material-workshops', name: 'Material Workshops',
    grammar: 'Places where unfamiliar materials are fabricated, repaired, tested, stored, and reused. Show process through tools, residue, fixtures, and worker-scale circulation without fake technical diagrams.',
    scenes: [
      'A municipal ceramic membrane workshop with wet casting beds, dark fixtures, translucent drying screens, and heavily used circulation',
      'A regional composite repair hall containing long woven components, copper tension rigs, worn benches, and winter daylight',
      'A mineral foam casting room where porous architectural units cure beside water channels and maintenance scaffolds',
      'A public polymer reclamation workshop with frosted material sheets, modular presses, sorted color-free feedstock, and durable floors',
      'A rail component repair school where oversized joints are disassembled under severe overhead light',
      'A small-town material library back room filled with sample drawers, cutting tables, dust extraction, and careful storage',
      'A storm membrane fabrication hall where enormous translucent sheets hang, fold, and reveal their tension structure',
      'A lakeside corrosion laboratory occupying a weathered foundry annex with test racks, spray, and repair tools',
      'A cooperative workshop making porous flood components from dark clay and reclaimed mineral aggregate',
      'A mobile field-repair atelier opened beside prairie infrastructure, exposing compact tools, spare joints, and weather shelter systems',
    ],
  },
  {
    id: 'atmospheric-habitats', name: 'Atmospheric Habitats',
    grammar: 'Ordinary collective interiors and thresholds adapted to severe Midwestern seasons through materials, airflow, moisture, shade, and thermal mass. Not luxury homes or wellness spaces.',
    scenes: [
      'A shared apartment winter room with deep window reveals, translucent insulation curtains, drying rails, and communal work surfaces',
      'A neighborhood summer refuge under a massive porous ceramic canopy with water-cooled floors and evidence of daily use',
      'A school entry designed for freezing rain, with warm mineral benches, drainage channels, repair storage, and layered thresholds',
      'A public wash and cooling room beside a transit stop during extreme humidity, built from durable green ceramic and black joints',
      'A cooperative housing courtyard enclosed by adjustable wind membranes and thick thermal walls under winter sun',
      'A rural clinic waiting room oriented around filtered daylight, washable mineral foam surfaces, and storm shelter circulation',
      'A library roof room where residents gather beneath a radiative cooling ceiling during a hot night',
      'A flood-adapted ground floor with suspended storage, porous partitions, visible water marks, and ordinary furniture returning to use',
      'A collective kitchen and repair room whose thermal mass, ventilation chimneys, and worn material surfaces define the future',
      'A small public interior at dawn after a snowstorm, with wet boots implied, drying equipment, fogged translucent walls, and quiet warm light',
    ],
  },
  {
    id: 'scientific-instruments', name: 'Scientific Instruments',
    grammar: 'Unfamiliar field and civic instruments with believable housings, joints, calibration access, environmental exposure, and maintenance. Never depict screens, labels, molecule models, or magical glowing cores.',
    scenes: [
      'A monumental river sediment instrument built from black articulated arms, porous ceramic collectors, and a narrow maintenance bridge',
      'A compact prairie atmosphere station enclosed by woven wind surfaces and frost-covered optical ports',
      'A freshwater observation instrument suspended inside a lake intake chamber with condensation and repair access',
      'A county-scale soil scanner moving slowly along a dark service rail beneath a translucent weather hood',
      'A civic heat-mapping instrument embedded in a public cooling court as a durable non-screen object',
      'A mineral weathering apparatus occupying an open foundry bay with test surfaces, spray, and replacement fixtures',
      'A winter ice-structure observatory with thick optical glass, copper tension elements, and black maintenance joints',
      'A portable material assay instrument unfolded at a rural repair commons, tactile and mechanically legible without labels',
      'A long atmospheric sampling wall across a flat field, with repeated apertures, access stairs, and storm wear',
      'A public scientific instrument room containing one immense quiet optical assembly and ordinary maintenance circulation',
    ],
  },
  {
    id: 'material-studies', name: 'Material Studies',
    grammar: 'Abstract still lifes and close material worlds for flexible editorial use. The object must feel physically authored, cut, joined, worn, and photographed—not a glossy 3D blob or literal scientific specimen.',
    scenes: [
      'A close architectural still life of porous black ceramic, translucent mineral membrane, copper tension wire, and condensed water',
      'A monumental folded sheet of frosted green polymer joined to dark clay ribs by precise weathered metal pins',
      'A field of pale mineral foam blocks cut by one saturated red structural plane and soft northern shadow',
      'An oxidized metal shell enclosing a delicate woven carbon interior, photographed like a museum conservation object',
      'A translucent ceramic vessel interrupted by black composite seams, mineral deposits, and traces of repeated handling',
      'A dense assembly of refractory fragments, silver joints, wet stone, and one amber internal work light',
      'A soft machine membrane held under uneven copper tension above a dark porous base, with believable sag and wear',
      'A severe black optical object whose frosted apertures collect winter condensation and fine dust',
      'A cutaway material object revealing layers of clay, woven fiber, mineral foam, and reclaimed metal without diagram labels',
      'A weathered public-surface sample combining green ceramic glaze, black aggregate, repair staples, and a narrow water channel',
    ],
  },
];

function exactPrompt(cls, scene, index, classIndex) {
  const weatherIndex = (index + classIndex * 3) % weathers.length;
  const paletteIndex = (index + classIndex * 2) % palettes.length;
  const compositionIndex = (index * 3 + classIndex * 7) % compositions.length;
  const interiorClass = ['civic-futures', 'material-workshops', 'atmospheric-habitats'].includes(cls.id);
  const objectClass = cls.id === 'material-studies';
  const conditions = objectClass
    ? 'Controlled neutral conservation lighting; no outdoor weather, horizon, landscape, or sky'
    : interiorClass
      ? 'Ordinary diffuse interior light; exterior weather may appear only as subtle moisture, tracked residue, or window light; no visible dramatic sky'
      : `${weathers[weatherIndex]}. Keep any sky to fifteen percent of the image or less`;
  const composition = objectClass
    ? objectCompositions[index]
    : interiorClass
      ? interiorCompositions[index]
      : compositions[compositionIndex];
  return [
    shared.intent,
    `Asset class: ${cls.name}. ${cls.grammar}`,
    `Scene: ${scene}.`,
    `Conditions: ${conditions}.`,
    `Material palette: ${palettes[paletteIndex]}.`,
    `Composition: ${composition}.`,
    interiorClass ? 'The requested room function must be immediately legible. Keep the camera inside the enclosure; do not substitute an outdoor campus, amphitheater, pavilion, field, or infrastructure landscape.' : '',
    objectClass ? 'Treat this as physically authored material culture photographed at close range, not environmental concept art or monumental architecture.' : '',
    cls.id === 'scientific-instruments' ? 'One mechanically coherent instrument must occupy at least sixty percent of the frame. Show grounded supports, consistent repeated joints, a plausible sample path, and direct maintenance access.' : '',
    'Show plausible maintenance access, joints, residue, weather exposure, and ordinary use. Human presence may be implied only through paths, wear, tools, or distant scale figures; no portrait subjects.',
    shared.quality,
    shared.prohibitions,
  ].filter(Boolean).join(' ');
}

const requests = [];
for (const [classIndex, cls] of classes.entries()) {
  for (let i = 0; i < cls.scenes.length; i++) {
    const ordinal = classIndex * 10 + i + 1;
    const id = `m76-${String(ordinal).padStart(3, '0')}`;
    const aspect = aspects[i];
    const prompt = exactPrompt(cls, cls.scenes[i], i, classIndex);
    requests.push({
      id,
      assetClass: cls.id,
      assetClassName: cls.name,
      variation: i + 1,
      scene: cls.scenes[i],
      aspect: aspect.label,
      aspectId: aspect.id,
      requestedSize: { width: aspect.width, height: aspect.height },
      endpoint: ENDPOINT,
      prompt,
      promptSha256: createHash('sha256').update(prompt).digest('hex'),
      classification: CLASSIFICATION,
      status: 'planned',
      publicMasterPath: `/brand-assets/assets/images/midwest-2076/${id}.webp`,
      publicThumbPath: `/brand-assets/assets/images/midwest-2076/thumbs/${id}.webp`,
    });
  }
}

if (requests.length !== 100) throw new Error(`expected 100 requests, got ${requests.length}`);
const manifest = {
  schemaVersion: 1,
  project: 'midwest-2076-brand-library',
  status: 'planned',
  generatedAt: '2026-08-11',
  provider: 'fal.ai',
  endpoint: ENDPOINT,
  assetClasses: classes.map(({ id, name, grammar }) => ({ id, name, grammar, count: 10 })),
  sharedPromptGrammar: shared,
  requestedCount: requests.length,
  classification: CLASSIFICATION,
  requests,
};
fs.mkdirSync(PROJECT, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ output: path.relative(ROOT, OUT), requests: requests.length, classes: classes.length }, null, 2));
