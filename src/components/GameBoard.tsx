import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Player, Token, COLOR_THEMES } from '../utils/types';

interface GameBoardProps {
  players: Player[];
  onTokenPress: (token: Token) => void;
  colorTheme: string;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = width - 40;
const CELL_SIZE = BOARD_SIZE / 15;

const GameBoard: React.FC<GameBoardProps> = ({ players, onTokenPress, colorTheme }) => {
  const theme = COLOR_THEMES[colorTheme as keyof typeof COLOR_THEMES];

  // Traditional Ludo board positions
  const getBoardCellPosition = (row: number, col: number) => ({
    position: 'absolute' as const,
    top: row * CELL_SIZE,
    left: col * CELL_SIZE,
    width: CELL_SIZE,
    height: CELL_SIZE,
  });

  const renderToken = (token: Token, index: number) => {
    const player = players.find(p => p.id === token.playerId);
    if (!player) return null;

    return (
      <TouchableOpacity
        key={`${token.playerId}-${token.id}`}
        style={[
          styles.token,
          { backgroundColor: player.color },
          getTokenPosition(token, index)
        ]}
        onPress={() => onTokenPress(token)}
      >
        <Text style={styles.tokenText}>{token.id}</Text>
      </TouchableOpacity>
    );
  };

  const getTokenPosition = (token: Token, tokenIndex: number) => {
    if (token.isHome) {
      return getHomePosition(token.playerId, tokenIndex);
    }
    
    if (token.isFinished) {
      return getFinishPosition(token.playerId, tokenIndex);
    }
    
    return getBoardTrackPosition(token.position, token.playerId);
  };

  const getHomePosition = (playerId: number, tokenIndex: number) => {
    // Position tokens in 2x2 grid within each home area
    const homeOffsets = [
      { row: 1, col: 1 }, { row: 1, col: 4 }, { row: 4, col: 1 }, { row: 4, col: 4 }
    ];
    
    const basePositions = [
      { top: CELL_SIZE * 1, left: CELL_SIZE * 1 }, // Red (top-left)
      { top: CELL_SIZE * 1, left: CELL_SIZE * 9 }, // Green (top-right)  
      { top: CELL_SIZE * 9, left: CELL_SIZE * 9 }, // Blue (bottom-right)
      { top: CELL_SIZE * 9, left: CELL_SIZE * 1 }, // Yellow (bottom-left)
    ];

    const base = basePositions[playerId];
    const offset = homeOffsets[tokenIndex];
    
    return {
      position: 'absolute' as const,
      top: base.top + offset.row * (CELL_SIZE * 0.8),
      left: base.left + offset.col * (CELL_SIZE * 0.8),
    };
  };

  const getFinishPosition = (playerId: number, tokenIndex: number) => {
    // Tokens stack in center triangle based on player color
    const centerX = BOARD_SIZE / 2;
    const centerY = BOARD_SIZE / 2;
    const offset = tokenIndex * 8;
    
    const finishPositions = [
      { top: centerY - 30, left: centerX - 15 + offset }, // Red
      { top: centerY - 15 + offset, left: centerX + 10 }, // Green
      { top: centerY + 10, left: centerX - 15 + offset }, // Blue  
      { top: centerY - 15 + offset, left: centerX - 30 }, // Yellow
    ];
    
    return {
      position: 'absolute' as const,
      ...finishPositions[playerId],
    };
  };

  const getBoardTrackPosition = (position: number, playerId: number) => {
    // Classic Ludo track positions for 52-space board
    const trackPositions = [
      // Red starting area and track (positions 1-13)
      ...generateTrackSegment(6, 1, 'horizontal', 6), // Bottom row going right
      ...generateTrackSegment(13, 7, 'vertical', 5),   // Right column going up
      
      // Green starting area and track (positions 14-26)  
      ...generateTrackSegment(8, 13, 'horizontal', -6), // Top row going left
      ...generateTrackSegment(1, 7, 'vertical', 5),     // Left column going down
      
      // Blue starting area and track (positions 27-39)
      ...generateTrackSegment(6, 13, 'horizontal', -6), // Bottom row going left  
      ...generateTrackSegment(1, 7, 'vertical', -5),    // Left column going up
      
      // Yellow starting area and track (positions 40-52)
      ...generateTrackSegment(8, 1, 'horizontal', 6),   // Top row going right
      ...generateTrackSegment(13, 7, 'vertical', -5),   // Right column going down
    ];

    // Calculate actual position considering player's starting offset
    const playerStartOffsets = [0, 13, 26, 39]; // Red, Green, Blue, Yellow
    const adjustedPosition = (position - 1 + playerStartOffsets[playerId]) % 52;
    
    if (adjustedPosition < trackPositions.length) {
      const pos = trackPositions[adjustedPosition];
      return {
        position: 'absolute' as const,
        top: pos.row * CELL_SIZE,
        left: pos.col * CELL_SIZE,
      };
    }
    
    // Default fallback position
    return {
      position: 'absolute' as const,
      top: BOARD_SIZE / 2,
      left: BOARD_SIZE / 2,
    };
  };

  const generateTrackSegment = (startRow: number, startCol: number, direction: 'horizontal' | 'vertical', count: number) => {
    const positions = [];
    for (let i = 0; i < Math.abs(count); i++) {
      if (direction === 'horizontal') {
        positions.push({
          row: startRow,
          col: count > 0 ? startCol + i : startCol - i
        });
      } else {
        positions.push({
          row: count > 0 ? startRow + i : startRow - i,
          col: startCol
        });
      }
    }
    return positions;
  };

  const renderBoardGrid = () => {
    const cells = [];
    
    // Render 15x15 grid
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const isHomeArea = isInHomeArea(row, col);
        const isMainTrack = isInMainTrack(row, col);
        const isColoredPath = isInColoredPath(row, col);
        const isSafeSpot = isInSafeSpot(row, col);
        const isCenter = isInCenter(row, col);
        
        let cellColor = theme.boardColor;
        let borderColor = '#ddd';
        
        if (isCenter) {
          cellColor = '#FFD700'; // Gold center
          borderColor = '#333';
        } else if (isColoredPath) {
          const pathColor = getColoredPathColor(row, col);
          cellColor = pathColor;
          borderColor = '#333';
        } else if (isMainTrack) {
          cellColor = 'white';
          borderColor = '#333';
        } else if (isHomeArea) {
          const homeColor = getHomeAreaColor(row, col);
          cellColor = homeColor;
          borderColor = '#333';
        }
        
        cells.push(
          <View
            key={`${row}-${col}`}
            style={[
              getBoardCellPosition(row, col),
              {
                backgroundColor: cellColor,
                borderWidth: 0.5,
                borderColor: borderColor,
              }
            ]}
          >
            {isSafeSpot && (
              <View style={styles.safeSpotMarker} />
            )}
          </View>
        );
      }
    }
    
