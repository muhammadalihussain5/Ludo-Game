// Game types and interfaces
export interface GameSettings {
  numberOfDice: 1 | 2;
  diceMode: 'sum' | 'choice' | 'both'; // sum: add both dice, choice: pick one, both: use both separately
  numberOfPlayers: 2 | 3 | 4;
  colorTheme: string;
  customRules: {
    mustRollSixToStart: boolean;
    threeSixesExtraTurn: boolean;
    captureReturnsToStart: boolean;
    safeSpots: boolean;
    blockOtherColorSafeSpots: boolean; // New rule
    mandatoryCapture: boolean; // New rule
    showAvailableMoves: boolean; // New toggle
  };
}

export interface Player {
  id: number;
  name: string;
  color: string;
  tokens: Token[];
  isActive: boolean;
}

export interface Token {
  id: number;
  position: number; // 0-56 (0 = home, 1-56 = board positions)
  isHome: boolean;
  isFinished: boolean;
  playerId: number;
}

export interface DiceRoll {
  dice1: number;
  dice2?: number;
  total: number;
  selectedValue?: number; // For choice mode
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gamePhase: 'setup' | 'playing' | 'finished';
  lastRoll: DiceRoll | null;
  settings: GameSettings;
  winner: Player | null;
}

export const COLOR_THEMES = {
  classic: {
    name: 'Classic',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'], // Red, Green, Blue, Yellow
    boardColor: '#FFF8DC',
    pathColor: '#F5F5F5'
  },
  neon: {
    name: 'Neon',
    colors: ['#FF1493', '#00FFFF', '#FF4500', '#ADFF2F'], // Deep Pink, Cyan, Orange Red, Green Yellow
    boardColor: '#1A1A1A',
    pathColor: '#333333'
  },
  pastel: {
    name: 'Pastel',
    colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#F0E68C'], // Light Pink, Pale Green, Sky Blue, Khaki
    boardColor: '#F8F8FF',
    pathColor: '#E6E6FA'
  },
  ocean: {
    name: 'Ocean',
    colors: ['#20B2AA', '#4682B4', '#1E90FF', '#00CED1'], // Light Sea Green, Steel Blue, Dodger Blue, Dark Turquoise
    boardColor: '#F0F8FF',
    pathColor: '#E0F6FF'
  }
};

export const DEFAULT_SETTINGS: GameSettings = {
  numberOfDice: 1,
  diceMode: 'sum',
  numberOfPlayers: 4,
  colorTheme: 'classic',
  customRules: {
    mustRollSixToStart: true,
    threeSixesExtraTurn: true,
    captureReturnsToStart: true,
    safeSpots: true,
    blockOtherColorSafeSpots: false,
    mandatoryCapture: false,
    showAvailableMoves: true
  }
};
