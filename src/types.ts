export type GameScreen = 'title' | 'select' | 'playing' | 'detained' | 'gameover' | 'victory';

export interface Character {
  id: string;
  name: string;
  subtitle: string;
  hindiName: string;
  role: string;
  trait: string;
  description: string;
  color: string;
  accentColor: string;
  cardBg: string;
  avatarIcon: string;
  slogan: string;
  speedMultiplier: number;
  jumpMultiplier: number;
  armorMultiplier: number; // lower means takes less damage
  canDoubleJump?: boolean;
  isWheelchair?: boolean;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'barricade' | 'police_lathi' | 'police_bus' | 'water_cannon' | 'tear_gas';
  cleared?: boolean;
  hit?: boolean;
  speedX?: number;
  stateTimer?: number;
  actionPhase?: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'chai' | 'megaphone' | 'constitution' | 'samosa';
  collected?: boolean;
  bobOffset?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  text?: string;
  shape?: 'circle' | 'square' | 'confetti' | 'text' | 'star';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  scale: number;
}
