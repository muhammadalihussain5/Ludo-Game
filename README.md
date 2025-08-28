# 🎲 Ludo Game - React Native

A customizable Ludo game built with React Native featuring traditional board layout, dice customization, and advanced gameplay rules.

## 🚀 Features

- **Traditional Ludo Board**: Classic 15x15 cross-shaped layout
- **Dice Customization**: Play with 1 or 2 dice (sum/choice/both modes)
- **Advanced Rules**: Safe spot blocking, mandatory capture, manual moves
- **Color Themes**: Multiple color schemes for visual customization
- **4-Player Support**: Full multiplayer gameplay

## 📱 Development Setup

### Prerequisites:
- Node.js 18+
- React Native CLI
- Android Studio (for local development)

### Installation:
```bash
# Install dependencies
npm install

# Start Metro bundler
npx react-native start

# Run on Android (requires Android Studio setup)
npx react-native run-android
```

## 🔧 Project Structure

```
src/
├── components/
│   ├── DiceComponent.tsx    # Animated dice with multiple modes
│   └── GameBoard.tsx        # Traditional Ludo board layout
├── screens/
│   ├── GameScreen.tsx       # Main gameplay screen
│   └── SettingsScreen.tsx   # Game customization
├── utils/
│   ├── gameEngine.ts        # Core game logic
│   └── types.ts             # TypeScript definitions
└── App.tsx                  # Main app component
```

## 🎮 Game Features

### Customizable Gameplay:
- **Single or Double Dice**: Choose 1 or 2 dice
- **Dice Modes**: Sum, Choice, or Both modes for 2-dice play
- **Advanced Rules**: Safe spot blocking, mandatory capture
- **Manual Moves**: No automatic move suggestions

### Visual Customization:
- **Color Themes**: Classic, Neon, Pastel, Ocean
- **Traditional Board**: Authentic 15x15 cross layout
- **Player Colors**: Red, Green, Blue, Yellow

## 📦 Building APK

The project includes GitHub Actions workflow for automatic APK building:

1. Push code to GitHub repository
2. Go to Actions tab → "React Native APK Build"
3. Download the generated APK from artifacts

## � Game Rules

- Roll dice to move tokens around the board
- Get all 4 tokens to the center to win
- Capture opponent tokens by landing on them
- Safe spots protect tokens from capture
- Customizable rules for competitive play

## 🔧 Built With

- React Native 0.72+
- TypeScript
- Custom game engine
- Traditional Ludo rules implementation

## Game Description

This is a feature-rich Ludo game where players can customize every aspect of gameplay including:
- Number of dice (1 or 2)
- Dice usage modes (sum, choice, or separate)
- Color themes
- Custom rules
- Number of players (2-4)

## Features

### 🎮 Customizable Gameplay
- **Single or Double Dice**: Choose to play with 1 or 2 dice
- **Dice Modes for 2-Dice Play**:
  - **Sum Mode**: Add both dice values together
  - **Choice Mode**: Select which die value to use
  - **Both Mode**: Use both dice separately (two moves per turn)

### 🎨 Visual Customization
- **Multiple Color Themes**: Classic, Neon, Pastel, and Ocean themes
- **Dynamic UI**: Colors adapt based on selected theme
- **Player Identification**: Each player has distinct colors

### ⚙️ Advanced Custom Rules
- **Must roll 6 to start**: Traditional rule requiring a 6 to move tokens from home
- **Three 6s extra turn**: Get additional turn for rolling three consecutive 6s
- **Capture returns to start**: Captured tokens return to home base
- **Safe spots**: Designated safe positions on the board
- **🆕 Block safe spots when occupied**: If a player occupies another color's safe spot, others can't use it until vacated
- **🆕 Mandatory capture**: Players must capture when possible, or their piece returns to start
- **🆕 Show available moves**: Toggle automatic move highlighting on/off

### 🎯 Game Features
- **2-4 Players**: Support for 2, 3, or 4 players
- **Smart Move Detection**: Automatically shows available moves
- **Win Detection**: Automatic game end when a player gets all tokens home
- **Turn Management**: Automatic turn switching with visual indicators
- **Token Animation**: Smooth token movement and positioning

## Prerequisites

Before running this project, make sure you have:

1. **Node.js** (version 16 or higher)
2. **React Native CLI** (`npm install -g react-native-cli`)
3. **Android Studio** with Android SDK
4. **Java Development Kit (JDK 11)**
5. **Android device or emulator**

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Android Setup
Make sure you have Android Studio installed and configured with:
- Android SDK (API level 28 or higher)
- Android Virtual Device (AVD) or a physical Android device with USB debugging enabled

### 3. Start Metro Bundler
```bash
npm start
```

### 4. Run on Android
In a new terminal window:
```bash
npm run android
```

## How to Play

### Setup
1. **Configure Game Settings**:
   - Choose number of players (2-4)
   - Select number of dice (1 or 2)
   - If using 2 dice, choose usage mode:
     - **Sum**: Move total of both dice
     - **Choice**: Pick one die value to use
     - **Both**: Make two separate moves
   - Select color theme
   - Enable/disable custom rules

2. **Start Game**: Tap "Start Game" to begin

### Gameplay
1. **Roll Dice**: Tap the dice or "Roll Dice" button
2. **Move Tokens**: 
   - If "Show available moves" is enabled: Available moves are highlighted
   - If disabled: Tap any token to attempt a move (manual mode)
   - For 2-dice choice mode, select which die value to use first
3. **Mandatory Capture**: When capture is possible and rule is enabled:
   - You MUST capture the opponent's piece
   - Failing to capture returns your piece to start
4. **Safe Spot Blocking**: When enabled:
   - If you occupy another player's safe spot, they can't land there
   - Only applies to safe spots that don't belong to the current player
5. **Win Condition**: Get all 4 tokens to the finish area

### Special Rules
- **Starting**: Tokens need a 6 to leave home (if rule enabled)
- **Capturing**: Landing on opponent's token sends it back to start
- **Safe Spots**: Certain board positions protect tokens from capture
- **Extra Turns**: Rolling a 6 or capturing gives another turn

## Development

### Project Structure
```
src/
  ├── App.tsx          # Main game component
index.js               # Entry point
package.json           # Dependencies and scripts
```

### Scripts
- `npm start` - Start the Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Customization Ideas

You can extend this game by adding:
- Different types of obstacles
- Power-ups and special effects
- Sound effects and background music
- Multiple levels with increasing difficulty
- Local high score storage
- Different player characters
- Animated sprites

## Troubleshooting

If you encounter issues:

1. **Metro bundler won't start**: Try `npx react-native start --reset-cache`
2. **Android build fails**: Make sure Android SDK is properly configured
3. **Device not detected**: Enable USB debugging on your Android device

## Contributing

Feel free to fork this project and add your own features!

## License

This project is open source and available under the MIT License.
"# Ludo-Game" 
"# Ludo-Game" 
"# Ludo-Game" 
