import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { DiceRoll, GameSettings } from '../utils/types';

interface DiceComponentProps {
  onRoll: (roll: DiceRoll) => void;
  settings: GameSettings;
  isRolling: boolean;
  lastRoll: DiceRoll | null;
  canRoll: boolean;
}

const DiceComponent: React.FC<DiceComponentProps> = ({
  onRoll,
  settings,
  isRolling,
  lastRoll,
  canRoll,
}) => {
  const [animatedValue] = useState(new Animated.Value(1));

  const rollDice = () => {
    if (!canRoll || isRolling) return;

    // Animate dice roll
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Generate roll after animation
    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      let roll: DiceRoll;

      if (settings.numberOfDice === 2) {
        const dice2 = Math.floor(Math.random() * 6) + 1;
        roll = {
          dice1,
          dice2,
          total: dice1 + dice2,
        };
      } else {
        roll = {
          dice1,
          total: dice1,
        };
      }

      onRoll(roll);
    }, 300);
  };

  const selectDiceValue = (value: number) => {
    if (lastRoll && settings.diceMode === 'choice') {
      const updatedRoll = { ...lastRoll, selectedValue: value };
      onRoll(updatedRoll);
    }
  };

  const renderDie = (value: number, isSelected?: boolean) => {
    const dots = [];
    
    // Create dot pattern based on dice value
    const dotPatterns: { [key: number]: any[] } = {
      1: [{ top: '40%' as const, left: '40%' as const }],
      2: [
        { top: '20%' as const, left: '20%' as const }, 
        { bottom: '20%' as const, right: '20%' as const }
      ],
      3: [
        { top: '20%' as const, left: '20%' as const },
        { top: '40%' as const, left: '40%' as const },
        { bottom: '20%' as const, right: '20%' as const }
      ],
      4: [
        { top: '20%' as const, left: '20%' as const },
        { top: '20%' as const, right: '20%' as const },
        { bottom: '20%' as const, left: '20%' as const },
        { bottom: '20%' as const, right: '20%' as const }
      ],
      5: [
        { top: '20%' as const, left: '20%' as const },
        { top: '20%' as const, right: '20%' as const },
        { top: '40%' as const, left: '40%' as const },
        { bottom: '20%' as const, left: '20%' as const },
        { bottom: '20%' as const, right: '20%' as const }
      ],
      6: [
        { top: '15%' as const, left: '20%' as const },
        { top: '15%' as const, right: '20%' as const },
        { top: '40%' as const, left: '20%' as const },
        { top: '40%' as const, right: '20%' as const },
        { bottom: '15%' as const, left: '20%' as const },
        { bottom: '15%' as const, right: '20%' as const }
      ],
    };

    const pattern = dotPatterns[value] || [];

    return (
      <View style={[
        styles.die,
        isSelected && styles.selectedDie,
        !canRoll && styles.disabledDie
      ]}>
        {pattern.map((position, index) => (
          <View
            key={index}
            style={[styles.dot, position]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {isRolling ? 'Rolling...' : canRoll ? 'Tap to roll dice' : 'Waiting...'}
      </Text>

      <Animated.View style={[
        styles.diceContainer,
        { transform: [{ scale: animatedValue }] }
      ]}>
        {lastRoll ? (
          <View style={styles.diceRow}>
            <TouchableOpacity
              onPress={() => settings.diceMode === 'choice' && lastRoll.dice2 ? selectDiceValue(lastRoll.dice1) : undefined}
              disabled={settings.diceMode !== 'choice' || !lastRoll.dice2}
            >
              {renderDie(lastRoll.dice1, lastRoll.selectedValue === lastRoll.dice1)}
            </TouchableOpacity>

            {settings.numberOfDice === 2 && lastRoll.dice2 && (
              <TouchableOpacity
                onPress={() => settings.diceMode === 'choice' ? selectDiceValue(lastRoll.dice2!) : undefined}
                disabled={settings.diceMode !== 'choice'}
              >
                {renderDie(lastRoll.dice2, lastRoll.selectedValue === lastRoll.dice2)}
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity onPress={rollDice} disabled={!canRoll}>
            <View style={styles.diceRow}>
              {renderDie(6)}
              {settings.numberOfDice === 2 && renderDie(6)}
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>

      {lastRoll && (
        <View style={styles.rollInfo}>
          <Text style={styles.rollText}>
            {settings.numberOfDice === 1 
              ? `Rolled: ${lastRoll.dice1}`
              : settings.diceMode === 'sum'
              ? `Rolled: ${lastRoll.dice1} + ${lastRoll.dice2} = ${lastRoll.total}`
              : settings.diceMode === 'choice'
              ? `Choose: ${lastRoll.dice1} or ${lastRoll.dice2}${lastRoll.selectedValue ? ` (Selected: ${lastRoll.selectedValue})` : ''}`
              : `Use both: ${lastRoll.dice1} and ${lastRoll.dice2}`
            }
          </Text>
        </View>
      )}

      {!lastRoll && canRoll && (
        <TouchableOpacity style={styles.rollButton} onPress={rollDice}>
          <Text style={styles.rollButtonText}>Roll Dice</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  diceContainer: {
    marginVertical: 10,
  },
  diceRow: {
    flexDirection: 'row',
    gap: 15,
  },
  die: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedDie: {
    borderColor: '#FF6B35',
    borderWidth: 3,
    backgroundColor: '#FFF8E1',
  },
  disabledDie: {
    opacity: 0.5,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  rollInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  rollText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  rollButton: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  rollButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DiceComponent;