    return cells;
  };

  const isInHomeArea = (row: number, col: number) => {
    return (
      (row >= 0 && row <= 5 && col >= 0 && col <= 5) || // Red home (top-left)
      (row >= 0 && row <= 5 && col >= 9 && col <= 14) || // Green home (top-right)
      (row >= 9 && row <= 14 && col >= 9 && col <= 14) || // Blue home (bottom-right)
      (row >= 9 && row <= 14 && col >= 0 && col <= 5) // Yellow home (bottom-left)
    );
  };

  const isInMainTrack = (row: number, col: number) => {
    return (
      (row === 6 && (col >= 0 && col <= 5 || col >= 9 && col <= 14)) || // Horizontal tracks
      (row === 8 && (col >= 0 && col <= 5 || col >= 9 && col <= 14)) ||
      (col === 6 && (row >= 0 && row <= 5 || row >= 9 && row <= 14)) || // Vertical tracks
      (col === 8 && (row >= 0 && row <= 5 || row >= 9 && row <= 14))
    );
  };

  const isInColoredPath = (row: number, col: number) => {
    return (
      (row === 7 && col >= 1 && col <= 5) || // Red path
      (col === 7 && row >= 1 && row <= 5) || // Green path
      (row === 7 && col >= 9 && col <= 13) || // Blue path
      (col === 7 && row >= 9 && row <= 13) // Yellow path
    );
  };

  const isInCenter = (row: number, col: number) => {
    return row >= 6 && row <= 8 && col >= 6 && col <= 8;
  };

  const isInSafeSpot = (row: number, col: number) => {
    const safeSpots = [
      { row: 6, col: 2 }, { row: 6, col: 12 }, // Horizontal safe spots
      { row: 8, col: 2 }, { row: 8, col: 12 },
      { row: 2, col: 6 }, { row: 12, col: 6 }, // Vertical safe spots
      { row: 2, col: 8 }, { row: 12, col: 8 },
    ];
    return safeSpots.some(spot => spot.row === row && spot.col === col);
  };

  const getHomeAreaColor = (row: number, col: number) => {
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return '#ffcccb'; // Light red
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return '#90EE90'; // Light green
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return '#ADD8E6'; // Light blue
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return '#FFFFE0'; // Light yellow
    return theme.boardColor;
  };

  const getColoredPathColor = (row: number, col: number) => {
    if (row === 7 && col >= 1 && col <= 5) return '#FF6B6B'; // Red path
    if (col === 7 && row >= 1 && row <= 5) return '#4ECDC4'; // Green path  
    if (row === 7 && col >= 9 && col <= 13) return '#45B7D1'; // Blue path
    if (col === 7 && row >= 9 && row <= 13) return '#FFA07A'; // Yellow path
    return 'white';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.board, { backgroundColor: theme.boardColor }]}>
        {/* Render board grid */}
        {renderBoardGrid()}
        
        {/* Render all tokens */}
        {players.map(player =>
          player.tokens.map((token, index) => renderToken(token, index))
        )}
        
        {/* Center finish label */}
        <View style={styles.centerLabel}>
          <Text style={styles.centerText}>HOME</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    position: 'relative',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#333',
  },
  token: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 10,
  },
  tokenText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: 'white',
  },
  safeSpotMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginTop: -4,
    marginLeft: -4,
  },
  centerLabel: {
    position: 'absolute',
    top: CELL_SIZE * 7,
    left: CELL_SIZE * 7,
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  centerText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default GameBoard;
