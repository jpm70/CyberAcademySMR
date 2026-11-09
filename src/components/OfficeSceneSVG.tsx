import React from 'react';

interface OfficeSceneSVGProps {
  currentMission: number;
  cableConectado: boolean;
  usbRecogido: boolean;
  usbInsertado: boolean;
  bootReparado: boolean;
  antivirusInstalado: boolean;
  procesoTerminado: boolean;
  ipRenovada: boolean;
  helpdeskResuelto: boolean;
}

/**
 * Escenario 2D Anime Cel-Shaded "Oficina de Soporte" inspirado fielmente en la imagen adjunta:
 * Paredes crema cálidas, persianas venecianas a izquierda y derecha, estanterías de madera con archivadores,
 * reloj de pared, mesas de madera con monitores, sillas azules y el Rack de Comunicaciones con cableado multicolor.
 */
export const OfficeSceneSVG: React.FC<OfficeSceneSVGProps> = ({
  currentMission,
  cableConectado,
  usbRecogido,
  usbInsertado,
  bootReparado,
  antivirusInstalado,
  procesoTerminado,
  ipRenovada,
  helpdeskResuelto,
}) => {
  return (
    <svg
      viewBox="0 0 1280 720"
      className="w-full h-full object-cover select-none"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Paredes crema cálidas estilo anime de oficina */}
        <linearGradient id="warmWallLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DDD5C0" />
          <stop offset="100%" stopColor="#C8BFA8" />
        </linearGradient>
        <linearGradient id="warmWallRight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E6DFCE" />
          <stop offset="100%" stopColor="#D2C9B2" />
        </linearGradient>
        {/* Madera cálida de estanterías y escritorios */}
        <linearGradient id="woodShelf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#B07D52" />
          <stop offset="100%" stopColor="#8A5A36" />
        </linearGradient>
        <linearGradient id="woodDeskTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DFB184" />
          <stop offset="100%" stopColor="#C48F5C" />
        </linearGradient>
        <linearGradient id="woodDeskSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9C6B43" />
          <stop offset="100%" stopColor="#6E4728" />
        </linearGradient>
        {/* Pantalla iluminada del PC del Técnico */}
        <linearGradient id="cyanMonitorGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>

      {/* ============================================================
          1. ARQUITECTURA DE LA SALA (TECHO, PAREDES, ESQUINAS Y SUELO)
         ============================================================ */}
      {/* Techo técnico gris claro */}
      <polygon points="0,0 1280,0 1160,65 370,115 0,68" fill="#94A3B8" stroke="#334155" strokeWidth="2.5" />

      {/* Pared Izquierda en perspectiva */}
      <polygon points="0,68 370,115 370,505 0,565" fill="url(#warmWallLeft)" stroke="#3E2723" strokeWidth="2.5" />

      {/* Pared Fondo/Derecha en perspectiva */}
      <polygon points="370,115 1160,65 1160,515 370,505" fill="url(#warmWallRight)" stroke="#3E2723" strokeWidth="2.5" />

      {/* Pared Lateral Derecha (con ventana) */}
      <polygon points="1160,65 1280,20 1280,620 1160,515" fill="#C4B9A2" stroke="#3E2723" strokeWidth="2.5" />

      {/* Cornisa superior de madera */}
      <polygon points="0,58 370,108 1160,56 1280,10 1280,24 1160,68 370,118 0,70" fill="#8D6E63" stroke="#3E2723" strokeWidth="2" />

      {/* Suelo de oficina gris azulado */}
      <polygon points="0,565 370,505 1160,515 1280,620 1280,720 0,720" fill="#64748B" stroke="#1E293B" strokeWidth="2.5" />
      <line x1="370" y1="505" x2="210" y2="720" stroke="#475569" strokeWidth="2" />
      <line x1="720" y1="510" x2="680" y2="720" stroke="#475569" strokeWidth="2" />

      {/* ============================================================
          2. VENTANAS CON PERSIANAS VENECIANAS (IZQUIERDA Y DERECHA)
         ============================================================ */}
      {/* Ventana Izquierda con persiana */}
      <g>
        <polygon points="0,95 168,118 168,348 0,355" fill="#E0F2FE" stroke="#475569" strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
          <line
            key={`blind-l-${i}`}
            x1="0"
            y1={110 + i * 17}
            x2="166"
            y2={130 + i * 16}
            stroke="#94A3B8"
            strokeWidth="3"
          />
        ))}
        {/* Cordones de la persiana */}
        <line x1="35" y1="102" x2="35" y2="350" stroke="#CBD5E1" strokeWidth="2" />
        <line x1="135" y1="115" x2="135" y2="348" stroke="#CBD5E1" strokeWidth="2" />
      </g>

      {/* Ventana Derecha con persiana */}
      <g>
        <polygon points="1220,62 1280,40 1280,395 1220,375" fill="#E0F2FE" stroke="#475569" strokeWidth="4" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
          <line
            key={`blind-r-${i}`}
            x1="1222"
            y1={78 + i * 22}
            x2="1280"
            y2={58 + i * 23}
            stroke="#64748B"
            strokeWidth="3.5"
          />
        ))}
      </g>

      {/* Hojas / Notas pegadas en la pared izquierda */}
      <rect x="220" y="195" width="32" height="44" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
      <rect x="190" y="235" width="32" height="44" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
      <rect x="230" y="255" width="32" height="44" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />

      {/* Reloj de Pared Redondo en el centro */}
      <g transform="translate(678, 148)">
        <circle cx="0" cy="0" r="22" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />
        <circle cx="0" cy="0" r="17" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="-6" y2="-8" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="9" y2="0" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ============================================================
          3. ESTANTERÍAS DE MADERA CON ARCHIVADORES Y CAJAS (FONDO)
         ============================================================ */}
      <g transform="translate(272, 132)">
        {/* Cajas superiores sobre las estanterías */}
        <rect x="28" y="4" width="52" height="26" fill="#C49A6C" stroke="#3E2723" strokeWidth="2" />
        <rect x="82" y="8" width="46" height="22" fill="#B6895B" stroke="#3E2723" strokeWidth="2" />
        <rect x="166" y="8" width="48" height="24" fill="#C49A6C" stroke="#3E2723" strokeWidth="2" />
        <rect x="216" y="4" width="54" height="28" fill="#D2A679" stroke="#3E2723" strokeWidth="2" />
        <rect x="285" y="14" width="66" height="18" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />

        {/* Módulo Estantería 1 */}
        <rect x="0" y="30" width="136" height="250" fill="url(#woodShelf)" stroke="#3E2723" strokeWidth="3" />
        <rect x="12" y="40" width="112" height="68" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        <rect x="12" y="118" width="112" height="68" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        {/* Archivadores módulo 1 */}
        <rect x="18" y="54" width="14" height="54" fill="#3B82F6" stroke="#1E293B" strokeWidth="2" />
        <rect x="33" y="54" width="14" height="54" fill="#60A5FA" stroke="#1E293B" strokeWidth="2" />
        <rect x="52" y="56" width="16" height="52" fill="#475569" stroke="#1E293B" strokeWidth="2" />
        <rect x="88" y="58" width="26" height="50" fill="#6EE7B7" stroke="#1E293B" strokeWidth="2" />
        <rect x="20" y="132" width="14" height="54" fill="#475569" stroke="#1E293B" strokeWidth="2" />
        <rect x="36" y="132" width="14" height="54" fill="#64748B" stroke="#1E293B" strokeWidth="2" />
        <rect x="85" y="132" width="15" height="54" fill="#34D399" stroke="#1E293B" strokeWidth="2" />
        <rect x="102" y="132" width="15" height="54" fill="#10B981" stroke="#1E293B" strokeWidth="2" />

        {/* Módulo Estantería 2 y 3 */}
        <rect x="138" y="32" width="236" height="285" fill="url(#woodShelf)" stroke="#3E2723" strokeWidth="3" />
        <rect x="148" y="42" width="98" height="72" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        <rect x="256" y="42" width="106" height="72" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        <rect x="148" y="124" width="98" height="64" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        <rect x="256" y="124" width="106" height="64" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />
        <rect x="148" y="198" width="98" height="64" fill="#5D3A1A" stroke="#3E2723" strokeWidth="2" />

        {/* Libros y carpetas blancos/azules módulo 2 y 3 */}
        {[0, 1, 2, 3, 4].map((b) => (
          <rect
            key={`binder-top-${b}`}
            x={262 + b * 14}
            y={54}
            width="12"
            height="60"
            fill={b % 2 === 0 ? '#F8FAFC' : '#93C5FD'}
            stroke="#1E293B"
            strokeWidth="1.8"
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((b) => (
          <rect
            key={`binder-mid-${b}`}
            x={260 + b * 14}
            y={136}
            width="12"
            height="52"
            fill={b % 2 === 0 ? '#6EE7B7' : '#CBD5E1'}
            stroke="#1E293B"
            strokeWidth="1.8"
          />
        ))}
      </g>

      {/* Archivador metálico gris junto al rack */}
      <rect x="665" y="410" width="82" height="106" fill="#94A3B8" stroke="#334155" strokeWidth="2.5" />
      <line x1="665" y1="445" x2="747" y2="445" stroke="#334155" strokeWidth="2" />
      <line x1="665" y1="480" x2="747" y2="480" stroke="#334155" strokeWidth="2" />

      {/* ============================================================
          4. RACK DE COMUNICACIONES 42U (DERECHA, CON CABLES DE COLORES)
         ============================================================ */}
      <g transform="translate(780, 128)">
        {/* Cables subiendo al falso techo */}
        <path d="M55 -55 L55 5" stroke="#1E293B" strokeWidth="4" />
        <path d="M64 -55 L64 5" stroke="#1E293B" strokeWidth="4" />
        <path d="M73 -55 L73 5" stroke="#334155" strokeWidth="4" />

        {/* Cuerpo 3D del Armario Rack */}
        <polygon points="0,8 148,0 148,385 0,385" fill="#334155" stroke="#0F172A" strokeWidth="3.5" />
        <polygon points="148,0 192,16 192,380 148,385" fill="#1E293B" stroke="#0F172A" strokeWidth="3.5" />

        {/* Interior del Rack */}
        <rect x="14" y="18" width="120" height="355" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />

        {/* Switch Superior con LEDs Cian y Verdes */}
        <rect x="20" y="34" width="108" height="24" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <circle cx="96" cy="46" r="3" fill="#38BDF8" />
        <circle cx="105" cy="46" r="3" fill="#38BDF8" />
        <circle cx="114" cy="46" r="3" fill="#38BDF8" />

        {/* Router / Gateway Switch con indicadores LED */}
        <rect x="20" y="62" width="108" height="24" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <circle cx="96" cy="74" r="3.5" fill={cableConectado ? '#10B981' : '#EF4444'} />
        <circle cx="106" cy="74" r="3.5" fill={cableConectado ? '#10B981' : '#F59E0B'} />
        <circle cx="116" cy="74" r="3.5" fill="#10B981" />

        {/* Patch Panels Intermedios */}
        <rect x="20" y="102" width="108" height="26" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <rect x="20" y="142" width="108" height="38" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <rect x="20" y="196" width="108" height="34" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <rect x="20" y="246" width="108" height="38" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />

        {/* Mazo de cables de red multicolores (Azul, Amarillo, Rojo, Verde) igual que en la imagen */}
        <path d="M30 48 C18 82, 22 118, 42 152" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
        <path d="M38 48 C28 86, 32 122, 50 152" stroke="#0284C7" strokeWidth="2.5" fill="none" />
        <path d="M58 115 C52 155, 64 195, 84 215" stroke="#EF4444" strokeWidth="2.5" fill="none" />
        <path d="M68 115 C64 155, 74 195, 94 215" stroke="#F87171" strokeWidth="2.5" fill="none" />
        <path d="M45 165 C35 210, 45 255, 72 275" stroke="#22C55E" strokeWidth="2.5" fill="none" />
        <path d="M85 165 C98 210, 92 255, 68 275" stroke="#EAB308" strokeWidth="2.5" fill="none" />

        {/* Cable Troncal Amarillo de la Misión 1 (Suelto o Conectado) */}
        {cableConectado ? (
          <path d="M46 46 C44 65, 48 88, 56 112" stroke="#FACC15" strokeWidth="3.5" fill="none" />
        ) : (
          <g>
            <path d="M46 46 C32 92, 16 140, 22 185" stroke="#FACC15" strokeWidth="4" fill="none" />
            <rect x="17" y="182" width="10" height="14" rx="2" fill="#FDE047" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}
      </g>

      {/* ============================================================
          5. ESCRITORIOS DE MADERA, SILLAS AZULES Y PC DEL TÉCNICO
         ============================================================ */}

      {/* Sillas Azules de Oficina */}
      <g>
        {/* Silla izquierda */}
        <path d="M36 420 C36 385, 118 385, 122 420 L126 475 L34 475 Z" fill="#4A7BB0" stroke="#1E293B" strokeWidth="3" />
        {/* Silla central (detrás del escritorio principal) */}
        <path d="M585 375 C605 365, 635 375, 635 450 L622 505 L560 495 Z" fill="#4A7BB0" stroke="#1E293B" strokeWidth="3" />
        <ellipse cx="595" cy="512" rx="48" ry="14" fill="#3B6998" stroke="#1E293B" strokeWidth="3" />
      </g>

      {/* Escritorio Principal Izquierdo-Centro (con PC del Técnico y Cajonera) */}
      <g>
        {/* Tablero de madera en perspectiva */}
        <polygon
          points="14,468 380,418 625,418 445,498"
          fill="url(#woodDeskTop)"
          stroke="#27150B"
          strokeWidth="3"
        />
        {/* Frontal y lateral de madera con Cajonera de Herramientas */}
        <polygon
          points="14,468 445,498 445,695 14,655"
          fill="url(#woodDeskSide)"
          stroke="#27150B"
          strokeWidth="3"
        />
        {/* Cajón de Herramientas en el escritorio (Hotspot Cajón) */}
        <polygon
          points="360,485 520,445 520,595 360,655"
          fill="#8A5A36"
          stroke="#27150B"
          strokeWidth="3"
        />
        <line x1="360" y1="535" x2="520" y2="490" stroke="#27150B" strokeWidth="2.5" />
        <line x1="360" y1="585" x2="520" y2="538" stroke="#27150B" strokeWidth="2.5" />
        {/* Tiradores de los cajones */}
        <line x1="425" y1="492" x2="455" y2="483" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
        <line x1="425" y1="538" x2="455" y2="529" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

        {/* Si el USB no se ha recogido en la Misión 2, mostrar destello en el primer cajón */}
        {!usbRecogido && (
          <g transform="translate(382, 482)">
            <rect x="0" y="0" width="22" height="12" rx="2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}

        {/* Monitor Secundario Izquierdo ( de espaldas ) */}
        <polygon points="162,330 265,318 268,425 162,438" fill="#334155" stroke="#0F172A" strokeWidth="3" />
        <polygon points="198,382 225,380 232,452 192,455" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />

        {/* MONITOR PRINCIPAL: PC DEL TÉCNICO (Iluminado en azul cian como en la imagen) */}
        <g>
          {/* Marco 3D del monitor */}
          <polygon
            points="285,320 398,314 402,422 288,434"
            fill="#475569"
            stroke="#0F172A"
            strokeWidth="3.5"
          />
          {/* Pantalla iluminada según estado */}
          <polygon
            points="294,328 392,322 395,412 296,423"
            fill={
              currentMission === 2 && !bootReparado
                ? '#020617'
                : currentMission === 4 && !procesoTerminado
                ? '#7F1D1D'
                : 'url(#cyanMonitorGlow)'
            }
            stroke="#0F172A"
            strokeWidth="2"
          />
          {/* Peana del monitor */}
          <polygon points="326,430 356,427 364,448 318,452" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
          {/* Teclado delante del monitor */}
          <polygon
            points="322,458 415,440 444,452 352,474"
            fill="#334155"
            stroke="#0F172A"
            strokeWidth="2.5"
          />
        </g>

        {/* Portátil auxiliar en el escritorio central */}
        <polygon points="448,358 504,352 522,415 466,424" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
        <polygon points="466,424 522,415 585,425 524,440" fill="#64748B" stroke="#0F172A" strokeWidth="2.5" />

        {/* Mazo de cables negros colgando del escritorio izquierdo (idéntico a la imagen) */}
        <path d="M210 445 C140 480, 125 580, 145 680" stroke="#0F172A" strokeWidth="3" fill="none" />
        <path d="M240 445 C165 490, 155 590, 175 680" stroke="#0F172A" strokeWidth="3" fill="none" />
        <path d="M295 450 C215 500, 195 590, 210 680" stroke="#0F172A" strokeWidth="2.5" fill="none" />
      </g>

      {/* Escritorio Derecho (Delante del Rack, con portátil y rollo de cable azul) */}
      <g transform="translate(728, 425)">
        <polygon
          points="0,68 95,0 300,2 250,86"
          fill="url(#woodDeskTop)"
          stroke="#27150B"
          strokeWidth="3"
        />
        <polygon points="0,68 250,86 250,100 0,82" fill="#9C6B43" stroke="#27150B" strokeWidth="2.5" />
        {/* Portátil sobre la mesa derecha */}
        <polygon points="105,-52 168,-72 195,8 134,32" fill="#334155" stroke="#0F172A" strokeWidth="3" />
        <polygon points="134,32 195,8 265,24 205,54" fill="#94A3B8" stroke="#0F172A" strokeWidth="3" />
        {/* Rollo de cable de red UTP azul sobre la mesa */}
        <ellipse cx="95" cy="48" rx="46" ry="14" stroke="#1E3A8A" strokeWidth="4" fill="none" />
        <ellipse cx="95" cy="48" rx="38" ry="10" stroke="#2563EB" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
};
