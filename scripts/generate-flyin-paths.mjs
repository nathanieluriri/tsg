// Generates src/components/public/home/flyInPaths.ts — the small Africa +
// Nigeria outline geometry used by the Location section's cinematic
// "world → Abuja → TSG" fly-in. Public-domain country geometry (Natural Earth
// via johan/world.geo.json), equirectangular (cos-corrected) projection so the
// Africa view, Nigeria view and Abuja point share one coordinate system and the
// camera (SVG viewBox) can fly from the continent down to the capital.
//
// Run:  node scripts/generate-flyin-paths.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'components', 'public', 'home', 'flyInPaths.ts');
const SRC = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

const AFRICA = new Set([
  'DZA','AGO','BEN','BWA','BFA','BDI','CMR','CAF','TCD','COG','COD','DJI','EGY','GNQ','ERI',
  'SWZ','ETH','GAB','GMB','GHA','GIN','GNB','CIV','KEN','LSO','LBR','LBY','MDG','MWI','MLI',
  'MRT','MAR','MOZ','NAM','NER','NGA','RWA','SEN','SLE','SOM','ZAF','SSD','SDN','TZA','TGO',
  'TUN','UGA','ZMB','ZWE','ESH',
]);

const ringsOf = (geom) =>
  geom.type === 'Polygon' ? geom.coordinates
  : geom.type === 'MultiPolygon' ? geom.coordinates.flat()
  : [];

async function main() {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(`Failed to fetch geojson: ${res.status}`);
  const data = await res.json();
  const feats = data.features.filter((f) => AFRICA.has(f.id));

  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const f of feats)
    for (const ring of ringsOf(f.geometry))
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }

  const xf = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const scale = 1000 / ((maxLon - minLon) * xf);
  const W = 1000;
  const H = +((maxLat - minLat) * scale).toFixed(1);
  const px = (lon) => +(((lon - minLon) * xf) * scale).toFixed(1);
  const py = (lat) => +((maxLat - lat) * scale).toFixed(1);

  const ringToPath = (ring) =>
    ring.map(([lon, lat], i) => (i === 0 ? 'M' : 'L') + px(lon) + ',' + py(lat)).join('') + 'Z';
  const featPath = (f) => ringsOf(f.geometry).map(ringToPath).join('');

  const africaPath = feats.map(featPath).join('');
  const ngFeat = feats.find((f) => f.id === 'NGA');
  const nigeriaPath = featPath(ngFeat);

  let nMinX = Infinity, nMaxX = -Infinity, nMinY = Infinity, nMaxY = -Infinity;
  for (const ring of ringsOf(ngFeat.geometry))
    for (const [lon, lat] of ring) {
      const x = px(lon), y = py(lat);
      if (x < nMinX) nMinX = x;
      if (x > nMaxX) nMaxX = x;
      if (y < nMinY) nMinY = y;
      if (y > nMaxY) nMaxY = y;
    }
  const padX = (nMaxX - nMinX) * 0.08;
  const padY = (nMaxY - nMinY) * 0.08;
  const nvb = [
    +(nMinX - padX).toFixed(1), +(nMinY - padY).toFixed(1),
    +((nMaxX - nMinX) + padX * 2).toFixed(1), +((nMaxY - nMinY) + padY * 2).toFixed(1),
  ];
  const abuja = { x: px(7.4951), y: py(9.0579) }; // Abuja (FCT)

  const out = `// AUTO-GENERATED — do not edit by hand.
// Source: world.geo.json (public domain, Natural Earth via johan/world.geo.json).
// Regenerate with: node scripts/generate-flyin-paths.mjs
// Africa + Nigeria outlines for the Location section's cinematic fly-in. All
// share one equirectangular (cos-corrected) coordinate system so the camera can
// animate its viewBox from AFRICA_VIEWBOX down to a tight box on ABUJA_POINT.
export const AFRICA_VIEWBOX = '0 0 ${W} ${H}';
export const NIGERIA_VIEWBOX = '${nvb.join(' ')}';
export const ABUJA_POINT = { x: ${abuja.x}, y: ${abuja.y} } as const;

export const AFRICA_OUTLINE =
  '${africaPath}';

export const NIGERIA_PATH =
  '${nigeriaPath}';
`;

  fs.writeFileSync(OUT, out);
  console.log('Wrote', path.relative(process.cwd(), OUT), `(${(out.length / 1024).toFixed(0)} KB)`);
  console.log('AFRICA_VIEWBOX 0 0', W, H, '| NIGERIA_VIEWBOX', nvb.join(' '), '| ABUJA', abuja);
}

main().catch((e) => { console.error(e); process.exit(1); });
