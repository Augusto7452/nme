import React from 'react';

interface DmeLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const DmeLogo: React.FC<DmeLogoProps> = ({
  className = 'w-16 h-16',
  size,
  showGlow = true,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      style={style}
      role="img"
      aria-label="Emblema Oficial - Divisão de Monitoramento Eletrônico"
    >
      <defs>
        {/* Gradientes Metálicos em Ouro Nobre */}
        <linearGradient id="dmeGold1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="75%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="dmeGold2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        {/* Fundo Azul Tático Institucional */}
        <radialGradient id="dmeNavy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="65%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        <radialGradient id="dmeRadar" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#0284c7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
        </radialGradient>

        {/* Efeitos de Iluminação e Brilho */}
        <filter id="dmeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="dmeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.75" />
        </filter>

        {/* Arcos Curvos para Tipografia Heráldica */}
        <path id="dmeArcTop" d="M 68 256 A 188 188 0 0 1 444 256" fill="none" />
        <path id="dmeArcBottom" d="M 436 256 A 180 180 0 0 1 76 256" fill="none" />
      </defs>

      <g filter={showGlow ? 'url(#dmeShadow)' : undefined}>
        {/* Borda Externa em Ouro e Anel Protetor */}
        <circle cx="256" cy="256" r="248" fill="url(#dmeGold1)" stroke="#451a03" strokeWidth="2" />
        <circle cx="256" cy="256" r="236" fill="#090d16" stroke="url(#dmeGold2)" strokeWidth="4" />

        {/* Rebites / Marcadores Cardeais */}
        <circle cx="256" cy="14" r="3.5" fill="#fde047" />
        <circle cx="498" cy="256" r="3.5" fill="#fde047" />
        <circle cx="256" cy="498" r="3.5" fill="#fde047" />
        <circle cx="14" cy="256" r="3.5" fill="#fde047" />

        {/* Anel Preto de Texto Oficial */}
        <circle cx="256" cy="256" r="226" fill="#020617" stroke="url(#dmeGold1)" strokeWidth="3" />

        {/* Texto Superior: DIVISÃO DE MONITORAMENTO ELETRÔNICO */}
        <text
          fill="url(#dmeGold1)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20.5"
          fontWeight="900"
          letterSpacing="3.2"
        >
          <textPath href="#dmeArcTop" startOffset="50%" textAnchor="middle">
            DIVISÃO DE MONITORAMENTO ELETRÔNICO
          </textPath>
        </text>

        {/* Estrelas Laterais em Ouro */}
        <g transform="translate(42, 256) scale(0.9)">
          <polygon points="0,-10 3,-3 10,-3 5,2 7,9 0,5 -7,9 -5,2 -10,-3 -3,-3" fill="url(#dmeGold1)" />
        </g>
        <g transform="translate(470, 256) scale(0.9)">
          <polygon points="0,-10 3,-3 10,-3 5,2 7,9 0,5 -7,9 -5,2 -10,-3 -3,-3" fill="url(#dmeGold1)" />
        </g>

        {/* Texto Inferior: POLÍCIA PENAL · IAPEN · AP */}
        <text
          fill="url(#dmeGold1)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="19"
          fontWeight="900"
          letterSpacing="4.5"
        >
          <textPath href="#dmeArcBottom" startOffset="50%" textAnchor="middle">
            POLÍCIA PENAL • IAPEN • AP
          </textPath>
        </text>

        {/* Medalhão Central Azul Tático com Radar */}
        <circle cx="256" cy="256" r="162" fill="url(#dmeNavy)" stroke="url(#dmeGold2)" strokeWidth="5" />
        <circle cx="256" cy="256" r="148" fill="url(#dmeRadar)" />
        <circle cx="256" cy="256" r="140" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.4" />
        <circle cx="256" cy="256" r="105" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.35" />
        <circle cx="256" cy="256" r="70" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.45" />
        <line x1="256" y1="116" x2="256" y2="396" stroke="#0284c7" strokeWidth="1.2" opacity="0.3" />
        <line x1="116" y1="256" x2="396" y2="256" stroke="#0284c7" strokeWidth="1.2" opacity="0.3" />

        {/* ÁGUIA IMPERIAL DOURADA (Vigilância e Força Policial) */}
        <g filter={showGlow ? 'url(#dmeGlow)' : undefined}>
          <path
            d="M 256 160 C 220 135 170 145 130 180 C 145 195 165 205 185 210 C 150 215 135 235 125 255 C 145 260 168 262 188 260 C 160 275 148 298 142 322 C 162 318 185 310 205 298 C 190 325 185 348 186 365 C 205 348 226 325 240 300 Z"
            fill="url(#dmeGold1)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          <path
            d="M 256 160 C 292 135 342 145 382 180 C 367 195 347 205 327 210 C 362 215 377 235 387 255 C 367 260 344 262 324 260 C 352 275 364 298 370 322 C 350 318 327 310 307 298 C 322 325 327 348 326 365 C 307 348 286 325 272 300 Z"
            fill="url(#dmeGold1)"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          <path
            d="M 256 138 C 248 138 244 144 246 152 C 248 160 252 165 256 168 C 260 165 264 160 266 152 C 268 144 264 138 256 138 Z"
            fill="url(#dmeGold2)"
          />
          <polygon points="256,150 262,156 256,162 250,156" fill="#fffbeb" />
          <polygon points="256,158 260,165 256,172 252,165" fill="#f59e0b" />
        </g>

        {/* ESCUDO CENTRAL TÁTICO */}
        <g filter={showGlow ? 'url(#dmeShadow)' : undefined}>
          <path
            d="M 256 175 L 324 200 V 278 C 324 330 292 368 256 384 C 220 368 188 330 188 278 V 200 Z"
            fill="#090d16"
            stroke="url(#dmeGold1)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path
            d="M 256 185 L 316 207 V 276 C 316 322 288 357 256 372 C 224 357 196 322 196 276 V 207 Z"
            fill="url(#dmeNavy)"
            stroke="url(#dmeGold2)"
            strokeWidth="2.5"
          />

          {/* ONDAS GPS TELEMÁTICAS */}
          <path d="M 232 224 A 28 28 0 0 1 280 224" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M 240 232 A 18 18 0 0 1 272 232" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="256" cy="240" r="4.5" fill="#fde047" />

          {/* TORNOZELEIRA ELETRÔNICA DE MONITORAMENTO */}
          <path
            d="M 226 252 C 226 244 286 244 286 252 L 282 280 C 282 286 230 286 230 280 Z"
            fill="#1e293b"
            stroke="url(#dmeGold1)"
            strokeWidth="2"
          />
          <rect x="238" y="248" width="36" height="34" rx="6" fill="#020617" stroke="url(#dmeGold2)" strokeWidth="2" />

          {/* LEDs DE STATUS OPERACIONAL */}
          <circle cx="247" cy="257" r="2.8" fill="#10b981" />
          <circle cx="256" cy="257" r="2.8" fill="#38bdf8" />
          <circle cx="265" cy="257" r="2.8" fill="#f59e0b" />

          {/* ALVO DE RASTREAMENTO */}
          <circle cx="256" cy="270" r="6" fill="none" stroke="#fde047" strokeWidth="1.5" />
          <circle cx="256" cy="270" r="2" fill="#fde047" />

          {/* FAIXA COM SIGLA DME */}
          <g transform="translate(0, 10)">
            <path d="M 214 298 L 298 298 L 290 318 L 256 324 L 222 318 Z" fill="url(#dmeGold1)" stroke="#78350f" strokeWidth="1.5" />
            <text x="256" y="315" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="14" fontWeight="900" fill="#020617" letterSpacing="3">
              DME
            </text>
          </g>

          {/* BALANÇA DA LEI E JUSTIÇA */}
          <path d="M 256 340 L 256 358 M 244 346 L 268 346 M 244 346 L 241 354 M 268 346 L 271 354" stroke="url(#dmeGold1)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 238 354 C 241 358 247 358 250 354 Z" fill="url(#dmeGold1)" />
          <path d="M 262 354 C 265 358 271 358 274 354 Z" fill="url(#dmeGold1)" />
        </g>

        {/* RAMOS DE LOURO DOURADOS */}
        <g fill="url(#dmeGold1)" stroke="#78350f" strokeWidth="0.8">
          <ellipse cx="206" cy="380" rx="9" ry="4" transform="rotate(-35 206 380)" />
          <ellipse cx="192" cy="365" rx="9" ry="4" transform="rotate(-45 192 365)" />
          <ellipse cx="180" cy="346" rx="9" ry="4" transform="rotate(-55 180 346)" />
          <ellipse cx="172" cy="324" rx="9" ry="4" transform="rotate(-65 172 324)" />

          <ellipse cx="306" cy="380" rx="9" ry="4" transform="rotate(35 306 380)" />
          <ellipse cx="320" cy="365" rx="9" ry="4" transform="rotate(45 320 365)" />
          <ellipse cx="332" cy="346" rx="9" ry="4" transform="rotate(55 332 346)" />
          <ellipse cx="340" cy="324" rx="9" ry="4" transform="rotate(65 340 324)" />
        </g>
      </g>
    </svg>
  );
};
