import React from 'react';

export type AliceExpression = 'normal' | 'happy' | 'worried' | 'thinking' | 'celebrating';

interface AliceSpriteProps {
  expression: AliceExpression;
  isWalking: boolean;
  hasUsb?: boolean;
}

/**
 * Sprite de Alice (Técnica SMR) adaptado fielmente a la imagen de referencia:
 * Pelo castaño estilo anime, gafas de montura oscura, camisa blanca remangada,
 * chaleco técnico naranja con herramientas (llave fija, bolígrafos) y cinturón portaherramientas.
 */
export const AliceFullSprite: React.FC<AliceSpriteProps> = ({ expression, isWalking, hasUsb }) => {
  return (
    <svg
      viewBox="0 0 250 400"
      className={`w-44 sm:w-52 lg:w-56 h-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] select-none ${
        expression === 'celebrating'
          ? 'alice-celebrating'
          : isWalking
          ? 'alice-walking'
          : 'alice-idle'
      }`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pelo castaño anime con brillos cálidos */}
        <linearGradient id="brownHairGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="50%" stopColor="#6B3E26" />
          <stop offset="100%" stopColor="#3E2212" />
        </linearGradient>
        {/* Chaleco técnico naranja/ámbar */}
        <linearGradient id="orangeVestGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
        {/* Camisa blanca con sombreado cel-shaded */}
        <linearGradient id="whiteShirtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        {/* Piel anime */}
        <linearGradient id="animeSkinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3E6" />
          <stop offset="100%" stopColor="#FCD9BD" />
        </linearGradient>
        {/* Vaqueros azul oscuro */}
        <linearGradient id="jeansGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      {/* Sombra proyectada en el suelo */}
      <ellipse cx="125" cy="390" rx="58" ry="8" fill="rgba(15, 23, 42, 0.45)" />

      {/* Pelo trasero castaño (media melena con volumen) */}
      <path
        d="M68 78 C52 115, 52 162, 66 184 C78 180, 88 170, 92 158 L158 158 C162 170, 172 180, 184 184 C198 162, 198 115, 182 78 Z"
        fill="url(#brownHairGrad)"
        stroke="#27150B"
        strokeWidth="3"
      />

      {/* Pantalón técnico / Vaqueros oscuros */}
      <path
        d="M84 295 L78 388 L118 388 L125 322 L132 388 L172 388 L166 295 Z"
        fill="url(#jeansGrad)"
        stroke="#0F172A"
        strokeWidth="3"
      />
      {/* Costuras del pantalón */}
      <line x1="125" y1="295" x2="125" y2="322" stroke="#0F172A" strokeWidth="2.5" />

      {/* Brazo Izquierdo (con manga blanca remangada) */}
      <path
        d="M74 166 L54 242 L74 248 L88 182 Z"
        fill="url(#whiteShirtGrad)"
        stroke="#1E293B"
        strokeWidth="3"
      />
      {/* Doblez de manga izquierda */}
      <rect x="51" y="232" width="25" height="12" rx="3" transform="rotate(12 51 232)" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2.5" />
      {/* Antebrazo y mano izquierda */}
      <path d="M56 245 L48 310 L64 312 L72 248 Z" fill="url(#animeSkinGrad)" stroke="#27150B" strokeWidth="2.5" />
      <circle cx="55" cy="316" r="9" fill="url(#animeSkinGrad)" stroke="#27150B" strokeWidth="2.5" />

      {/* Brazo Derecho en jarras (mano en la cintura como en la referencia) */}
      <path
        d="M176 166 L214 226 L194 240 L166 186 Z"
        fill="url(#whiteShirtGrad)"
        stroke="#1E293B"
        strokeWidth="3"
      />
      {/* Doblez de manga derecha */}
      <rect x="192" y="220" width="26" height="12" rx="3" transform="rotate(-32 192 220)" fill="#E2E8F0" stroke="#1E293B" strokeWidth="2.5" />
      {/* Antebrazo derecho hacia la cadera */}
      <path
        d="M210 232 L176 276 L166 264 L194 224 Z"
        fill="url(#animeSkinGrad)"
        stroke="#27150B"
        strokeWidth="2.5"
      />
      {/* Mano derecha apoyada en la cadera */}
      <path
        d="M176 270 C162 266, 152 272, 154 282 C162 286, 174 284, 180 278 Z"
        fill="url(#animeSkinGrad)"
        stroke="#27150B"
        strokeWidth="2.5"
      />

      {/* Camisa blanca interior y cuello */}
      <path
        d="M80 158 L170 158 L166 296 L84 296 Z"
        fill="url(#whiteShirtGrad)"
        stroke="#1E293B"
        strokeWidth="3"
      />
      {/* Sombra del cuello y botones */}
      <polygon points="108,154 142,154 125,198" fill="#CBD5E1" stroke="#1E293B" strokeWidth="2" />
      <line x1="125" y1="198" x2="125" y2="294" stroke="#64748B" strokeWidth="2" />

      {/* Chaleco Técnico Naranja (con bolsillos y herramientas) */}
      {/* Lado izquierdo del chaleco */}
      <path
        d="M78 158 L112 158 L121 205 L121 296 L80 296 L74 185 Z"
        fill="url(#orangeVestGrad)"
        stroke="#27150B"
        strokeWidth="3"
      />
      {/* Lado derecho del chaleco */}
      <path
        d="M172 158 L138 158 L129 205 L129 296 L170 296 L176 185 Z"
        fill="url(#orangeVestGrad)"
        stroke="#27150B"
        strokeWidth="3"
      />
      {/* Cremallera central del chaleco */}
      <rect x="121" y="202" width="8" height="94" fill="#334155" stroke="#0F172A" strokeWidth="2" />
      {/* Bandas reflectantes / costuras en hombros */}
      <rect x="78" y="168" width="28" height="7" fill="#FDE047" stroke="#27150B" strokeWidth="1.5" />
      <rect x="144" y="168" width="28" height="7" fill="#FDE047" stroke="#27150B" strokeWidth="1.5" />

      {/* Bolsillo superior izquierdo */}
      <rect x="82" y="205" width="30" height="34" rx="3" fill="#D97706" stroke="#27150B" strokeWidth="2.2" />
      <path d="M82 205 L112 205 L112 215 L97 220 L82 215 Z" fill="#F59E0B" stroke="#27150B" strokeWidth="2" />

      {/* Herramientas en el bolsillo superior derecho (Llave inglesa + bolígrafo azul) */}
      {/* Llave inglesa asomando */}
      <g transform="translate(152, 182) rotate(12)">
        <rect x="4" y="12" width="6" height="24" fill="#94A3B8" stroke="#1E293B" strokeWidth="2" />
        <path
          d="M0 8 C0 0, 14 0, 14 8 C14 12, 11 14, 10 14 L10 6 L4 6 L4 14 C3 14, 0 12, 0 8 Z"
          fill="#CBD5E1"
          stroke="#1E293B"
          strokeWidth="2"
        />
      </g>
      {/* Bolígrafo técnico azul */}
      <rect x="140" y="192" width="6" height="18" rx="2" fill="#0284C7" stroke="#0F172A" strokeWidth="1.8" />
      {/* Bolsillo superior derecho */}
      <rect x="136" y="206" width="30" height="34" rx="3" fill="#D97706" stroke="#27150B" strokeWidth="2.2" />

      {/* Bolsillos inferiores del chaleco */}
      <rect x="80" y="250" width="32" height="34" rx="3" fill="#D97706" stroke="#27150B" strokeWidth="2.2" />
      <rect x="138" y="250" width="32" height="34" rx="3" fill="#D97706" stroke="#27150B" strokeWidth="2.2" />

      {/* Si tiene el Pendrive USB recogido, mostrarlo brillando en el bolsillo */}
      {hasUsb && (
        <g transform="translate(88, 236)">
          <rect x="0" y="0" width="14" height="20" rx="2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="3" y="-6" width="8" height="6" fill="#E2E8F0" />
        </g>
      )}

      {/* Cinturón Técnico Negro y Cartuchera Portaherramientas en la cadera derecha */}
      <rect x="80" y="292" width="90" height="14" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
      <rect x="115" y="290" width="20" height="18" rx="3" fill="#64748B" stroke="#0F172A" strokeWidth="2.5" />
      {/* Cartuchera de herramientas en cadera derecha */}
      <g transform="translate(152, 294)">
        {/* Destornilladores asomando */}
        <rect x="6" y="-12" width="6" height="16" rx="2" fill="#EF4444" stroke="#0F172A" strokeWidth="1.8" />
        <rect x="16" y="-10" width="6" height="14" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="1.8" />
        <rect x="25" y="-8" width="5" height="12" rx="1" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.8" />
        {/* Bolsa negra */}
        <rect x="0" y="2" width="36" height="44" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="4" y="14" width="28" height="26" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2" />
      </g>

      {/* Cuello de camisa blanca */}
      <rect x="114" y="135" width="22" height="26" fill="url(#animeSkinGrad)" stroke="#27150B" strokeWidth="2.5" />
      <polygon points="102,144 116,138 122,166 96,158" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
      <polygon points="148,144 134,138 128,166 154,158" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />

      {/* Rostro Anime de Alice */}
      <path
        d="M80 74 C80 42, 170 42, 170 74 C170 112, 152 138, 125 142 C98 138, 80 112, 80 74 Z"
        fill="url(#animeSkinGrad)"
        stroke="#27150B"
        strokeWidth="3"
      />

      {/* Orejas */}
      <path d="M75 92 C70 92, 70 108, 78 110" fill="url(#animeSkinGrad)" stroke="#27150B" strokeWidth="2.5" />
      <path d="M175 92 C180 92, 180 108, 172 110" fill="url(#animeSkinGrad)" stroke="#27150B" strokeWidth="2.5" />

      {/* Rubor cálido en las mejillas */}
      <ellipse cx="95" cy="110" rx="7" ry="3.5" fill="#FB7185" fillOpacity="0.45" />
      <ellipse cx="155" cy="110" rx="7" ry="3.5" fill="#FB7185" fillOpacity="0.45" />

      {/* Ojos Castaños Grandes Estilo Anime */}
      {expression === 'happy' || expression === 'celebrating' ? (
        <>
          <path d="M92 96 Q103 85 114 96" stroke="#27150B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M136 96 Q147 85 158 96" stroke="#27150B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          {/* Ojo Izquierdo */}
          <ellipse cx="103" cy="96" rx="10" ry="11.5" fill="#FFFFFF" stroke="#27150B" strokeWidth="2.5" />
          <ellipse cx="104" cy="97" rx="7" ry="8.5" fill="#78350F" />
          <circle cx="104" cy="98" r="3.8" fill="#27150B" />
          <circle cx="100" cy="92" r="2.8" fill="#FFFFFF" />
          <circle cx="107" cy="102" r="1.5" fill="#FFFFFF" />

          {/* Ojo Derecho */}
          <ellipse cx="147" cy="96" rx="10" ry="11.5" fill="#FFFFFF" stroke="#27150B" strokeWidth="2.5" />
          <ellipse cx="146" cy="97" rx="7" ry="8.5" fill="#78350F" />
          <circle cx="146" cy="98" r="3.8" fill="#27150B" />
          <circle cx="142" cy="92" r="2.8" fill="#FFFFFF" />
          <circle cx="149" cy="102" r="1.5" fill="#FFFFFF" />
        </>
      )}

      {/* Gafas de montura oscura redondeada (idénticas a la referencia) */}
      <g>
        <rect
          x="87"
          y="84"
          width="32"
          height="24"
          rx="9"
          fill="#FFFFFF"
          fillOpacity="0.12"
          stroke="#1E293B"
          strokeWidth="3.5"
        />
        <rect
          x="131"
          y="84"
          width="32"
          height="24"
          rx="9"
          fill="#FFFFFF"
          fillOpacity="0.12"
          stroke="#1E293B"
          strokeWidth="3.5"
        />
        {/* Puente de las gafas */}
        <path d="M119 94 Q125 91 131 94" stroke="#1E293B" strokeWidth="3.5" fill="none" />
        {/* Patillas */}
        <line x1="80" y1="92" x2="87" y2="93" stroke="#1E293B" strokeWidth="3" />
        <line x1="163" y1="93" x2="170" y2="92" stroke="#1E293B" strokeWidth="3" />
      </g>

      {/* Cejas expresivas */}
      {expression === 'worried' || expression === 'normal' ? (
        <>
          <line x1="90" y1="77" x2="114" y2="82" stroke="#3E2212" strokeWidth="3" strokeLinecap="round" />
          <line x1="160" y1="77" x2="136" y2="82" stroke="#3E2212" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M90 79 Q102 74 114 79" stroke="#3E2212" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M136 79 Q148 74 160 79" stroke="#3E2212" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Nariz y Boca */}
      <path d="M124 108 L126 111" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
      {expression === 'happy' || expression === 'celebrating' ? (
        <path d="M115 121 Q125 132 135 121 Z" fill="#E11D48" stroke="#27150B" strokeWidth="2" />
      ) : expression === 'worried' ? (
        <path d="M116 125 Q125 120 134 125" stroke="#27150B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M117 123 Q125 120 133 123" stroke="#27150B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}

      {/* Flequillo Castaño con Brillo Anime (Angel Ring) */}
      <path
        d="M72 84 C68 28, 182 28, 178 84 C172 62, 162 74, 156 84 C148 64, 136 74, 126 84 C116 68, 104 64, 94 84 C86 72, 78 64, 72 84 Z"
        fill="url(#brownHairGrad)"
        stroke="#27150B"
        strokeWidth="3"
      />
      {/* Mechones laterales */}
      <path
        d="M74 76 C66 105, 68 138, 78 156 C82 136, 82 108, 84 86 Z"
        fill="url(#brownHairGrad)"
        stroke="#27150B"
        strokeWidth="2.5"
      />
      <path
        d="M176 76 C184 105, 182 138, 172 156 C168 136, 168 108, 166 86 Z"
        fill="url(#brownHairGrad)"
        stroke="#27150B"
        strokeWidth="2.5"
      />
      {/* Brillo de pelo cálido */}
      <path
        d="M92 54 Q125 46 158 54"
        stroke="#D97706"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
};

/**
 * Retrato enmarcado inferior izquierdo (idéntico al recuadro de retrato de la imagen de referencia)
 */
export const CharacterPortrait: React.FC<{
  speaker: 'alice' | 'carlos' | 'system';
  expression: AliceExpression;
}> = ({ speaker, expression }) => {
  if (speaker === 'carlos') {
    return (
      <svg viewBox="0 0 120 120" className="w-full h-full bg-[#E2E8F0]" fill="none">
        {/* Fondo de oficina suave */}
        <rect width="120" height="120" fill="#CBD5E1" />
        {/* Traje de contabilidad */}
        <path d="M20 120 C25 90, 95 90, 100 120 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
        <path d="M55 92 L65 92 L63 120 L57 120 Z" fill="#DC2626" />
        {/* Rostro alterado */}
        <ellipse cx="60" cy="58" rx="26" ry="30" fill="#FCD9BD" stroke="#27150B" strokeWidth="2.5" />
        {/* Gafas rectangulares */}
        <rect x="38" y="50" width="18" height="11" rx="2" fill="#FFFFFF" fillOpacity="0.4" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="64" y="50" width="18" height="11" rx="2" fill="#FFFFFF" fillOpacity="0.4" stroke="#0F172A" strokeWidth="2.5" />
        <line x1="56" y1="55" x2="64" y2="55" stroke="#0F172A" strokeWidth="2.5" />
        {/* Cejas fruncidas */}
        <line x1="38" y1="43" x2="55" y2="48" stroke="#27150B" strokeWidth="3" strokeLinecap="round" />
        <line x1="82" y1="43" x2="65" y2="48" stroke="#27150B" strokeWidth="3" strokeLinecap="round" />
        {/* Boca gritando */}
        <rect x="50" y="72" width="20" height="9" rx="4" fill="#991B1B" stroke="#27150B" strokeWidth="2" />
        {/* Pelo */}
        <path d="M32 50 C32 22, 88 22, 88 50 C78 35, 42 35, 32 50 Z" fill="#451A03" stroke="#27150B" strokeWidth="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="w-full h-full bg-[#DCE4EC]" fill="none">
      <defs>
        <linearGradient id="portHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5A2B" />
          <stop offset="100%" stopColor="#4A2810" />
        </linearGradient>
      </defs>
      {/* Fondo claro azulado-grisáceo como en la miniatura de la imagen */}
      <rect width="120" height="120" fill="#D8E2DC" />
      <line x1="0" y1="30" x2="120" y2="30" stroke="#CBD5E1" strokeWidth="1" />
      <line x1="0" y1="60" x2="120" y2="60" stroke="#CBD5E1" strokeWidth="1" />

      {/* Pelo trasero y coleta lateral */}
      <path d="M22 48 C14 75, 16 105, 28 118 L92 118 C102 105, 102 75, 94 48 Z" fill="url(#portHair)" stroke="#27150B" strokeWidth="2.5" />

      {/* Hombros con camisa blanca y chaleco naranja */}
      <path d="M20 120 C26 94, 94 94, 100 120 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
      <path d="M24 120 L38 98 L50 98 L46 120 Z" fill="#EA580C" stroke="#27150B" strokeWidth="2" />
      <path d="M96 120 L82 98 L70 98 L74 120 Z" fill="#EA580C" stroke="#27150B" strokeWidth="2" />

      {/* Cuello */}
      <rect x="52" y="84" width="16" height="18" fill="#FCD9BD" stroke="#27150B" strokeWidth="2" />

      {/* Rostro */}
      <path d="M32 54 C32 28, 88 28, 88 54 C88 80, 75 95, 60 97 C45 95, 32 80, 32 54 Z" fill="#FFF3E6" stroke="#27150B" strokeWidth="2.5" />

      {/* Ojos castaños */}
      {expression === 'happy' || expression === 'celebrating' ? (
        <>
          <path d="M40 62 Q47 54 54 62" stroke="#27150B" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M66 62 Q73 54 80 62" stroke="#27150B" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <ellipse cx="47" cy="64" rx="6.5" ry="7.5" fill="#FFFFFF" stroke="#27150B" strokeWidth="2" />
          <ellipse cx="48" cy="65" rx="4.5" ry="5.5" fill="#78350F" />
          <circle cx="46" cy="62" r="1.8" fill="#FFFFFF" />

          <ellipse cx="73" cy="64" rx="6.5" ry="7.5" fill="#FFFFFF" stroke="#27150B" strokeWidth="2" />
          <ellipse cx="72" cy="65" rx="4.5" ry="5.5" fill="#78350F" />
          <circle cx="70" cy="62" r="1.8" fill="#FFFFFF" />
        </>
      )}

      {/* Gafas */}
      <rect x="36" y="56" width="22" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.15" stroke="#1E293B" strokeWidth="2.8" />
      <rect x="62" y="56" width="22" height="16" rx="6" fill="#FFFFFF" fillOpacity="0.15" stroke="#1E293B" strokeWidth="2.8" />
      <line x1="58" y1="63" x2="62" y2="63" stroke="#1E293B" strokeWidth="2.8" />

      {/* Cejas */}
      {expression === 'happy' || expression === 'celebrating' ? (
        <>
          <path d="M38 52 Q47 48 55 52" stroke="#3E2212" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M65 52 Q73 48 82 52" stroke="#3E2212" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <line x1="38" y1="50" x2="55" y2="54" stroke="#3E2212" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="82" y1="50" x2="65" y2="54" stroke="#3E2212" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {/* Boca */}
      {expression === 'happy' || expression === 'celebrating' ? (
        <path d="M54 81 Q60 88 66 81 Z" fill="#E11D48" stroke="#27150B" strokeWidth="1.8" />
      ) : (
        <path d="M55 83 Q60 80 65 83" stroke="#27150B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      )}

      {/* Flequillo castaño */}
      <path
        d="M28 56 C26 18, 94 18, 92 56 C86 42, 78 52, 74 58 C66 42, 54 42, 46 58 C38 48, 32 42, 28 56 Z"
        fill="url(#portHair)"
        stroke="#27150B"
        strokeWidth="2.5"
      />
    </svg>
  );
};
