import { GameSettings, Player, Token, DiceRoll } from './types';

export class LudoGameEngine {
  // Board positions: 0 = home, 1-52 = main track, 53-56 = home stretch
  private BOARD_SIZE = 52;
  private HOME_STRETCH_SIZE = 4;
  private SAFE_POSITIONS = [1, 9, 14, 22, 27, 35, 40, 48]; // Safe spots on board
  
  // Safe spots by color (each player has specific safe spots)
  private PLAYER_SAFE_SPOTS = {
    0: [1, 14], // Red player safe spots
    1: [14, 27], // Green player safe spots  
    2: [27, 40], // Blue player safe spots
    3: [40, 1], // Yellow player safe spots
  };

  generateDiceRoll(numberOfDice: number): DiceRoll {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    
    if (numberOfDice === 1) {
      return {
        dice1,
        total: dice1
      };
    } else {
      const dice2 = Math.floor(Math.random() * 6) + 1;
      return {
        dice1,
        dice2,
        total: dice1 + dice2
      };
    }
  }

  canMoveToken(token: Token, roll: DiceRoll, settings: GameSettings, allTokens: Token[] = []): boolean {
    if (token.isFinished) return false;
    
    // If token is at home, can only move with 6 (if rule is enabled)
    if (token.isHome && settings.customRules.mustRollSixToStart) {
      return roll.dice1 === 6 || (roll.dice2 !== undefined && roll.dice2 === 6);
    }

    // Check if destination is blocked by safe spot rule
    if (settings.customRules.blockOtherColorSafeSpots && !token.isHome) {
      const moveValue = roll.selectedValue || roll.dice1;
      const newPosition = this.calculateNewPosition(token, moveValue, token.playerId);
      
      if (this.isDestinationBlocked(newPosition, token.playerId, allTokens)) {
        return false;
      }
    }
    
    return true;
  }

  isDestinationBlocked(position: number, playerId: number, allTokens: Token[]): boolean {
    // Check if position is a safe spot
    if (!this.SAFE_POSITIONS.includes(position)) {
      return false;
    }

    // Check if this safe spot belongs to current player
    const playerSafeSpots = this.PLAYER_SAFE_SPOTS[playerId as keyof typeof this.PLAYER_SAFE_SPOTS] || [];
    const isOwnSafeSpot = playerSafeSpots.includes(position);

    // If it's not their own safe spot, check if it's occupied
    if (!isOwnSafeSpot) {
      const isOccupied = allTokens.some(token => 
        token.position === position && 
        !token.isHome && 
        !token.isFinished &&
        token.playerId !== playerId
      );
      return isOccupied;
    }

    return false;
  }

  calculateNewPosition(token: Token, moveValue: number, playerId: number): number {
    if (token.isHome) {
      return this.getStartPosition(playerId);
    }

    const currentPos = token.position;
    const newPos = currentPos + moveValue;
    
    // Calculate player's home entry position
    const homeEntryPos = this.getStartPosition(playerId) + 51;
    
    // If passing home entry, move to home stretch
    if (currentPos < homeEntryPos && newPos >= homeEntryPos) {
      const overflow = newPos - homeEntryPos;
      return this.BOARD_SIZE + overflow + 1; // Home stretch positions
    }
    
    // Normal movement on main track
    if (newPos <= this.BOARD_SIZE) {
      return newPos;
    }
    
    // Wrap around the board
    return newPos - this.BOARD_SIZE;
  }

  getStartPosition(playerId: number): number {
    // Each player starts at different position on the board
    const startPositions = [1, 14, 27, 40]; // Red, Green, Blue, Yellow starting positions
    return startPositions[playerId] || 1;
  }

  checkCapture(movedToken: Token, allTokens: Token[], settings: GameSettings): Token[] {
    const capturedTokens: Token[] = [];
    
    if (!settings.customRules.captureReturnsToStart) {
      return capturedTokens;
    }

    // Check if any enemy tokens are on the same position
    allTokens.forEach(token => {
      if (token.playerId !== movedToken.playerId && 
          token.position === movedToken.position && 
          !token.isHome && 
          !token.isFinished) {
        
        // Check if position is safe
        if (settings.customRules.safeSpots && this.SAFE_POSITIONS.includes(token.position)) {
          return; // Can't capture on safe spots
        }
        
        capturedTokens.push(token);
      }
    });

    return capturedTokens;
  }

  // New method to check if a capture is possible for any move
  checkMandatoryCapture(player: Player, roll: DiceRoll, allTokens: Token[], settings: GameSettings): { token: Token, captureTarget: Token, moveValue: number } | null {
    if (!settings.customRules.mandatoryCapture) {
      return null;
    }

    const possibleMoves = this.getAvailableMoves(player, roll, settings, allTokens);
    
    for (const move of possibleMoves) {
      const newPosition = this.calculateNewPosition(move.token, move.moveValue, move.token.playerId);
      
      // Check if this move would capture an opponent
      const targetToken = allTokens.find(token => 
        token.playerId !== player.id &&
        token.position === newPosition &&
        !token.isHome &&
        !token.isFinished &&
        !(settings.customRules.safeSpots && this.SAFE_POSITIONS.includes(newPosition))
      );

      if (targetToken) {
        return {
          token: move.token,
          captureTarget: targetToken,
          moveValue: move.moveValue
        };
      }
    }

    return null;
  }

  checkWin(player: Player): boolean {
    return player.tokens.every(token => token.isFinished);
  }

  isValidMove(token: Token, moveValue: number, settings: GameSettings): boolean {
    if (token.isFinished || token.isHome) return false;
    
    const newPos = this.calculateNewPosition(token, moveValue, token.playerId);
    
    // Check if move would go beyond finish line
    if (newPos > this.BOARD_SIZE + this.HOME_STRETCH_SIZE) {
      return false;
    }
    
    return true;
  }

  getAvailableMoves(player: Player, roll: DiceRoll, settings: GameSettings, allTokens: Token[] = []): { token: Token, moveValue: number }[] {
    const availableMoves: { token: Token, moveValue: number }[] = [];
    
    if (settings.diceMode === 'sum' && roll.dice2 !== undefined) {
      // Use sum of both dice
      player.tokens.forEach(token => {
        if (this.canMoveToken(token, roll, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.total });
        }
      });
    } else if (settings.diceMode === 'choice' && roll.dice2 !== undefined) {
      // Player can choose which die to use
      player.tokens.forEach(token => {
        if (this.canMoveToken(token, { dice1: roll.dice1, total: roll.dice1 }, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.dice1 });
        }
        if (this.canMoveToken(token, { dice1: roll.dice2!, total: roll.dice2! }, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.dice2! });
        }
      });
    } else if (settings.diceMode === 'both' && roll.dice2 !== undefined) {
      // Use both dice separately (can move same token twice or different tokens)
      player.tokens.forEach(token => {
        if (this.canMoveToken(token, { dice1: roll.dice1, total: roll.dice1 }, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.dice1 });
        }
        if (this.canMoveToken(token, { dice1: roll.dice2!, total: roll.dice2! }, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.dice2! });
        }
      });
    } else {
      // Single die
      player.tokens.forEach(token => {
        if (this.canMoveToken(token, roll, settings, allTokens)) {
          availableMoves.push({ token, moveValue: roll.dice1 });
        }
      });
    }
    
    return availableMoves;
  }
}
