import LocationStage from './LocationStage';
import {
  MAP_VIEWBOX,
  OFFICE_POINT,
  ROADS_MAJOR,
  ROADS_MINOR,
  BUILDINGS,
  GREEN,
  WATER,
  LANDMARKS,
  STREET_LABELS,
} from './maitamaMap';

interface LocationMapProps {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

// Server Component: the ~140KB of OSM path data renders to static HTML and never
// enters the client bundle. The street map is handed to the LocationStage client
// island as children, which animates the cinematic fly-in and parallax.
export default function LocationMap({ address, phone, email }: LocationMapProps) {
  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#070809]"
    >
      <h2 id="location-heading" className="sr-only">
        Find us — the Tinubu Support Group head office in Maitama, Abuja
      </h2>

      <LocationStage address={address} phone={phone} email={email}>
        {/* Real Maitama map, OSM-sourced and dark-themed. Decorative — the
            address is conveyed in text by the card in LocationStage. */}
        <svg
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path d={WATER} fill="rgba(56,84,104,0.28)" />
          <path d={GREEN} fill="rgba(34,60,44,0.55)" />
          <path d={BUILDINGS} fill="rgba(255,255,255,0.07)" />
          <path
            d={ROADS_MINOR}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ROADS_MAJOR}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Street name labels */}
          {STREET_LABELS.map((s) => (
            <text
              key={`${s.label}-${s.x}-${s.y}`}
              x={s.x}
              y={s.y}
              transform={`rotate(${s.angle} ${s.x} ${s.y})`}
              textAnchor="middle"
              fontSize={8}
              letterSpacing={0.6}
              fill="rgba(255,255,255,0.45)"
            >
              {s.label}
            </text>
          ))}

          {/* Landmark markers */}
          {LANDMARKS.map((l) => (
            <g key={`${l.label}-${l.x}-${l.y}`}>
              <circle
                cx={l.x}
                cy={l.y}
                r={3.5}
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.1}
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={l.x} cy={l.y} r={1} fill="rgba(255,255,255,0.8)" />
              <text x={l.x + 8} y={l.y + 3.5} fontSize={8} letterSpacing={0.5} fill="rgba(255,255,255,0.62)">
                {l.label}
              </text>
            </g>
          ))}

          {/* Office pin — AIR-style tooltip on the exact HQ point */}
          <g className="tsg-pin">
            <circle cx={OFFICE_POINT.x} cy={OFFICE_POINT.y} r={2.5} fill="#ffffff" />
            <g transform={`translate(${OFFICE_POINT.x}, ${OFFICE_POINT.y})`}>
              <path
                d="M0,0 L-5,-13 L5,-13 Z"
                fill="#070809"
                stroke="#ffffff"
                strokeWidth={1.2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={-27}
                y={-43}
                width={54}
                height={31}
                rx={4}
                fill="#070809"
                stroke="#ffffff"
                strokeWidth={1.3}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={0}
                y={-23}
                textAnchor="middle"
                fontSize={15}
                fontWeight={700}
                letterSpacing={1.5}
                fill="#ffffff"
              >
                TSG
              </text>
            </g>
          </g>
        </svg>
      </LocationStage>
    </section>
  );
}
