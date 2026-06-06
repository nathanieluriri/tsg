// Generates src/components/public/home/maitamaMap.ts for the homepage Location
// section's dark "AIR-style" map of Maitama, Abuja.
//
// Fetches OpenStreetMap data via the Overpass API for a landscape frame centred
// on the TSG head office, classifies it into road / building / green / water
// layers, projects everything with an equirectangular (cos-corrected)
// projection, clips it to the frame, and emits static SVG path data plus a
// curated set of landmark markers and street labels. Output is committed so the
// site has no runtime network dependency.
//
// Run:  node scripts/generate-maitama-map.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'components', 'public', 'home', 'maitamaMap.ts');

// TSG head office — geocoded "Kainji Crescent, Maitama, Abuja" (Nominatim).
const OFFICE = { lat: 9.0917274, lon: 7.5051776 };
// Landscape frame half-extents, in metres (office at the centre).
const HALF_W_M = 1100;
const HALF_H_M = 850;
const FETCH_R = Math.ceil(Math.hypot(HALF_W_M, HALF_H_M)) + 60; // circle covering the frame corners

const ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

// Value-filtered (regex) so the server does little work and the payload stays
// small — the unfiltered form times out (HTTP 504) on the public instances.
const A = `around:${FETCH_R},${OFFICE.lat},${OFFICE.lon}`;
// Map geometry — ways only, full geometry.
const MAP_QUERY = `[out:json][timeout:180];
(
  way(${A})[highway~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|living_street|road|pedestrian)(_link)?$"];
  way(${A})[building];
  way(${A})[leisure~"^(park|garden|pitch|recreation_ground|playground|golf_course|common)$"];
  way(${A})[landuse~"^(grass|forest|recreation_ground|meadow|village_green|cemetery|reservoir)$"];
  way(${A})[natural~"^(water|wood|scrub|grassland|heath)$"];
  way(${A})[waterway=riverbank];
);
out geom;`;
// Named landmark points — nodes/ways/relations, centroid only (out center) so
// relation-mapped places (parks, embassy compounds) are included cheaply.
const POI_QUERY = `[out:json][timeout:90];
(
  nwr(${A})[name][amenity];
  nwr(${A})[name][leisure];
  nwr(${A})[name][tourism];
  nwr(${A})[name][office=diplomatic];
  nwr(${A})[name][shop~"^(mall|department_store|supermarket)$"];
);
out center;`;

const MAJOR = new Set([
  'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
  'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link',
]);
const MINOR = new Set([
  'residential', 'unclassified', 'service', 'living_street', 'road', 'pedestrian',
]);
const GREEN_LEISURE = new Set(['park', 'garden', 'pitch', 'recreation_ground', 'playground', 'golf_course', 'common']);
const GREEN_LANDUSE = new Set(['grass', 'forest', 'recreation_ground', 'meadow', 'village_green', 'cemetery']);
const GREEN_NATURAL = new Set(['wood', 'scrub', 'grassland', 'heath']);
const LANDMARK_TAG = (t) => t.amenity || t.leisure || t.tourism || t.office || t.shop;
// Categories worth labelling as map landmarks (vs. generic cafés/shops).
const NOTABLE = new Set([
  'school', 'college', 'university', 'hospital', 'clinic', 'park', 'garden',
  'golf_course', 'stadium', 'sports_centre', 'museum', 'theatre', 'marketplace',
  'mall', 'department_store', 'supermarket', 'hotel', 'place_of_worship',
  'library', 'embassy', 'diplomatic', 'government', 'townhall', 'bank',
]);
const MIN_BUILDING_AREA = 9; // viewBox units² — drop tiny sheds to cut clutter & size
const shoelace = (pts) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j].x * pts[i].y - pts[i].x * pts[j].y;
  return Math.abs(a) / 2;
};
const stripThe = (s) => s.replace(/^the\s+/i, '');

async function fetchOverpass(query, label) {
  let lastErr;
  for (const url of ENDPOINTS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 90_000);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'tsg-maitama-map-generator/1.0 (Tinubu Support Group homepage build script)',
          'Accept': 'application/json',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      console.log(`Overpass ${label} OK via ${url} — ${json.elements.length} elements`);
      return json.elements;
    } catch (e) {
      console.warn(`Overpass ${label} failed via ${url}: ${e.message}`);
      lastErr = e;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr ?? new Error('All Overpass endpoints failed');
}

