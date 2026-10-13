import React from 'react'

const zoneNames = {
  desktop: {
    cpu: 'Procesador y disipador',
    ram: 'Memoria RAM',
    gpu: 'Tarjeta gráfica',
    psu: 'Fuente de poder',
    storage: 'Almacenamiento',
    fans: 'Ventiladores y filtros',
    board: 'Placa base',
  },
  laptop: {
    cpu: 'Procesador',
    gpu: 'Chip gráfico (GPU) soldado a la placa',
    ram: 'Memoria RAM (SO-DIMM)',
    storage: 'Unidad SSD',
    fans: 'Ventilador, heatpipe y aletas del disipador',
    board: 'Placa base y teclado',
    battery: 'Batería interna',
    power: 'Conector de carga (DC jack)',
    display: 'Panel y retroiluminación',
    hinge: 'Bisagra y cable flex de video',
  },
}

// Vista lateral simplificada del interior de una torre ATX.
function DesktopDrawing({ z }) {
  return (
    <>
      <rect className="case" x="6" y="6" width="408" height="288" rx="14" />
      <g className={z('board')}>
        <rect x="84" y="22" width="276" height="172" rx="6" />
        <circle cx="136" cy="64" r="6" />
        <circle cx="136" cy="84" r="6" />
        <circle cx="136" cy="104" r="6" />
        <text x="92" y="186">Placa base</text>
      </g>
      <path className="trace" d="M234 82 H250 M202 114 V140 M160 194 V214 M352 194 V214 M142 64 H170" />

      <g className={z('fans')}>
        <circle cx="44" cy="92" r="26" />
        <path d="M44 70 V114 M22 92 H66" />
        <circle cx="44" cy="190" r="26" />
        <path d="M44 168 V212 M22 190 H66" />
        <circle cx="388" cy="56" r="18" />
        <path d="M388 40 V72 M372 56 H404" />
        <text x="44" y="240" textAnchor="middle">Ventiladores</text>
      </g>

      <g className={z('cpu')}>
        <rect x="170" y="50" width="64" height="64" rx="6" />
        <circle cx="202" cy="82" r="22" />
        <path d="M202 62 V102 M182 82 H222" />
        <text x="202" y="44" textAnchor="middle">CPU</text>
      </g>

      <g className={z('ram')}>
        <rect x="252" y="46" width="9" height="78" rx="2" />
        <rect x="266" y="46" width="9" height="78" rx="2" />
        <rect x="280" y="46" width="9" height="78" rx="2" />
        <rect x="294" y="46" width="9" height="78" rx="2" />
        <text x="278" y="38" textAnchor="middle">RAM</text>
      </g>

      <g className={z('gpu')}>
        <rect x="108" y="142" width="214" height="36" rx="5" />
        <circle cx="160" cy="160" r="13" />
        <circle cx="270" cy="160" r="13" />
        <text x="215" y="165" textAnchor="middle">GPU</text>
      </g>

      <g className={z('psu')}>
        <rect x="100" y="214" width="120" height="66" rx="6" />
        <circle cx="138" cy="247" r="20" />
        <path d="M138 231 V263 M122 247 H154" />
        <text x="190" y="252" textAnchor="middle">PSU</text>
      </g>

      <g className={z('storage')}>
        <rect x="244" y="214" width="116" height="66" rx="6" />
        <rect x="256" y="226" width="92" height="16" rx="3" />
        <rect x="256" y="252" width="92" height="16" rx="3" />
        <text x="302" y="208" textAnchor="middle">Discos</text>
      </g>
    </>
  )
}

// Portátil abierto: la tapa arriba y la base sin su cubierta inferior.
function LaptopDrawing({ z }) {
  return (
    <>
      <g className={z('display')}>
        <rect x="70" y="8" width="280" height="132" rx="10" />
        <rect x="84" y="20" width="252" height="108" rx="3" />
        <text x="210" y="79" textAnchor="middle">Pantalla</text>
      </g>

      <rect className="case" x="30" y="150" width="360" height="174" rx="12" />

      <g className={z('board')}>
        <rect x="130" y="164" width="222" height="76" rx="5" />
        <text x="138" y="233">Placa base</text>
      </g>

      <g className={z('hinge')}>
        <rect x="104" y="136" width="36" height="14" rx="3" />
        <rect x="280" y="136" width="36" height="14" rx="3" />
        <path d="M122 128 V172 H130" />
        <text x="210" y="148" textAnchor="middle">Bisagras y flex</text>
      </g>

      <g className={z('fans')}>
        <rect x="40" y="170" width="10" height="62" rx="2" />
        <path d="M104 196 H236" />
        <circle cx="78" cy="200" r="26" />
        <path d="M78 178 V222 M56 200 H100" />
        <text x="78" y="246" textAnchor="middle">Ventilador</text>
      </g>

      <g className={z('cpu')}>
        <rect x="144" y="178" width="42" height="34" rx="3" />
        <text x="165" y="200" textAnchor="middle">CPU</text>
      </g>

      <g className={z('gpu')}>
        <rect x="194" y="178" width="42" height="34" rx="3" />
        <text x="215" y="200" textAnchor="middle">GPU</text>
      </g>

      <g className={z('ram')}>
        <rect x="250" y="172" width="86" height="22" rx="2" />
        <text x="293" y="188" textAnchor="middle">RAM</text>
      </g>

      <g className={z('storage')}>
        <rect x="250" y="202" width="86" height="18" rx="2" />
        <text x="293" y="216" textAnchor="middle">SSD</text>
      </g>

      <g className={z('power')}>
        <rect x="368" y="176" width="16" height="24" rx="2" />
        <text x="386" y="218" textAnchor="end">Carga</text>
      </g>

      <g className={z('battery')}>
        <rect x="80" y="254" width="260" height="58" rx="6" />
        <path d="M140 254 V312 M280 254 V312" />
        <text x="210" y="288" textAnchor="middle">Batería</text>
      </g>
    </>
  )
}

// `fault` ilumina el componente responsable de la falla.
export default function Schematic({ device = 'desktop', fault, faultLabel }) {
  const z = (name) => `zone${fault === name ? ' is-fault' : ''}`
  const name = faultLabel ?? zoneNames[device][fault]
  const label = device === 'laptop' ? 'Interior del portátil' : 'Interior del PC'
  const Drawing = device === 'laptop' ? LaptopDrawing : DesktopDrawing

  return (
    <figure className="schematic">
      <svg viewBox={device === 'laptop' ? '0 0 420 330' : '0 0 420 300'} role="img" aria-labelledby="schematic-title">
        <title id="schematic-title">
          {fault ? `${label}: el componente afectado es ${name}` : label}
        </title>
        <Drawing z={z} />
      </svg>
      {fault && <figcaption>Componente afectado: <strong>{name}</strong></figcaption>}
    </figure>
  )
}
