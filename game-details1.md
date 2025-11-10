# AI Dungeon Master - Complete Game Instructions (Part 1)

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Screens and Pages](#screens-and-pages)
4. [Character System](#character-system)
5. [Genre System](#genre-system)
6. [Story System](#story-system)
7. [Combat System](#combat-system)
8. [Inventory System](#inventory-system)
9. [Quest System](#quest-system)

---

## Introduction

### Game Title and Description

**AI Dungeon Master** is an immersive, AI-powered text-based adventure game that combines dynamic story generation with turn-based combat and character progression. Built with React, TypeScript, and powered by Google Gemini AI, the game offers an endless adventure where your choices shape the narrative.

### What the Game is About

In AI Dungeon Master, you create a character and embark on an epic adventure across multiple genres. The game uses advanced AI to generate unique stories based on your choices, creating a personalized narrative experience. Every decision you make influences the story, combat encounters, and your character's progression.

### Core Gameplay Loop

1. **Create Your Character** - Choose a class, name, gender, and language
2. **Select a Genre** - Pick your adventure setting (Fantasy, Sci-Fi, Mystery, or Mythical)
3. **Explore the Story** - Read AI-generated narrative and make choices
4. **Engage in Combat** - Fight enemies using turn-based combat mechanics
5. **Complete Quests** - Follow main and side quests to progress
6. **Manage Inventory** - Collect, use, and equip items
7. **Level Up** - Gain experience and improve your character
8. **Save Progress** - Continue your adventure anytime

### Target Audience

- Players who enjoy text-based RPGs and interactive fiction
- Fans of AI-generated content and dynamic storytelling
- RPG enthusiasts looking for replayable adventures
- Players who want multilingual gaming experiences (English, Kannada, Telugu)

---

## Getting Started

### How to Launch the Game

1. Open the game in your web browser
2. The game will load the **Intro Screen** (Home page)
3. If you're a returning player, you can load a saved game
4. If you're new, click "Begin Your Journey" or "New Game"

### First-Time Setup

**For New Players:**
1. Click "Begin Your Journey" on the Intro Screen
2. You'll be taken to the Character Setup screen
3. Create your character (see Character System section)
4. Select a genre for your adventure
5. Start playing!

**For Returning Players:**
1. Sign in with Google (optional but recommended for cloud saves)
2. Click "Load Saved Game" to continue your adventure
3. Or click "New Game" to start fresh

### Account Creation (Google Sign-In)

**Benefits of Signing In:**
- Cloud save functionality
- Access to leaderboards
- Profile tracking
- Social features (cameos, sharing)

**How to Sign In:**
1. On the Intro Screen, click "Sign in with Google"
2. Select your Google account
3. Grant necessary permissions
4. Your profile will be created automatically

**Note:** You can play without signing in, but your saves will be local only.

### Navigation Basics

- **Back Button** (←) - Returns to the previous screen
- **Settings Icon** (⚙️) - Opens settings menu
- **Menu Button** (☰) - Opens main game menu
- **Close Button** (×) - Closes modals and overlays

---

## Screens and Pages

### Intro Screen (Home)

**Purpose:** The main entry point of the game where players start new adventures or continue existing ones.

**Visual Elements:**
- Animated background with dungeon theme
- Floating particle effects
- Game title: "AI Dungeon Master"
- Subtitle: "Where Your Choices Shape Destiny"

**Buttons and Functions:**

1. **Mini-Game Arcade Button** (Top Left)
   - Icon: Sparkles (✨)
   - Function: Opens the mini-game arcade hub
   - Location: Top-left corner

2. **Profile Button** (Top Right - if signed in)
   - Icon: User (👤)
   - Function: Opens your profile page
   - Shows: Your name and avatar

3. **Settings Button** (Top Right)
   - Icon: Settings (⚙️)
   - Function: Opens settings menu
   - Access: Available from any screen

4. **Logout Button** (Top Right - if signed in)
   - Icon: LogOut
   - Function: Signs you out of your account

5. **Begin Your Journey Button** (Main - for non-signed-in users)
   - Icon: Play (▶️)
   - Function: Starts character creation
   - Action: Navigates to Character Setup screen

6. **Load Saved Game Button** (Main - for signed-in users)
   - Icon: BookOpen (📖)
   - Function: Loads your most recent save
   - Action: Shows load dialog or directly loads game

7. **New Game Button** (Main - for signed-in users)
   - Icon: Play (▶️)
   - Function: Starts a new adventure
   - Action: Shows confirmation dialog if saves exist, then navigates to Character Setup

8. **Sign in with Google Button** (Bottom)
   - Function: Initiates Google OAuth sign-in
   - Shows: Google logo and sign-in text
   - Note: Only visible if not already signed in

9. **Theme Toggle Button** (Bottom)
   - Icon: Sun/Moon
   - Function: Switches between light and dark mode

**Navigation Paths:**
- Intro → Character Setup (via "Begin Your Journey" or "New Game")
- Intro → Settings (via Settings button)
- Intro → Profile (via Profile button - if signed in)
- Intro → Mini-Game Arcade (via Arcade button)

---

### Character Setup

**Purpose:** Create your hero by choosing class, name, gender, and story language.

**Visual Elements:**
- Character portrait (changes based on selected class)
- Class selection cards with icons
- Name input field
- Gender selection buttons
- Language selection buttons

**Buttons and Functions:**

1. **Back Button** (Top Left)
   - Icon: ArrowLeft (←)
   - Function: Returns to Intro Screen

2. **Random Name Button** (Next to name field)
   - Icon: Dice6 (🎲)
   - Function: Generates a random fantasy name
   - Action: Fills the name field with a random name

3. **Class Selection Cards** (Three options)
   - **Warrior Card**
     - Icon: Swords (⚔️)
     - Stats: STR 10, INT 5, AGI 7, HP 100
     - Starting Items: Rusty Sword, Leather Armor, Health Potion
     - Description: "Master of combat and strength"
     - Info Button (ℹ️): Shows detailed class information
   
   - **Mage Card**
     - Icon: Wand2 (🪄)
     - Stats: STR 5, INT 10, AGI 6, HP 80
     - Starting Items: Apprentice Staff, Spellbook, Mana Potion
     - Description: "Wielder of arcane powers"
     - Info Button (ℹ️): Shows detailed class information
   
   - **Rogue Card**
     - Icon: Zap (⚡)
     - Stats: STR 7, INT 6, AGI 10, HP 90
     - Starting Items: Dual Daggers, Lockpicks, Poison Vial
     - Description: "Swift and cunning assassin"
     - Info Button (ℹ️): Shows detailed class information

4. **Gender Selection Buttons**
   - Options: Male, Female, Other
   - Function: Sets your character's gender
   - Visual: Selected button is highlighted

5. **Story Language Selection Buttons**
   - Options: English, Kannada, Telugu
   - Function: Sets the language for all story text
   - Location: Below gender buttons
   - Note: This affects AI-generated story content

6. **Begin Adventure Button** (Bottom)
   - Icon: ArrowRight (→)
   - Function: Creates your character and starts the game
   - Requirements: Name must be entered
   - Action: Navigates to Genre Selection screen

**Navigation Paths:**
- Character Setup → Intro (via Back button)
- Character Setup → Genre Selection (via "Begin Adventure" button)

**Tips:**
- Hover over class cards to see detailed stats
- Click the info icon (ℹ️) on class cards for lore and starting items
- Your name can be auto-filled from Google account if signed in
- Language selection affects all story text, choices, and item names

---

### Genre Selection

**Purpose:** Choose the world and setting for your adventure.

**Visual Elements:**
- Four genre cards with background images
- Genre-specific color themes
- Preview text that appears on hover
- Animated background that changes based on hover

**Available Genres:**

1. **Fantasy**
   - Icon: Castle (🏰)
   - Theme: Medieval settings, magic, dragons, quests
   - Preview: "You stand before an ancient castle..."
   - Popularity Badge: "Most Popular"
   - Color: Amber/Yellow gradient

2. **Sci-Fi**
   - Icon: Rocket (🚀)
   - Theme: Space, technology, aliens, futuristic settings
   - Locations: Real solar system (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Sun, Moon)
   - Preview: "Your starship drifts near an unknown planet..."
   - Popularity Badge: "Futuristic"
   - Color: Cyan/Blue gradient

3. **Mystery**
   - Icon: Search (🔍)
   - Theme: Puzzles, hidden conspiracies, enigmatic stories
   - Preview: "A cryptic letter arrives at your door..."
   - Popularity Badge: "Thrilling"
   - Color: Purple/Indigo gradient

4. **Mythical**
   - Icon: Sparkles (✨)
   - Theme: Gods, legendary creatures, divine quests
   - Preview: "The gods have chosen you for a divine quest..."
   - Popularity Badge: "Epic"
   - Color: Rose/Pink gradient

**Buttons and Functions:**

1. **Back Button** (Top Left)
   - Icon: ArrowRight (←)
   - Function: Returns to Character Setup

2. **Genre Cards** (Clickable)
   - Function: Selects the genre and starts the game
   - Action: Navigates directly to Main Game UI
   - Hover Effect: Shows preview text and changes background theme

**Navigation Paths:**
- Genre Selection → Character Setup (via Back button)
- Genre Selection → Main Game UI (via selecting a genre)

**Tips:**
- Hover over genre cards to see story previews
- Fantasy is recommended for first-time players
- Sci-Fi uses real solar system locations (no fictional planets)
- Each genre has unique items, enemies, and story themes

---

### Main Game UI

**Purpose:** The primary gameplay screen where you read stories, make choices, and interact with the game world.

**Visual Elements:**
- Parallax background (dungeon theme)
- Story text display area (center)
- Choice buttons (bottom)
- Top HUD with player stats
- Side panels for quests, inventory, etc.

**Top HUD Elements:**

**Left Section:**
- **Player Name and Info**
  - Shows: Character name, Level, Class
  - Badge: Current dungeon floor (if applicable)

- **Health Bar**
  - Icon: Heart (❤️)
  - Shows: Current HP / Max HP
  - Visual: Progress bar with red color

- **XP Bar**
  - Icon: Zap (⚡)
  - Shows: Current XP / Max XP
  - Visual: Progress bar with primary color

- **Coins Display**
  - Icon: Coin (🪙)
  - Shows: Current coin count
  - Visual: Yellow badge with border

**Center Section:**
- **Quest Progress Bar** (if active quest)
  - Icon: Target (🎯)
  - Shows: Quest title and progress percentage
  - Visual: Progress bar
  - Badge: "Quest Complete!" when at 100%

- **Cameos Display** (if active)
  - Icon: Users (👥)
  - Shows: Active cameo companions (up to 3)
  - Badge: "+X" if more than 3 cameos

**Right Section:**
- **Quick Save Slots** (if saves exist)
  - Icon: Save (💾)
  - Shows: Up to 3 numbered save buttons (1, 2, 3)
  - Function: Click to load that save instantly

- **Quick Action Buttons:**
  - **Inventory Button** (Package icon)
    - Function: Opens inventory modal
  - **Adventure Log Button** (Book icon)
    - Function: Opens story log modal
  - **Quest Button** (Target icon)
    - Function: Opens quest tracker
  - **World Map Button** (Map icon)
    - Function: Opens world map modal
  - **Character Sheet Button** (User icon)
    - Function: Opens character stats
  - **Statistics Button** (BarChart3 icon)
    - Function: Opens statistics dashboard
  - **Share Button** (Share2 icon)
    - Function: Opens share modal
  - **Achievements Button** (Trophy icon)
    - Function: Opens achievements gallery
  - **Settings Button** (Settings icon)
    - Function: Opens settings menu
  - **Menu Button** (Menu icon)
    - Function: Opens main game menu
  - **Help Button** (HelpCircle icon)
    - Function: Shows help tooltip

**Main Content Area:**

**Story Display:**
- Shows AI-generated story text
- Letter-by-letter animation (2x speed)
- Scrollable if text is long
- Background: Card with glow effect

**Choice Buttons:**
- Appear below story text
- Usually 3 choices (can vary)
- Click to make a choice
- Disabled during story generation
- Visual: Buttons with hover effects

**Combat Overlay** (when in combat):
- Shows enemy information
- Combat actions available
- See Combat System section for details

**Puzzle Panel** (during final puzzle):
- Shows puzzle question
- Choice buttons become answer options
- See Story System section for details

**Modals and Overlays:**
- Quest Dialog (when quest is received)
- Game Over Screen (on defeat)
- Daily Rewards Modal (on login)
- Various other modals (see respective sections)

**Buttons and Functions:**

1. **Choice Buttons** (Main Action)
   - Function: Makes a story choice
   - Action: Generates next story segment
   - Note: Instant response via pre-generation system

2. **Attack Choice** (During Combat)
   - Function: Initiates combat
   - Action: Shows weapon selection if weapons available
   - Alternative: "Fight with fists" if no weapons

3. **Weapon Selection** (During Combat)
   - Function: Select weapon to attack with
   - Shows: All weapons in inventory
   - Action: Resolves combat turn

**Navigation Paths:**
- Main Game UI → Settings (via Settings button)
- Main Game UI → Shop (via menu)
- Main Game UI → Crafting (via menu)
- Main Game UI → Codex (via menu)
- Main Game UI → Profile (via menu)
- Main Game UI → Intro (via Exit/Logout)

**Tips:**
- Story text animates quickly for better flow
- Choices are pre-generated for instant responses
- Use quick save slots for frequent saves
- Check quest progress in the top HUD
- All modals can be closed with X or clicking outside

---

### Settings

**Purpose:** Configure game preferences, accessibility options, and manage saves.

**Visual Elements:**
- Three tabs: General, Accessibility, Save Management
- Sliders for adjustable settings
- Toggle switches for on/off options

**Buttons and Functions:**

1. **Back Button** (Top)
   - Icon: ArrowLeft (←)
   - Function: Returns to previous screen
   - Logic: Returns to game if active session, otherwise to intro

**General Tab:**

2. **Text Speed Slider**
   - Range: Slow (10) to Fast (100)
   - Function: Controls story text animation speed
   - Default: Medium speed

3. **Sound Effects Toggle**
   - Icon: Volume2
   - Function: Enables/disables sound effects
   - Default: Enabled

4. **Background Music Toggle**
   - Icon: Music
   - Function: Enables/disables background music
   - Default: Enabled

**Accessibility Tab:**

5. **Font Size Slider**
   - Range: Small (12px) to Large (24px)
   - Function: Adjusts text size throughout the game
   - Default: 16px
   - Note: Saved to localStorage

6. **High Contrast Mode Toggle**
   - Icon: Eye
   - Function: Increases contrast for better visibility
   - Default: Disabled
   - Note: Saved to localStorage

7. **Reduce Motion Toggle**
   - Icon: Move
   - Function: Reduces animations for accessibility
   - Default: Disabled
   - Note: Saved to localStorage

**Save Management Tab:**

8. **Import Button**
   - Icon: Upload
   - Function: Imports a save file from your computer
   - Format: JSON file

9. **Save List Items:**
   - Each save shows:
     - Save name
     - Last updated timestamp
   - Actions per save:
     - **Rename Button**: Edit save name
     - **Export Button** (Download icon): Download save as JSON
     - **Delete Button** (Trash icon): Permanently delete save

**Navigation Paths:**
- Settings → Game (via Back button - if active game)
- Settings → Intro (via Back button - if no active game)

**Tips:**
- Settings are automatically saved
- Font size and accessibility options persist across sessions
- Export saves for backup before deleting
- Sign in to access cloud save management

---

## Character System

### Character Classes

**Warrior**
- **Description:** Master of combat and strength
- **Starting Stats:**
  - Strength (STR): 10
  - Intelligence (INT): 5
  - Agility (AGI): 7
  - Health Points (HP): 100
- **Starting Items:**
  - Rusty Sword (weapon)
  - Leather Armor (armor)
  - Health Potion (consumable)
- **Playstyle:** Frontline fighter, high HP, strong attacks
- **Best For:** Players who prefer direct combat

**Mage**
- **Description:** Wielder of arcane powers
- **Starting Stats:**
  - Strength (STR): 5
  - Intelligence (INT): 10
  - Agility (AGI): 6
  - Health Points (HP): 80
- **Starting Items:**
  - Apprentice Staff (weapon)
  - Spellbook (item)
  - Mana Potion (consumable)
- **Playstyle:** Magic-focused, versatile spells, lower HP
- **Best For:** Players who enjoy strategic combat

**Rogue**
- **Description:** Swift and cunning assassin
- **Starting Stats:**
  - Strength (STR): 7
  - Intelligence (INT): 6
  - Agility (AGI): 10
  - Health Points (HP): 90
- **Starting Items:**
  - Dual Daggers (weapon)
  - Lockpicks (item)
  - Poison Vial (consumable)
- **Playstyle:** High speed, critical hits, agile
- **Best For:** Players who prefer fast, precise combat

### Stats Explanation

**Strength (STR)**
- Affects: Physical attack damage
- Important For: Warriors
- Increases: Melee weapon effectiveness

**Intelligence (INT)**
- Affects: Magic damage, spell effectiveness
- Important For: Mages
- Increases: Spell power, mana pool

**Agility (AGI)**
- Affects: Attack speed, dodge chance, critical hit rate
- Important For: Rogues
- Increases: Evasion, action speed

**Health Points (HP)**
- Affects: How much damage you can take
- Maximum: Varies by class and level
- Restoration: Health potions, rest, certain items

### Gender Selection

**Options:**
- Male
- Female
- Other

**Function:** Sets your character's gender identity. This may affect story dialogue and character interactions in some scenarios.

### Language Selection

**Available Languages:**
- **English (en)**
  - Default language
  - Full game support

- **Kannada (kn)**
  - All story text in Kannada
  - Item names translated
  - Choices in Kannada

- **Telugu (te)**
  - All story text in Telugu
  - Item names translated
  - Choices in Telugu

**Location:** Character Setup screen, below gender buttons

**Function:** Sets the language for:
- All AI-generated story text
- Quest titles and descriptions
- Item names
- Choice options
- Combat messages

**Note:** Language selection is instant and affects the entire game experience.

### Character Progression

**Level System:**
- Start at Level 1
- Gain XP through:
  - Completing quests
  - Defeating enemies
  - Solving puzzles
  - Story progression milestones

**Experience Points (XP):**
- Displayed in top HUD
- Progress bar shows: Current XP / Max XP
- Level up when XP reaches Max XP
- Max XP increases with each level

**Level Up Benefits:**
- Increased max HP
- Stat improvements
- Access to new abilities
- Unlock new content (recipes, areas, etc.)

**Starting Items Per Class:**

**Warrior:**
- Rusty Sword (weapon, +attack)
- Leather Armor (armor, +defense)
- Health Potion (restores HP)

**Mage:**
- Apprentice Staff (weapon, +magic)
- Spellbook (item, enables spells)
- Mana Potion (restores MP)

**Rogue:**
- Dual Daggers (weapon, +speed, +critical)
- Lockpicks (item, opens locked areas)
- Poison Vial (consumable, applies poison effect)

---

## Genre System

### Available Genres

**Fantasy**
- **Theme:** Medieval settings, magic, dragons, quests, kingdoms, enchanted forests, wizards, knights, ancient artifacts, mystical creatures, dungeons, castles, villages
- **Story Themes:**
  - Protecting villages from goblins
  - Finding lost magical artifacts
  - Rescuing kidnapped princesses
  - Finding lost villagers
  - Rescuing village children kidnapped by creatures
  - Helping wizards recover stolen spellbooks
  - Exploring ancient dragon lairs
  - Finding legendary swords
- **Items:** Medieval weapons and items (Sword, Shield, Bow, Mace, Dagger, Staff, Armor, Helmet, Potion, Scroll, Enchanted Ring, Magic Wand, Crossbow, Axe, Spear, Chainmail, Gauntlets, Boots)
- **Locations:** Villages, castles, forests, dungeons, mountains, caves

**Sci-Fi**
- **Theme:** Space, technology, aliens, futuristic settings, space stations, planets, robots, cybernetics, space travel, advanced weapons, holograms, space colonies
- **Story Themes:**
  - Investigating distress signals from Mars colony
  - Rescuing scientists on Jupiter's moon Europa
  - Finding lost data cores on Mercury
  - Repairing damaged ships near Saturn
  - Exploring mining bases on the Moon
  - Stopping rogue AIs on Venus
  - Finding rare energy crystals on Neptune
  - Investigating strange signals from Pluto
  - Exploring research stations in Earth's orbit
  - Investigating anomalies on Uranus
  - Helping colonists on Mars
  - Searching for survivors on the Sun's solar station
- **Items:** Modern weapons like PUBG/Free Fire (Assault Rifle, Pistol, Grenade, Bomb, Sniper Rifle, SMG, Shotgun, Energy Rifle, Plasma Gun, Laser Pistol, Frag Grenade, Smoke Grenade, Body Armor, Helmet, Medkit, Energy Shield, Tech Scanner, Cybernetic Implant)
- **Locations:** Real solar system locations only (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Sun, Moon)

**Mystery**
- **Theme:** Puzzles, hidden conspiracies, enigmatic stories, investigations, clues, secrets
- **Story Themes:** Detective work, solving mysteries, uncovering secrets
- **Items:** Investigation tools, clues, evidence
- **Locations:** Cities, crime scenes, mysterious locations

**Mythical**
- **Theme:** Gods, legendary creatures, divine quests, ancient powers, mythical beasts
- **Story Themes:** Divine missions, encounters with gods, legendary battles
- **Items:** Divine artifacts, legendary weapons, godly items
- **Locations:** Divine realms, legendary locations, mythical places

### How Genre Affects Story Generation

- **Story Content:** AI generates genre-appropriate narratives
- **Enemy Types:** Genre-specific enemies appear
- **Item Types:** Items match the genre setting
- **Location Names:** Locations fit the genre theme
- **Quest Themes:** Quests align with genre expectations

### Location Systems

**Sci-Fi Special Rule:**
- **Real Solar System Only:** Sci-Fi stories use actual solar system locations
- **No Fictional Planets:** The AI is instructed to use Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Sun, or Moon
- **Realistic Settings:** Space stations, colonies, and bases on real celestial bodies

**Other Genres:**
- Fantasy: Fictional medieval locations
- Mystery: Realistic modern/fictional locations
- Mythical: Divine and legendary locations

---

## Story System

### AI-Powered Story Generation

**Technology:** Powered by Google Gemini AI

**How It Works:**
1. AI receives your character information
2. AI considers previous story events
3. AI generates narrative based on your choice
4. Story is displayed with letter-by-letter animation
5. New choices are provided for continuation

**Features:**
- **Dynamic Narratives:** Every story is unique
- **Context Awareness:** AI remembers previous events
- **Choice Consequences:** Your decisions affect the story
- **Genre Adaptation:** Stories match selected genre
- **Language Support:** Stories generated in selected language

### How Choices Affect the Story

**Immediate Effects:**
- Story direction changes based on choice
- Different events occur
- Different items may be found
- Different enemies may appear

**Long-term Effects:**
- Story branches based on previous choices
- Character relationships develop
- Quest progression changes
- Multiple endings possible

**Choice Types:**
- **Exploration Choices:** Where to go, what to investigate
- **Combat Choices:** How to fight, when to retreat
- **Social Choices:** How to interact with NPCs
- **Puzzle Choices:** How to solve problems

### Story Phases

**1. Exploration Phase**
- Default story phase
- Focus on narrative and choices
- May encounter enemies or items
- Quest progression occurs

**2. Combat Phase**
- Triggered when enemy appears
- Story pauses for combat
- Combat overlay appears
- Continue story after combat

**3. Final Puzzle Phase**
- End-game phase
- Puzzle panel appears
- Must solve puzzle to win
- Wrong answer = game over

### Instant Response System (Pre-generation)

**How It Works:**
1. When you make a choice, the game checks a cache
2. If the next story is pre-generated, it shows instantly
3. If not cached, story generates normally
4. Background: Game pre-generates stories for the next 3 choices
5. This creates "instant" responses for most choices

**Benefits:**
- Faster gameplay
- Smoother experience
- Reduced waiting time

**Technical Details:**
- Uses in-memory caching
- Pre-generates 3 choice branches
- Cache expires after 10 minutes
- Automatically cleans up old entries

### Language-Specific Story Generation

**Supported Languages:**
- English
- Kannada
- Telugu

**What's Translated:**
- All story narrative text
- Quest titles and descriptions
- Item names
- Choice options
- Combat messages
- Enemy names
- Location names

**How It Works:**
- Language is set during character creation
- AI receives language instruction
- All generated content is in selected language
- No English mixing (for Kannada/Telugu)

**Example (Kannada):**
- Story text: "ನೀವು ಕೋಟೆಯನ್ನು ಪ್ರವೇಶಿಸುತ್ತೀರಿ..."
- Choices: ["ಅನ್ವೇಷಿಸಿ", "ಹೋರಾಡಿ", "ತಪ್ಪಿಸಿಕೊಳ್ಳಿ"]

**Example (Telugu):**
- Story text: "మీరు కోటలోకి ప్రవేశిస్తారు..."
- Choices: ["అన్వేషించండి", "యుద్ధం చేయండి", "తప్పించుకోండి"]

---

## Combat System

### Turn-Based Combat Mechanics

**How Combat Starts:**
1. Enemy appears in story
2. Story text mentions combat
3. Combat overlay appears
4. Combat mode activates

**Combat Flow:**
1. Player chooses action (Attack, Defend, Use Item)
2. If Attack: Select weapon or fight with fists
3. Combat resolves automatically
4. Enemy counterattacks
5. Repeat until victory or defeat

### Attack Actions

**Standard Attack:**
- Click "Attack" choice in story
- If you have weapons: Weapon selection appears
- If no weapons: "Fight with fists" option
- Damage calculated based on:
  - Weapon stats (if used)
  - Character strength
  - Enemy defense

**Weapon Selection:**
- Shows all weapons in inventory
- Each weapon listed as a choice
- Select weapon to attack with it
- "Fight with fists" always available

**Attack Animation:**
- Visual effects play
- Screen shake effect
- Damage numbers appear
- Combat log updates

### Weapon Selection

**When It Appears:**
- You choose "Attack" during combat
- You have weapons in inventory

**How It Works:**
1. All weapons from inventory shown as choices
2. Click weapon name to select it
3. Combat resolves with selected weapon
4. Weapon stats affect damage

**Weapon Stats:**
- Attack bonus
- Special effects (if any)
- Durability (if applicable)

**Fighting with Fists:**
- Available even with weapons
- Lower damage than weapons
- No weapon required

### Defend Actions

**Defend Choice:**
- Available during combat
- Reduces incoming damage
- May provide other benefits

**How to Defend:**
- Look for "Defend" choice in story
- Click to activate defense
- Damage reduction applies

### Using Items in Combat

**Available Items:**
- Health Potions (restore HP)
- Mana Potions (restore MP)
- Buff items (temporary stat boosts)
- Special combat items

**How to Use:**
- Items appear as choices during combat
- Click item name to use it
- Effect applies immediately
- Item consumed (if consumable)

### Abilities and Cooldowns

**Abilities:**
- Class-specific abilities
- Unlocked through progression
- Have cooldown timers

**Ability Types:**
- **Warrior:** Powerful strikes, defensive stances
- **Mage:** Spells, magic attacks
- **Rogue:** Stealth attacks, critical strikes

**Cooldown System:**
- Abilities have cooldown periods
- Timer shown on ability button
- Must wait before reuse

### Victory/Defeat Conditions

**Victory:**
- Enemy HP reaches 0
- Victory animation plays
- Rewards awarded (XP, coins, items)
- Story continues automatically

**Defeat:**
- Player HP reaches 0
- Defeat animation plays
- Game Over screen appears
- Options: Return to menu or retry

**Combat Rewards:**
- Experience points (XP)
- Coins
- Items (weapons, armor, consumables)
- Quest progress (if applicable)

---

## Inventory System

### Item Types

**Weapons:**
- Swords, daggers, staffs, bows, etc.
- Used in combat
- Provide attack bonuses
- Can be equipped

**Armor:**
- Helmets, chest pieces, boots, etc.
- Provide defense bonuses
- Can be equipped
- Reduces incoming damage

**Potions:**
- Health Potions (restore HP)
- Mana Potions (restore MP)
- Consumable items
- Used instantly

**Consumables:**
- Food items
- Temporary buffs
- Quest items
- Single-use items

**Keys:**
- Unlock doors/chests
- Quest-related items
- May be consumed on use

**Quest Items:**
- Story-related items
- Required for quests
- May be unique

### Item Management

**Viewing Inventory:**
- Click Inventory button (Package icon) in top HUD
- Modal opens showing all items
- Items organized by type
- Shows quantity for stackable items

**Inventory Display:**
- Item name
- Item type badge
- Quantity (if stackable)
- Item icon
- Stat bonuses (if any)
- Item description/effect

### Using Items

**From Inventory Modal:**
1. Open inventory
2. Find item
3. Click "Use" button
4. Item effect applies
5. Item consumed (if consumable)

**From Combat:**
- Items appear as choices
- Click item name to use
- Effect applies immediately

**Item Effects:**
- Health restoration
- Mana restoration
- Stat boosts
- Special effects

### Equipping Items

**Equippable Items:**
- Weapons
- Armor pieces
- Accessories

**How to Equip:**
1. Open inventory
2. Find equippable item
3. Click "Equip" button
4. Item moves to equipped slot
5. Stats update immediately

**Equipment Slots:**
- Weapon slot
- Armor slot
- Helmet slot
- Boots slot
- Accessory slots

**Unequipping:**
- Click "Unequip" on equipped item
- Item returns to inventory
- Stats revert

### Item Rarity

**Rarity Levels:**
- Common (gray)
- Uncommon (green)
- Rare (blue)
- Epic (purple)
- Legendary (orange)

**Rarity Effects:**
- Better stats
- Special effects
- Higher value
- Rarer drops

### Stat Bonuses

**Item Stat Bonuses:**
- Attack: Increases damage
- Defense: Reduces incoming damage
- Strength: Physical power
- Intelligence: Magic power
- Agility: Speed and evasion
- Health: Max HP increase

**Viewing Bonuses:**
- Shown in inventory item card
- Displayed as badges
- Format: "Stat: +Value"

---

## Quest System

### Main Quests

**Purpose:** Primary story objectives that drive the main narrative

**Characteristics:**
- Essential for story progression
- Usually one active at a time
- Longer and more complex
- Higher rewards
- Badge: "Main" (red/primary color)

**How to Receive:**
- Automatically given at game start
- Received through story progression
- Shown in Quest Dialog when received

**Quest Dialog:**
- Appears when quest is received
- Shows quest title and description
- Displays objectives
- Shows rewards
- "Start" button to begin

### Side Quests

**Purpose:** Optional objectives that provide additional content and rewards

**Characteristics:**
- Optional completion
- Can have multiple active
- Shorter than main quests
- Additional rewards
- Badge: "Side" (secondary color)

**How to Receive:**
- Through story interactions
- NPC conversations
- Exploration discoveries

### Quest Objectives

**Display:**
- Shown in Quest Tracker
- Listed as checkboxes
- Progress indicators for numeric objectives
- Format: "Current/Required"

**Objective Types:**
- **Simple:** "Find the artifact" (checkbox)
- **Numeric:** "Defeat 5 enemies" (progress: 2/5)
- **Location:** "Reach the castle"
- **Item:** "Collect 3 crystals"

**Completion:**
- Checkbox: Automatically checked when completed
- Numeric: Progress updates as you complete actions
- Visual: Checkmark icon when done

### Quest Completion

**How to Complete:**
1. Finish all objectives
2. Quest progress reaches 100%
3. Automatic completion notification
4. Rewards awarded

**Completion Rewards:**
- Experience points (XP)
- Coins
- Items
- Score points (+20 score)

**Quest Tracker Display:**
- Completed quests moved to "Completed" section
- Shows completion count
- Strikethrough text style

### Quest Rewards

**Types of Rewards:**
- **XP:** Experience points for leveling
- **Gold/Coins:** Currency
- **Items:** Weapons, armor, consumables
- **Score:** Points for leaderboard

**Display:**
- Shown in quest card
- Badge format
- Example: "⭐ 500 XP", "💰 200 Gold"

### Quest Tracking

**Quest Tracker Location:**
- Accessible via Quest button (Target icon)
- Shows in side panel or modal
- Always visible in top HUD (progress bar)

**Top HUD Quest Bar:**
- Shows active quest title
- Progress percentage
- Progress bar visualization
- "Quest Complete!" indicator at 100%

**Quest Tracker Panel:**
- **Active Quests Section:**
  - Quest title and description
  - Quest type badge (Main/Side)
  - Objectives list with checkboxes
  - Progress bar (if applicable)
  - Rewards preview

- **Completed Quests Section:**
  - List of completed quests
  - Completion count
  - Strikethrough styling

**Quest Progress Updates:**
- Automatic when objectives completed
- Real-time progress bar updates
- Visual feedback on completion

---

*Continue to [game-details2.md](./game-details2.md) for the remaining sections: Shop and Economy, Crafting, World Map, Achievements, Codex, Statistics, Save System, Settings (detailed), Social Features, Daily Features, Mini-Games, Advanced Features, Tips and Strategies, Troubleshooting, and Keyboard Shortcuts.*