function classify(tags) {
  if (tags.highway) {
    if (MAJOR.has(tags.highway)) return 'roadMajor';
    if (MINOR.has(tags.highway)) return 'roadMinor';
    return null; // footway/path/cycleway/steps/track — skip
  }
  if (tags.building && tags.building !== 'no') return 'building';
  if (tags.natural === 'water' || tags.waterway === 'riverbank' || tags.water || tags.landuse === 'reservoir') return 'water';
  if (GREEN_LEISURE.has(tags.leisure) || GREEN_LANDUSE.has(tags.landuse) || GREEN_NATURAL.has(tags.natural)) return 'green';
  return null;
}

function main_projection() {
  const xf = Math.cos((OFFICE.lat * Math.PI) / 180);
  const lonMin = OFFICE.lon - HALF_W_M / (111320 * xf);
  const lonMax = OFFICE.lon + HALF_W_M / (111320 * xf);
  const latMax = OFFICE.lat + HALF_H_M / 111320;
  const latMin = OFFICE.lat - HALF_H_M / 111320;
  const W = 1000;
  const scale = W / ((lonMax - lonMin) * xf);
  const H = +((latMax - latMin) * scale).toFixed(1);
  const px = (lon) => +(((lon - lonMin) * xf) * scale).toFixed(1);
  const py = (lat) => +((latMax - lat) * scale).toFixed(1);
  return { W, H, px, py };
}

// Liang–Barsky segment clip against the frame box (with margin).
function clipSegment(x0, y0, x1, y1, b) {
  let t0 = 0, t1 = 1;
  const dx = x1 - x0, dy = y1 - y0;
  const p = [-dx, dx, -dy, dy];
  const q = [x0 - b.minX, b.maxX - x0, y0 - b.minY, b.maxY - y0];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
      else { if (r < t0) return null; if (r < t1) t1 = r; }
    }
  }
  return { x0: x0 + t0 * dx, y0: y0 + t0 * dy, x1: x0 + t1 * dx, y1: y0 + t1 * dy };
}

const r1 = (n) => +n.toFixed(1);
const r0 = (n) => Math.round(n);

// Clip a polyline to the box, emitting one or more SVG subpaths.
function clipPolyline(pts, b) {
  let d = '';
  let penUp = true;
  let lastX = 0, lastY = 0;
  for (let i = 1; i < pts.length; i++) {
    const s = clipSegment(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y, b);
    if (!s) { penUp = true; continue; }
    if (penUp || Math.abs(s.x0 - lastX) > 0.1 || Math.abs(s.y0 - lastY) > 0.1) {
      d += `M${r1(s.x0)},${r1(s.y0)}L${r1(s.x1)},${r1(s.y1)}`;
    } else {
      d += `L${r1(s.x1)},${r1(s.y1)}`;
    }
    lastX = s.x1; lastY = s.y1; penUp = false;
  }
  return d;
}

// Sutherland–Hodgman polygon clip against the rectangle box.
function clipPolygon(pts, b, round = r1) {
  const edges = [
    (p) => p.x >= b.minX, (a, c) => intersect(a, c, 'x', b.minX),
    (p) => p.x <= b.maxX, (a, c) => intersect(a, c, 'x', b.maxX),
    (p) => p.y >= b.minY, (a, c) => intersect(a, c, 'y', b.minY),
    (p) => p.y <= b.maxY, (a, c) => intersect(a, c, 'y', b.maxY),
  ];
  function intersect(a, c, axis, val) {
    const t = axis === 'x' ? (val - a.x) / (c.x - a.x) : (val - a.y) / (c.y - a.y);
    return { x: a.x + t * (c.x - a.x), y: a.y + t * (c.y - a.y) };
  }
  let out = pts;
  for (let e = 0; e < edges.length; e += 2) {
    const inside = edges[e], cut = edges[e + 1];
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i], prev = input[(i + input.length - 1) % input.length];
      const curIn = inside(cur), prevIn = inside(prev);
      if (curIn) {
        if (!prevIn) out.push(cut(prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(cut(prev, cur));
      }
    }
    if (out.length === 0) return '';
  }
  if (out.length < 3) return '';
  return out.map((p, i) => (i === 0 ? 'M' : 'L') + round(p.x) + ',' + round(p.y)).join('') + 'Z';
}

