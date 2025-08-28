import React, { useState } from 'react';
import {
  StatusBar,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import SettingsScreen from './screens/SettingsScreen';
import GameScreen from './screens/GameScreen';
import { DEFAULT_SETTINGS, GameSettings } from './utils/types';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'game'>('settings');
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleBackToSettings = () => {
    setCurrentScreen('settings');
  };

  const handleSettingsChange = (newSettings: GameSettings) => {
    setGameSettings(newSettings);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6a1b9a" barStyle="light-content" />
      
      {currentScreen === 'settings' ? (
        <SettingsScreen
          settings={gameSettings}
          onSettingsChange={handleSettingsChange}
          onStartGame={handleStartGame}
        />
      ) : (
        <GameScreen
          initialSettings={gameSettings}
          onBackToSettings={handleBackToSettings}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
