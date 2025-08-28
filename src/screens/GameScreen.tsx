import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { GameState, Player, Token, DiceRoll, COLOR_THEMES, DEFAULT_SETTINGS } from '../utils/types';
import { LudoGameEngine } from '../utils/gameEngine';
import GameBoard from '../components/GameBoard';
import DiceComponent from '../components/DiceComponent';

interface GameScreenProps {
  initialSettings: typeof DEFAULT_SETTINGS;
  onBackToSettings: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ initialSettings, onBackToSettings }) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(initialSettings));
  const [gameEngine] = useState(new LudoGameEngine());
  const [isRolling, setIsRolling] = useState(false);
  const [availableMoves, setAvailableMoves] = useState<{ token: Token, moveValue: number }[]>([]);
  const [mandatoryCapture, setMandatoryCapture] = useState<{ token: Token, captureTarget: Token, moveValue: number } | null>(null);
  const [turnEnded, setTurnEnded] = useState(false);

  function initializeGame(settings: typeof DEFAULT_SETTINGS): GameState {
    const theme = COLOR_THEMES[settings.colorTheme as keyof typeof COLOR_THEMES];
    const players: Player[] = [];

    for (let i = 0; i < settings.numberOfPlayers; i++) {
      const tokens: Token[] = [];
      for (let j = 0; j < 4; j++) {
        tokens.push({
          id: j + 1,
          position: 0,
          isHome: true,
          isFinished: false,
          playerId: i,
        });
      }

      players.push({
        id: i,
        name: `Player ${i + 1}`,
        color: theme.colors[i],
        tokens,
        isActive: i === 0,
      });
    }

    return {
      players,
      currentPlayerIndex: 0,
      gamePhase: 'playing',
      lastRoll: null,
      settings,
      winner: null,
    };
  }

  const handleDiceRoll = (roll: DiceRoll) => {
    setIsRolling(false);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const allTokens = gameState.players.flatMap(p => p.tokens);
    
    setGameState(prev => ({ ...prev, lastRoll: roll }));

    // Check for mandatory capture first
    const mandatoryCaptureMove = gameEngine.checkMandatoryCapture(currentPlayer, roll, allTokens, gameState.settings);
    if (mandatoryCaptureMove) {
      setMandatoryCapture(mandatoryCaptureMove);
      setAvailableMoves([]); // No other moves allowed when capture is mandatory
      return;
    }

    // Get available moves for this roll
    const moves = gameEngine.getAvailableMoves(currentPlayer, roll, gameState.settings, allTokens);
    
    // Only show moves if setting is enabled
    if (gameState.settings.customRules.showAvailableMoves) {
      setAvailableMoves(moves);
    } else {
      setAvailableMoves([]); // Don't show available moves
    }

    // If no moves available, automatically end turn
    if (moves.length === 0) {
      setTimeout(() => {
        nextTurn();
      }, 1000);
    }
  };

  const handleTokenPress = (token: Token) => {
    if (!gameState.lastRoll) return;

    const allTokens = gameState.players.flatMap(p => p.tokens);
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    // Handle mandatory capture
    if (mandatoryCapture) {
      if (mandatoryCapture.token.id === token.id && mandatoryCapture.token.playerId === token.playerId) {
        moveToken(token, mandatoryCapture.moveValue);
        setMandatoryCapture(null);
      } else {
        Alert.alert('Mandatory Capture', 'You must capture the opponent\'s piece!');
      }
      return;
    }

    // Check if this move is valid
    const moveValue = gameState.lastRoll.selectedValue || gameState.lastRoll.dice1;
    const canMove = gameEngine.canMoveToken(token, gameState.lastRoll, gameState.settings, allTokens);
    
    if (!canMove) {
      Alert.alert('Invalid Move', 'This token cannot be moved with the current roll.');
      return;
    }

    // If available moves are shown, check if this is in the list
    if (gameState.settings.customRules.showAvailableMoves) {
      const move = availableMoves.find(m => m.token.id === token.id && m.token.playerId === token.playerId);
      if (!move) {
        Alert.alert('Invalid Move', 'This token cannot be moved with the current roll.');
        return;
      }
      moveToken(token, move.moveValue);
    } else {
      // Manual move validation
      moveToken(token, moveValue);
    }
  };

  const moveToken = (token: Token, moveValue: number) => {
    const allTokens = gameState.players.flatMap(p => p.tokens);
    const newPosition = gameEngine.calculateNewPosition(token, moveValue, token.playerId);
    
    // Check if move is valid
    if (!gameEngine.isValidMove(token, moveValue, gameState.settings)) {
      Alert.alert('Invalid Move', 'This move is not allowed.');
      return;
    }
    
    setGameState(prev => {
      const newState = { ...prev };
      const playerIndex = newState.players.findIndex(p => p.id === token.playerId);
      const tokenIndex = newState.players[playerIndex].tokens.findIndex(t => t.id === token.id);
      
      // Update token position
      const updatedToken = { ...newState.players[playerIndex].tokens[tokenIndex] };
      updatedToken.position = newPosition;
      updatedToken.isHome = false;
      
      // Check if token finished
      if (newPosition > 56) {
        updatedToken.isFinished = true;
      }
      
      newState.players[playerIndex].tokens[tokenIndex] = updatedToken;

      // Check for captures
      const capturedTokens = gameEngine.checkCapture(updatedToken, allTokens, gameState.settings);
      
      // Handle captured tokens
      capturedTokens.forEach(capturedToken => {
        const capturedPlayerIndex = newState.players.findIndex(p => p.id === capturedToken.playerId);
        const capturedTokenIndex = newState.players[capturedPlayerIndex].tokens.findIndex(t => t.id === capturedToken.id);
        newState.players[capturedPlayerIndex].tokens[capturedTokenIndex] = {
          ...capturedToken,
          position: 0,
          isHome: true,
          isFinished: false,
        };
      });

      return newState;
    });

    // Check for win
    setTimeout(() => {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (gameEngine.checkWin(currentPlayer)) {
        setGameState(prev => ({ ...prev, winner: currentPlayer, gamePhase: 'finished' }));
        Alert.alert('Game Over!', `${currentPlayer.name} wins!`, [
          { text: 'New Game', onPress: () => setGameState(initializeGame(gameState.settings)) },
          { text: 'Settings', onPress: onBackToSettings }
        ]);
        return;
      }

      // Check if player gets another turn (rolled 6 or captured)
      const shouldGetAnotherTurn = gameState.lastRoll?.dice1 === 6 || 
                                   (gameState.lastRoll?.dice2 === 6) ||
                                   (gameEngine.checkCapture(token, gameState.players.flatMap(p => p.tokens), gameState.settings).length > 0);
      
      if (!shouldGetAnotherTurn) {
        nextTurn();
      } else {
        // Clear last roll to allow new roll
        setGameState(prev => ({ ...prev, lastRoll: null }));
        setAvailableMoves([]);
        setMandatoryCapture(null);
      }
    }, 500);
  };

  const nextTurn = () => {
    setGameState(prev => {
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const newState = { ...prev };
      
      // Update active player
      newState.players.forEach((player, index) => {
        player.isActive = index === nextPlayerIndex;
      });
      
      newState.currentPlayerIndex = nextPlayerIndex;
      newState.lastRoll = null;
      
      return newState;
    });
    
    setAvailableMoves([]);
    setMandatoryCapture(null);
    setTurnEnded(false);
  };

  // Handle mandatory capture timeout - return piece to home
  const handleMandatoryCaptureTimeout = () => {
    if (mandatoryCapture) {
      const tokenToReturn = mandatoryCapture.token;
      
      setGameState(prev => {
        const newState = { ...prev };
        const playerIndex = newState.players.findIndex(p => p.id === tokenToReturn.playerId);
        const tokenIndex = newState.players[playerIndex].tokens.findIndex(t => t.id === tokenToReturn.id);
        
        // Return token to home
        newState.players[playerIndex].tokens[tokenIndex] = {
          ...tokenToReturn,
          position: 0,
          isHome: true,
          isFinished: false,
        };
        
        return newState;
      });

      Alert.alert(
        'Penalty!', 
        'You failed to capture when required. Your piece has been returned to start.',
        [{ text: 'OK', onPress: () => {
          setMandatoryCapture(null);
          nextTurn();
        }}]
      );
    }
  };

  const startRoll = () => {
    if (gameState.lastRoll || isRolling) return;
    setIsRolling(true);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const theme = COLOR_THEMES[gameState.settings.colorTheme as keyof typeof COLOR_THEMES];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.boardColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackToSettings}>
          <Text style={styles.backButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors[0] }]}>Ludo Game</Text>
      </View>

      {/* Current Player Info */}
      <View style={[styles.playerInfo, { backgroundColor: currentPlayer.color + '40' }]}>
        <Text style={styles.currentPlayerText}>
          {currentPlayer.name}'s Turn
        </Text>
        <Text style={styles.gameMode}>
          {gameState.settings.numberOfDice === 2 
            ? `${gameState.settings.diceMode.toUpperCase()} mode` 
            : 'Single die mode'}
        </Text>
      </View>

      {/* Game Board */}
      <GameBoard
        players={gameState.players}
        onTokenPress={handleTokenPress}
        colorTheme={gameState.settings.colorTheme}
      />

      {/* Dice Section */}
      <DiceComponent
        onRoll={handleDiceRoll}
        settings={gameState.settings}
        isRolling={isRolling}
        lastRoll={gameState.lastRoll}
        canRoll={!gameState.lastRoll && !isRolling}
      />

      {/* Available Moves */}
      {availableMoves.length > 0 && gameState.settings.customRules.showAvailableMoves && (
        <View style={styles.movesSection}>
          <Text style={styles.movesTitle}>Available Moves:</Text>
          <View style={styles.movesList}>
            {availableMoves.map((move, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.moveButton, { backgroundColor: currentPlayer.color }]}
                onPress={() => handleTokenPress(move.token)}
              >
                <Text style={styles.moveText}>
                  Token {move.token.id}: +{move.moveValue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Mandatory Capture Warning */}
      {mandatoryCapture && (
        <View style={[styles.warningSection, { backgroundColor: '#FF6B35' }]}>
          <Text style={styles.warningTitle}>⚠️ MANDATORY CAPTURE!</Text>
          <Text style={styles.warningText}>
            You must capture opponent's Token {mandatoryCapture.captureTarget.id} with your Token {mandatoryCapture.token.id}
          </Text>
          <Text style={styles.warningSubtext}>
            If you don't capture, your piece will return to start!
          </Text>
          <View style={styles.warningButtons}>
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: currentPlayer.color }]}
              onPress={() => handleTokenPress(mandatoryCapture.token)}
            >
              <Text style={styles.captureButtonText}>
                Capture with Token {mandatoryCapture.token.id}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleMandatoryCaptureTimeout}
            >
              <Text style={styles.skipButtonText}>Skip (Return to Start)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Help Text for Manual Mode */}
      {!gameState.settings.customRules.showAvailableMoves && !mandatoryCapture && gameState.lastRoll && (
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Manual Move Mode</Text>
          <Text style={styles.helpText}>
            Tap any of your tokens to move them. Valid moves will be executed automatically.
          </Text>
          <Text style={styles.helpSubtext}>
            Roll value: {gameState.lastRoll.selectedValue || gameState.lastRoll.dice1}
          </Text>
        </View>
      )}

      {/* Players Status */}
      <View style={styles.playersStatus}>
        <Text style={styles.statusTitle}>Players Status:</Text>
        {gameState.players.map(player => (
          <View key={player.id} style={[
            styles.playerStatus,
            { borderLeftColor: player.color, backgroundColor: player.isActive ? player.color + '20' : 'transparent' }
          ]}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.tokenStatus}>
              Home: {player.tokens.filter(t => t.isHome).length} | 
              Playing: {player.tokens.filter(t => !t.isHome && !t.isFinished).length} | 
              Finished: {player.tokens.filter(t => t.isFinished).length}
            </Text>
          </View>
        ))}
      </View>

      {/* Roll Button */}
      {!gameState.lastRoll && !isRolling && (
        <TouchableOpacity
          style={[styles.rollButton, { backgroundColor: currentPlayer.color }]}
          onPress={startRoll}
        >
          <Text style={styles.rollButtonText}>Roll Dice</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerInfo: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  currentPlayerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  gameMode: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
  },
  movesSection: {
    padding: 20,
  },
  movesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  movesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moveButton: {
    padding: 10,
    borderRadius: 15,
    minWidth: 80,
  },
  moveText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  playersStatus: {
    padding: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  playerStatus: {
    padding: 10,
    borderLeftWidth: 4,
    marginVertical: 5,
    borderRadius: 5,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tokenStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rollButton: {
    margin: 20,
    padding: 15,
    borderRadius: 25,
  },
  rollButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warningSection: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  warningSubtext: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  warningButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  captureButton: {
    padding: 12,
    borderRadius: 20,
  },
  captureButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  skipButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#666',
  },
  skipButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpSection: {
    margin: 20,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  helpSubtext: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default GameScreen;