async function main() {
  const mapElements = await fetchOverpass(MAP_QUERY, 'map');
  const poiElements = await fetchOverpass(POI_QUERY, 'poi');
  const { W, H, px, py } = main_projection();
  const box = { minX: -80, minY: -80, maxX: W + 80, maxY: H + 80 };
  const office = { x: px(OFFICE.lon), y: py(OFFICE.lat) };
  const distUnits = (x, y) => Math.hypot(x - office.x, y - office.y);
  const inFrame = (x, y) => x >= 0 && x <= W && y >= 0 && y <= H;
  // preserveAspectRatio="slice" (cover) always crops one axis to the centre, so
  // labels must sit in the centre-safe band to survive the crop on desktop.
  const inSafe = (x, y) => x >= 0.06 * W && x <= 0.94 * W && y >= 0.12 * H && y <= 0.88 * H;
  // Keep labels clear of the office tooltip rect (≈ office.x±30, office.y-44…+12).
  const inPin = (x, y) => x >= office.x - 34 && x <= office.x + 34 && y >= office.y - 48 && y <= office.y + 14;
  // Longest run of consecutive in-frame vertices, preserving adjacency (so a road
  // that leaves and re-enters the frame is not collapsed across the gap).
  const longestInFrameRun = (pts) => {
    let bestStart = 0, bestLen = 0, curStart = -1;
    for (let i = 0; i <= pts.length; i++) {
      const inside = i < pts.length && inFrame(pts[i].x, pts[i].y);
      if (inside) { if (curStart < 0) curStart = i; }
      else if (curStart >= 0) {
        if (i - curStart > bestLen) { bestLen = i - curStart; bestStart = curStart; }
        curStart = -1;
      }
    }
    return bestLen >= 2 ? pts.slice(bestStart, bestStart + bestLen) : [];
  };

  const layers = { roadMajor: [], roadMinor: [], building: [], green: [], water: [] };
  const landmarkCandidates = [];
  const roadsByName = new Map();

  for (const el of mapElements) {
    const tags = el.tags || {};
    if (el.type !== 'way' || !Array.isArray(el.geometry) || el.geometry.length < 2) continue;

    const pts = el.geometry.map((p) => ({ x: px(p.lon), y: py(p.lat) }));
    const kind = classify(tags);
    if (kind === 'roadMajor' || kind === 'roadMinor') {
      const d = clipPolyline(pts, box);
      if (d) layers[kind].push(d);
      if (tags.name) {
        // street-label candidate: midpoint & local angle from the longest
        // contiguous in-frame run; ranked by that run's (in-frame) length.
        const run = longestInFrameRun(pts);
        if (run.length >= 2) {
          let len = 0;
          for (let i = 1; i < run.length; i++) len += Math.hypot(run[i].x - run[i - 1].x, run[i].y - run[i - 1].y);
          const m = Math.floor(run.length / 2);
          const a = run[Math.max(0, m - 1)], c = run[Math.min(run.length - 1, m + 1)];
          let angle = (Math.atan2(c.y - a.y, c.x - a.x) * 180) / Math.PI;
          if (angle > 90) angle -= 180;
          if (angle < -90) angle += 180;
          const prev = roadsByName.get(tags.name);
          if (!prev || len > prev.len) {
            roadsByName.set(tags.name, { label: tags.name, x: r1(run[m].x), y: r1(run[m].y), angle: r1(angle), len });
          }
        }
      }
    } else if (kind === 'building') {
      if (shoelace(pts) >= MIN_BUILDING_AREA) {
        const d = clipPolygon(pts, box, r0);
        if (d) layers.building.push(d);
      }
    } else if (kind) {
      const d = clipPolygon(pts, box);
      if (d) layers[kind].push(d);
    }
  }

  // Landmark points (nodes/ways/relations → centroid).
  for (const el of poiElements) {
    const tags = el.tags || {};
    const cat = LANDMARK_TAG(tags);
    if (!tags.name || !cat) continue;
    const c = el.type === 'node' ? { lon: el.lon, lat: el.lat } : el.center;
    if (!c) continue;
    landmarkCandidates.push({ label: tags.name, cat, x: r1(px(c.lon)), y: r1(py(c.lat)) });
  }

  // Curate landmarks: centre-safe (survives the slice crop), clear of the office
  // pin, sensible names, deduped, notable-first then closest.
  const seen = new Set();
  const landmarks = landmarkCandidates
    .filter((l) => inSafe(l.x, l.y) && !inPin(l.x, l.y) && distUnits(l.x, l.y) > 55 && l.label.length >= 3 && l.label.length <= 24)
    .filter((l) => {
      const key = l.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    // Notable categories first (mall/park/school/embassy…), then closest to the office.
    .map((l) => ({ ...l, score: NOTABLE.has(l.cat) ? 0 : 1, dist: distUnits(l.x, l.y) }))
    .sort((p, q) => p.score - q.score || p.dist - q.dist)
    .slice(0, 6)
    .map((l) => ({ x: l.x, y: l.y, label: stripThe(l.label).toUpperCase() }));

  const streetLabels = [...roadsByName.values()]
    .filter((r) => inSafe(r.x, r.y) && !inPin(r.x, r.y) && r.label.length <= 22)
    .sort((p, q) => q.len - p.len)
    .slice(0, 6)
    .map((r) => ({ x: r.x, y: r.y, angle: r.angle, label: r.label.toUpperCase() }));

  const join = (arr) => arr.join('');
  const out = `// AUTO-GENERATED — do not edit by hand.
// Source: OpenStreetMap via the Overpass API (ODbL). Regenerate with:
//   node scripts/generate-maitama-map.mjs
// Dark "AIR-style" map of Maitama, Abuja for the homepage Location section.
// Equirectangular (cos-corrected) projection of a ${HALF_W_M * 2}×${HALF_H_M * 2}m
// frame centred on the TSG head office, clipped to a 0 0 ${W} ${H} viewBox.
export const MAP_VIEWBOX = '0 0 ${W} ${H}';
export const OFFICE_POINT = { x: ${office.x}, y: ${office.y} } as const;

export const ROADS_MAJOR =
  '${join(layers.roadMajor)}';

export const ROADS_MINOR =
  '${join(layers.roadMinor)}';

export const BUILDINGS =
  '${join(layers.building)}';

export const GREEN =
  '${join(layers.green)}';

export const WATER =
  '${join(layers.water)}';

export const LANDMARKS = ${JSON.stringify(landmarks)} as const;

export const STREET_LABELS = ${JSON.stringify(streetLabels)} as const;
`;

  // Guard against Overpass returning HTTP 200 with partial/empty data, which
  // would otherwise silently overwrite the committed map with a blank one.
  const roadCount = layers.roadMajor.length + layers.roadMinor.length;
  if (roadCount < 80 || layers.building.length < 400 || !Number.isFinite(office.x) || !Number.isFinite(office.y)) {
    throw new Error(
      `Refusing to write a degenerate map (roads=${roadCount}, buildings=${layers.building.length}, ` +
      `office=${office.x},${office.y}). Overpass likely returned partial data — rerun.`,
    );
  }

  fs.writeFileSync(OUT, out);
  console.log('Wrote', path.relative(process.cwd(), OUT), `(${(out.length / 1024).toFixed(0)} KB)`);
  console.log(
    `viewBox 0 0 ${W} ${H} | office ${office.x},${office.y} | ` +
    `roads ${layers.roadMajor.length}+${layers.roadMinor.length} | buildings ${layers.building.length} | ` +
    `green ${layers.green.length} | water ${layers.water.length} | landmarks ${landmarks.length} | streets ${streetLabels.length}`,
  );
  console.log('Landmarks:', landmarks.map((l) => l.label).join(', '));
  console.log('Streets:', streetLabels.map((l) => l.label).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); });
