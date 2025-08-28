import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { GameSettings, COLOR_THEMES } from '../utils/types';

interface SettingsScreenProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStartGame: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onSettingsChange,
  onStartGame,
}) => {
  const updateSettings = (key: keyof GameSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const updateCustomRule = (key: keyof GameSettings['customRules'], value: boolean) => {
    onSettingsChange({
      ...settings,
      customRules: { ...settings.customRules, [key]: value }
    });
  };

  const currentTheme = COLOR_THEMES[settings.colorTheme as keyof typeof COLOR_THEMES];

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.boardColor }]}>
      <Text style={[styles.title, { color: currentTheme.colors[0] }]}>Ludo Game Settings</Text>

      {/* Number of Players */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Players</Text>
        <View style={styles.optionRow}>
          {[2, 3, 4].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                settings.numberOfPlayers === num && { backgroundColor: currentTheme.colors[0] }
              ]}
              onPress={() => updateSettings('numberOfPlayers', num)}
            >
              <Text style={[
                styles.optionText,
                settings.numberOfPlayers === num && { color: 'white' }
              ]}>
                {num} Players
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Number of Dice */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Dice</Text>
        <View style={styles.optionRow}>
          {[1, 2].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                settings.numberOfDice === num && { backgroundColor: currentTheme.colors[1] }
              ]}
              onPress={() => updateSettings('numberOfDice', num)}
            >
              <Text style={[
                styles.optionText,
                settings.numberOfDice === num && { color: 'white' }
              ]}>
                {num} {num === 1 ? 'Die' : 'Dice'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Dice Mode (only shown when using 2 dice) */}
      {settings.numberOfDice === 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dice Usage Mode</Text>
          <View style={styles.optionColumn}>
            {[
              { key: 'sum', label: 'Add Both Dice', desc: 'Move total of both dice' },
              { key: 'choice', label: 'Choose One Die', desc: 'Pick which die value to use' },
              { key: 'both', label: 'Use Both Separately', desc: 'Make two separate moves' }
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.modeButton,
                  settings.diceMode === mode.key && { backgroundColor: currentTheme.colors[2] }
                ]}
                onPress={() => updateSettings('diceMode', mode.key)}
              >
                <Text style={[
                  styles.modeTitle,
                  settings.diceMode === mode.key && { color: 'white' }
                ]}>
                  {mode.label}
                </Text>
                <Text style={[
                  styles.modeDesc,
                  settings.diceMode === mode.key && { color: 'white' }
                ]}>
                  {mode.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Color Theme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Theme</Text>
        <View style={styles.themeGrid}>
          {Object.entries(COLOR_THEMES).map(([key, theme]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.themeButton,
                { backgroundColor: theme.boardColor },
                settings.colorTheme === key && styles.selectedTheme
              ]}
              onPress={() => updateSettings('colorTheme', key)}
            >
              <Text style={styles.themeName}>{theme.name}</Text>
              <View style={styles.colorPreview}>
                {theme.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[styles.colorDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Custom Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Rules</Text>
        
        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Must roll 6 to start</Text>
          <Switch
            value={settings.customRules.mustRollSixToStart}
            onValueChange={(value) => updateCustomRule('mustRollSixToStart', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[0] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Three 6s give extra turn</Text>
          <Switch
            value={settings.customRules.threeSixesExtraTurn}
            onValueChange={(value) => updateCustomRule('threeSixesExtraTurn', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[1] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Capture returns token to start</Text>
          <Switch
            value={settings.customRules.captureReturnsToStart}
            onValueChange={(value) => updateCustomRule('captureReturnsToStart', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[2] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Safe spots protect tokens</Text>
          <Switch
            value={settings.customRules.safeSpots}
            onValueChange={(value) => updateCustomRule('safeSpots', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[3] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Block safe spots when occupied by others</Text>
          <Switch
            value={settings.customRules.blockOtherColorSafeSpots}
            onValueChange={(value) => updateCustomRule('blockOtherColorSafeSpots', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[0] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Must capture when possible (or return home)</Text>
          <Switch
            value={settings.customRules.mandatoryCapture}
            onValueChange={(value) => updateCustomRule('mandatoryCapture', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[1] }}
          />
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleText}>Show available moves automatically</Text>
          <Switch
            value={settings.customRules.showAvailableMoves}
            onValueChange={(value) => updateCustomRule('showAvailableMoves', value)}
            trackColor={{ false: '#767577', true: currentTheme.colors[2] }}
          />
        </View>
      </View>

      {/* Start Game Button */}
      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: currentTheme.colors[0] }]}
        onPress={onStartGame}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginVertical: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionColumn: {
    flexDirection: 'column',
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  modeButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modeDesc: {
    fontSize: 12,
    color: '#666',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTheme: {
    borderColor: '#333',
    borderWidth: 3,
  },
  themeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  colorDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  ruleText: {
    fontSize: 16,
    flex: 1,
  },
  startButton: {
    padding: 20,
    borderRadius: 25,
    marginVertical: 30,
    marginHorizontal: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;
