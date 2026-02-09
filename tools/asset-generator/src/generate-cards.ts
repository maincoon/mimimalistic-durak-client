export type Suit = 'd' | 'h' | 'c' | 's';
export type Rank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface CardParams {
  rank: Rank;
  suit: Suit;
}

export interface SuitIcon {
  suit: Suit;
  symbol: string;
  color: string;
}

export const suits: Suit[] = ['d', 'h', 'c', 's'];
export const ranks: Rank[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const suitSymbols: Record<Suit, string> = {
  d: '♦',
  h: '♥',
  c: '♣',
  s: '♠'
};

export const suitColors: Record<Suit, string> = {
  d: 'red',
  h: 'red',
  c: 'black',
  s: 'black'
};

// Procedural suit shapes using standard Unicode glyphs as requested by user.
// Uses text-anchor/dominant-baseline to center the glyph around (0,0).
export function suitShapeFragment(suit: Suit, size = 1, color?: string): string {
  const fill = color ?? suitColors[suit];
  const symbol = suitSymbols[suit];

  // Using a large font size as base, scaled by the size parameter.
  // "Arial" is standard and usually has good geometric suit shapes.
  // dy="0.35em" is a robust way to center vertically (cap-height adjustment) if dominant-baseline is erratic.
  return `
      <g fill="${fill}" transform="scale(${size})">
        <text 
            x="0" 
            y="0" 
            font-size="28" 
            font-family="Arial, sans-serif" 
            text-anchor="middle" 
            dominant-baseline="central"
            dy="1"
        >${symbol}</text>
      </g>`;
}


export function generateCardSVG(params: CardParams): string {
  const { rank, suit } = params;
  const symbol = suitSymbols[suit];
  const color = suitColors[suit];

  // Card dimensions
  const width = 100;
  const height = 140;

  // Layout constants
  const cornerMarginX = 12; // Center X for the corner group
  const cornerMarginY = 22; // Baseline Y for the Rank text

  // Enhanced SVG card: subtle face gradient, inner shadow, centered suit, and mirrored corner (safe inset)
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="cardFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#f6f6f6" stop-opacity="1"/>
      </linearGradient>

      <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feOffset dx="0" dy="1"/>
        <feGaussianBlur stdDeviation="2" result="offset-blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
        <feFlood flood-color="#000" flood-opacity="0.12" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>

      <radialGradient id="centerEmblem" cx="50%" cy="40%" r="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.06"/>
        <stop offset="60%" stop-color="#bfbfbf" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- card base -->
    <rect x="0.75" y="0.75" width="98.5" height="138.5" rx="8" fill="url(#cardFaceGrad)" stroke="#111" stroke-width="1.5" filter="url(#innerShadow)"/>

    <!-- Top-Left Corner: Rank on top, Suit below -->
    <g transform="translate(${cornerMarginX}, ${cornerMarginY})">
        <text x="0" y="0" font-size="20" fill="${color}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">${rank}</text>
        <g transform="translate(0, 18)">
             ${suitShapeFragment(suit, 0.6, color)}
        </g>
    </g>

    <!-- Center Suit -->
    <g transform="translate(50,70)">
        <circle r="14" fill="url(#centerEmblem)" opacity="0.14" />
        ${suitShapeFragment(suit, 1, color)}
    </g>

    <!-- Bottom-Right Corner: Mirrored (Rotated 180) -->
    <g transform="translate(${width - cornerMarginX}, ${height - cornerMarginY}) rotate(180)">
        <text x="0" y="0" font-size="20" fill="${color}" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle">${rank}</text>
        <g transform="translate(0, 18)">
             ${suitShapeFragment(suit, 0.6, color)}
        </g>
    </g>

    <!-- decorative accents replaced with subtle vignette (no small stroked ellipses to avoid rendering artifacts) -->
    <rect x="4" y="8" width="92" height="124" rx="6" fill="none" stroke="none"/>

  </svg>`;
}

export function generateCardBackSVG(): string {
  // Decorative card back: gradient + repeating diamond pattern
  return `<svg width="100" height="140" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="backGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0a5fb0"/>
        <stop offset="100%" stop-color="#07559a"/>
      </linearGradient>

      <pattern id="diagonalPattern" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(25)">
        <rect width="12" height="12" fill="rgba(255,255,255,0.03)"/>
        <path d="M0 6 L6 0" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      </pattern>

      <radialGradient id="backCenter" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
    </defs>

    <rect x="0.75" y="0.75" width="98.5" height="138.5" rx="8" fill="url(#backGrad)" stroke="#081c2b" stroke-width="1.5"/>
    <rect x="6" y="10" width="88" height="120" rx="6" fill="url(#diagonalPattern)" opacity="0.7"/>
    <rect x="6" y="10" width="88" height="120" rx="6" fill="url(#backCenter)"/>

    <!-- decorative central emblem -->
    <g transform="translate(50,70)" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="1.2">
      <circle r="20" opacity="0.9"/>
      <path d="M-6 0 L0 -12 L6 0 L0 12 Z" fill="rgba(255,255,255,0.9)"/>
    </g>
  </svg>`;
}

export function generateSuitIconSVG(suit: Suit): string {
  const color = suitColors[suit];
  // use the procedural fragment for consistent rendering
  // Scale reduced to fit the 28px text base into 32px viewbox
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(16,16)">
        ${suitShapeFragment(suit, 0.9, color)}
      </g>
    </svg>`;
}

export function generateTableBackgroundSVG(): string {
  // Green gradient background
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#0f4d0f;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#2d5a2d;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#greenGradient)"/>
  </svg>`;
}