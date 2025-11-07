# Placeholder for FastAPI backend integrating Gemini AI & MongoDB
# 
# This file is ready for future backend implementation with:
# - FastAPI for REST API endpoints
# - Google Gemini AI for dynamic story generation
# - MongoDB for game state persistence
#
# Example endpoints to implement:
# - POST /api/story - Generate next story segment based on player action
# - POST /api/combat - Handle combat encounters
# - POST /api/character - Save/load character data
# - GET /api/adventure-log - Retrieve story history
import google.generativeai as genai
import os
import json
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId
import logging
from contextlib import asynccontextmanager

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Environment Variables ---
load_dotenv()

# --- Application Lifespan (for MongoDB connection) ---
mongo_client: Optional[AsyncIOMotorClient] = None
db: Optional[Any] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    global mongo_client, db
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        logger.error("MONGODB_URI not found in environment variables.")
        raise RuntimeError("MONGODB_URI is required.")
    try:
        mongo_client = AsyncIOMotorClient(mongo_uri)
        db = mongo_client.ai_dungeon_master
        logger.info("Successfully connected to MongoDB.")
        # Optional: Test connection
        await db.command('ping')
        logger.info("MongoDB ping successful.")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise RuntimeError(f"Failed to connect to MongoDB: {e}")

    yield # Application runs here

    # Shutdown: Disconnect from MongoDB
    if mongo_client:
        mongo_client.close()
        logger.info("Closed MongoDB connection.")

# --- FastAPI App ---
app = FastAPI(title="AI Dungeon Master API", lifespan=lifespan)

# --- CORS ---
cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:5173") # Default to frontend dev server
# Allow multiple origins for development
allowed_origins = [
    cors_origin,
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,  # Set to False to allow all origins pattern
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Gemini Setup ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
model = None
available_models = []
selected_model_name = None

if not gemini_api_key:
    logger.error("GEMINI_API_KEY not found in environment variables.")
else:
    try:
        genai.configure(api_key=gemini_api_key)
        
        # List available models FIRST and use them
        try:
            available_models_list = genai.list_models()
            available_models = [m.name for m in available_models_list if 'generateContent' in m.supported_generation_methods]
            logger.info(f"Found {len(available_models)} available models with generateContent support")
            if available_models:
                logger.info(f"Sample models: {available_models[:3]}")
        except Exception as e:
            logger.warning(f"Could not list models: {e}")
        
        # Priority order: prefer flash (faster), then pro (better quality)
        preferred_model_patterns = [
            'flash',  # Fast models first
            'pro',    # Then quality models
            'gemini', # Any gemini model
        ]
        
        # Build list of models to try - use EXACT names from available_models
        model_names_to_try = []
        
        # First, add preferred models from available_models list
        for pattern in preferred_model_patterns:
            for avail_model in available_models:
                if pattern in avail_model.lower() and avail_model not in model_names_to_try:
                    model_names_to_try.append(avail_model)
        
        # Then add any remaining gemini models
        for avail_model in available_models:
            if avail_model not in model_names_to_try:
                model_names_to_try.append(avail_model)
        
        # If we have available models, use them. Otherwise try common names
        if not model_names_to_try:
            model_names_to_try = [
                'gemini-1.5-flash-latest',
                'gemini-1.5-pro-latest',
                'gemini-1.5-flash',
                'gemini-1.5-pro',
                'gemini-pro',
            ]
        
        # Try each model - use the exact name from available_models
        for model_name in model_names_to_try:
            try:
                # Use the exact model name as it appears in the list
                test_model = genai.GenerativeModel(model_name)
                model = test_model
                selected_model_name = model_name
                logger.info(f"✓ Successfully configured Gemini model: '{model_name}'")
                logger.info(f"  Model will be tested on first API call")
                break
            except Exception as e:
                error_msg = str(e)
                logger.warning(f"✗ Model '{model_name}' failed: {error_msg[:150]}")
                continue
        
        if model is None:
            logger.error(f"❌ Failed to configure any Gemini AI model.")
            if available_models:
                logger.error(f"Available models: {available_models[:10]}")
                # Last resort: try the first available model without testing
                try:
                    first_model = available_models[0]
                    model = genai.GenerativeModel(first_model)
                    selected_model_name = first_model
                    logger.warning(f"⚠ Using first available model without test: {first_model}")
                except Exception as e:
                    logger.error(f"❌ Even first model failed: {e}")
            else:
                logger.error("No available models found. Check your API key and permissions.")
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
        model = None

# --- Pydantic Models ---
# Simplified models based on frontend state and README examples
class PlayerStats(BaseModel):
    strength: int
    intelligence: int
    agility: int

class Item(BaseModel):
    id: str
    name: str
    type: str
    effect: Optional[str] = None
    quantity: int

class Player(BaseModel):
    name: str
    class_name: str = Field(..., alias='class') # Use alias for 'class' keyword
    gender: str
    level: int
    health: int
    maxHealth: int
    xp: int
    maxXp: int
    # position: Dict[str, int] # Assuming frontend handles position
    inventory: List[Item]
    stats: PlayerStats

class Enemy(BaseModel):
    id: str
    name: str
    health: int
    maxHealth: int
    attack: int
    defense: int
    # position: Dict[str, int] # Assuming frontend handles position

class StoryEvent(BaseModel):
    id: str
    text: str
    timestamp: str # Assuming ISO format string from frontend/JS Date
    type: str

class Quest(BaseModel):
    id: str
    title: str
    description: str
    type: str = "main"  # "main" or "side"
    objectives: Optional[List[Dict[str, Any]]] = None
    progress: Optional[int] = None
    rewards: Optional[Dict[str, Any]] = None

class StoryRequest(BaseModel):
    player: Player
    genre: str
    previousEvents: List[StoryEvent]
    choice: Optional[str] = None
    gameState: Optional[Dict[str, Any]] = None  # Track turn count, phase, etc.
    multiplayer: Optional[Dict[str, Any]] = None  # For multiplayer: other player info, merge flag, etc.
    activeQuest: Optional[Dict[str, Any]] = None  # Active quest for story context

class CombatRequest(BaseModel):
    player: Player
    enemy: Enemy
    action: str
    itemId: Optional[str] = None

class SaveData(BaseModel):
    playerId: str = Field(..., description="Identifier for the player (e.g., user ID or player name)")
    saveSlot: int = Field(..., description="Slot number (e.g., 1, 2, 3)")
    saveName: str = Field(..., description="User-friendly name for the save")
    gameState: Dict[str, Any] = Field(..., description="Complete snapshot of the game state")

# --- Helper Function to Parse Gemini JSON Response ---
def parse_json_response(text: str) -> Dict[str, Any]:
    """Attempts to parse JSON from Gemini's response, handling potential markdown code blocks."""
    try:
        # Remove markdown code block fences if present
        cleaned_text = text.strip().removeprefix('```json').removesuffix('```').strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}\nResponse text:\n{text}")
        raise HTTPException(status_code=500, detail="AI response format error.")
    except Exception as e:
        logger.error(f"An unexpected error occurred during JSON parsing: {e}\nResponse text:\n{text}")
        raise HTTPException(status_code=500, detail="Internal server error during response parsing.")

# --- AI Interaction Functions (Async) ---
async def generate_initial_loot_and_quest(player: Player, genre: str) -> Dict[str, Any]:
    """Generate initial loot and quest at game start."""
    if not model:
        raise HTTPException(status_code=503, detail="Gemini AI model not configured.")

    prompt = f"""
    You are a {genre} Dungeon Master for a text-based RPG game called Gilded Scrolls AI.

    Player Character:
    - Name: {player.name}
    - Class: {player.class_name}
    - Level: {player.level}
    - Stats: STR {player.stats.strength}, INT {player.stats.intelligence}, AGI {player.stats.agility}

    This is the very beginning of the adventure. You MUST generate SHORT and SIMPLE content:
    1. A warm, personalized greeting (1-2 sentences) that welcomes {player.name} the {player.class_name}.
    2. A starting quest that fits the {genre} theme. Keep it simple and clear (1-2 sentences).
    3. Initial loot/items appropriate for a level {player.level} {player.class_name} (2-3 items).
    4. An opening story scene (MAX 2-3 SHORT sentences, use simple English words). Set the stage, introduce the quest, and mention the items.
    5. EXACTLY 3 distinct and meaningful choices for the player (keep choice text short, 3-5 words each).

    Format your response STRICTLY as JSON:
    {{
      "greeting": "A warm, personalized greeting welcoming {player.name} the {player.class_name}",
      "quest": {{
        "id": "quest_start_1",
        "title": "Quest Title",
        "description": "Detailed quest description and objectives",
        "type": "main",
        "objectives": [{{"text": "Objective 1", "completed": false}}],
        "rewards": {{"xp": 100, "gold": 50, "items": []}}
      }},
      "items": [
        {{"id": "item_sword_1", "name": "Rusty Sword", "type": "weapon", "effect": "+2 Attack", "quantity": 1}},
        {{"id": "item_potion_1", "name": "Health Potion", "type": "potion", "effect": "Restores 30 HP", "quantity": 2}}
      ],
      "story": "SHORT opening narrative (MAX 2-3 sentences, use simple English). Greet the player, introduce the quest, describe the scene briefly, and mention the starting items.",
      "choices": ["Choice 1 text", "Choice 2 text", "Choice 3 text"]
    }}

    CRITICAL Instructions:
    -   Keep ALL text SHORT and SIMPLE. Use easy English words that a child could understand.
    -   Story must be MAX 2-3 sentences. NO long paragraphs.
    -   Use simple words: "go" not "proceed", "see" not "observe", "big" not "enormous".
    -   Start with a warm greeting (1-2 sentences) mentioning player's name and class.
    -   Quest description should be 1-2 sentences, simple and clear.
    -   Choices must be SHORT (3-5 words each): "Go left", "Fight monster", "Run away".
    -   Ensure the JSON format is perfect, with keys and values in double quotes.
    -   Do NOT include explanations outside the JSON structure.
    """

    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Gemini AI model not configured. Please check GEMINI_API_KEY and available models.")
        
        try:
            response = await model.generate_content_async(prompt)
        except Exception as model_error:
            error_str = str(model_error)
            logger.error(f"Model API error (using '{selected_model_name}'): {error_str}")
            # If it's a 404, the model name is wrong - try to find a working one
            if "404" in error_str or "not found" in error_str.lower():
                logger.error(f"Model '{selected_model_name}' not found. Available models: {available_models[:5]}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Model '{selected_model_name}' not available. Please check /api/models for available models."
                )
            raise
        if not response.candidates:
            raise HTTPException(status_code=500, detail="AI failed to generate initial content.")
        
        if hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
            ai_response_text = response.candidates[0].content.parts[0].text
        else:
            ai_response_text = getattr(response, 'text', '')

        if not ai_response_text:
            raise HTTPException(status_code=500, detail="AI response was empty or blocked.")

        result = parse_json_response(ai_response_text)
        
        # Ensure choices are present and are strings (not objects)
        if "choices" not in result or not result.get("choices"):
            result["choices"] = ["Explore the area", "Investigate further", "Proceed with caution"]
        else:
            # Filter choices to ensure they are all strings
            choices = result.get("choices", [])
            if isinstance(choices, list):
                result["choices"] = [
                    str(choice).strip() 
                    for choice in choices 
                    if isinstance(choice, (str, int, float)) and str(choice).strip()
                ]
                if len(result["choices"]) == 0:
                    result["choices"] = ["Explore the area", "Investigate further", "Proceed with caution"]
        
        # Ensure story is a string
        if "story" in result and not isinstance(result.get("story"), str):
            result["story"] = str(result.get("story", ""))
        
        # Combine greeting and story if greeting exists
        if "greeting" in result and result.get("greeting"):
            greeting = result["greeting"]
            story = result.get("story", "")
            result["story"] = f"{greeting}\n\n{story}"
        
        return result
    except Exception as e:
        logger.error(f"Error generating initial loot/quest: {e}")
        # Fallback with choices
        return {
            "greeting": f"Welcome, {player.name} the {player.class_name}!",
            "quest": {
                "id": "quest_start_1",
                "title": "The Beginning",
                "description": "Embark on your adventure and discover what lies ahead.",
                "type": "main",
                "objectives": [{"text": "Explore the world", "completed": False}],
                "rewards": {"xp": 100, "gold": 50, "items": []}
            },
            "items": [
                {"id": "item_sword_1", "name": "Rusty Sword", "type": "weapon", "effect": "+2 Attack", "quantity": 1},
                {"id": "item_potion_1", "name": "Health Potion", "type": "potion", "effect": "Restores 30 HP", "quantity": 2}
            ],
            "story": f"Welcome, {player.name} the {player.class_name}! You stand at the entrance of an ancient dungeon. The air is thick with mystery, and the flickering torchlight casts dancing shadows on the stone walls. You find a Rusty Sword and 2 Health Potions in your pack.",
            "choices": ["Explore the left corridor", "Investigate the center passage", "Take the right pathway"]
        }

async def generate_story_with_ai(player: Player, genre: str, previous_events: List[StoryEvent], choice: Optional[str], game_state: Optional[Dict[str, Any]] = None, multiplayer: Optional[Dict[str, Any]] = None, active_quest: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Generate dynamic story based on player choices using Gemini AI."""
    if not model:
        raise HTTPException(status_code=503, detail="Gemini AI model not configured.")

    # Extract game state info
    turn_count = game_state.get("turnCount", 0) if game_state else 0
    story_phase = game_state.get("storyPhase", "exploration") if game_state else "exploration"  # exploration, danger, combat, final
    combat_encounters = game_state.get("combatEncounters", 0) if game_state else 0
    combat_escapes = game_state.get("combatEscapes", 0) if game_state else 0  # Track combat escapes
    is_after_combat = game_state.get("isAfterCombat", False) if game_state else False
    is_final_phase = game_state.get("isFinalPhase", False) if game_state else False

    # Multiplayer info
    is_multiplayer = multiplayer is not None
    other_player = multiplayer.get("otherPlayer") if multiplayer else None
    should_merge_stories = multiplayer.get("shouldMergeStories", False) if multiplayer else False
    both_survived_first_fight = multiplayer.get("bothSurvivedFirstFight", False) if multiplayer else False

    # Build context from previous events (take the last 5 for better context)
    context = "\n".join([e.text for e in previous_events[-5:]]) if previous_events else "The adventure begins."
    player_choice_text = f"Player's Choice: {choice}" if choice else "This is the start of a new scene or the continuation after a combat."

    # Multiplayer merge logic
    if is_multiplayer and should_merge_stories and both_survived_first_fight:
        other_player_info = f"Other Player: {other_player.get('name', 'Unknown')} ({other_player.get('class', 'Unknown')})" if other_player else ""
        phase_instruction = f"This is a CRITICAL MOMENT: The two players ({player.name}, {player.class_name} and {other_player_info}) are meeting for the first time after surviving their separate adventures. Create a dramatic narrative scene where they encounter each other, explicitly mentioning both their names and classes. From this point forward, they will share the same story and choices."
    elif is_multiplayer and not should_merge_stories:
        # Separate stories for each player
        phase_instruction = "You are running a SEPARATE, INDEPENDENT story for this player. Do not reference the other player. This player's story is unique to them."
    elif turn_count == 0:
        # Initial story turn
        phase_instruction = "This is the first story turn. Generate a SHORT opening scene (MAX 2-3 sentences, use simple English words)."
    elif turn_count < 5 and story_phase == "exploration" and combat_escapes < 2:
        # Story phase - longer exploration before first combat (5 turns instead of 3)
        # Only show danger if player hasn't escaped twice already
        phase_instruction = f"This is story turn {turn_count + 1} of the exploration phase. Continue building the narrative SHORTLY (MAX 2-3 sentences, simple English). Focus on quest progression. Combat encounters should be RARE - only introduce danger if it's truly necessary for the quest."
    elif turn_count >= 5 and story_phase == "exploration" and combat_escapes < 2 and combat_encounters == 0:
        # Time for FIRST danger encounter (only if player hasn't escaped twice)
        phase_instruction = "A dangerous situation or monster may appear now, but keep it RARE. Describe the threat SHORTLY (MAX 2-3 sentences, simple English) but DO NOT automatically start combat. Give the player SHORT options like 'Attack', 'Run', 'Hide'. Remember: combat should be MINIMAL in this adventure."
        story_phase = "danger"
    elif combat_escapes >= 2:
        # Player escaped twice - no more combat, just story until final puzzle
        if not is_final_phase:
            phase_instruction = f"""
The player has avoided combat multiple times. Continue the story focusing on quest completion.
CRITICAL:
1. NO MORE COMBAT OR DANGER - the player prefers to avoid fights.
2. Continue the narrative toward quest completion.
3. Build toward the FINAL PUZZLE which is COMPULSORY.
4. The final puzzle will appear soon - prepare the story for it.
5. Keep story SHORT (MAX 2-3 sentences, simple English).
6. Focus on exploration and quest objectives.
"""
        else:
            # Final puzzle phase
            phase_instruction = """
This is the FINAL CHALLENGE - a COMPULSORY tricky puzzle!
CRITICAL REQUIREMENTS:
1. Create a VERY TRICKY puzzle or riddle related to the story/quest that the player has experienced.
2. The puzzle question should be SHORT (1-2 sentences, simple English) but challenging.
3. You MUST provide EXACTLY 5 options/choices for the answer.
4. ONE of the 5 options must be the CORRECT answer.
5. The other 4 options should be plausible but WRONG answers (tricky distractors).
6. The puzzle should test the player's memory/understanding of the story events.
7. Make it challenging but fair - related to what happened in the adventure.
This puzzle appears in a popup like combat with 5 clickable buttons.
"""
            story_phase = "final"
    elif story_phase == "danger" and choice:
        choice_lower = choice.lower()
        if "attack" in choice_lower:
            # Player chose to attack - combat will start
            phase_instruction = "The player has chosen to attack. Describe the beginning of combat SHORTLY (MAX 2 sentences, simple English) but do NOT include an enemy object yet (combat will be handled separately)."
        elif "hide" in choice_lower or "run" in choice_lower or "flee" in choice_lower or "escape" in choice_lower:
            # Player chose to hide/run - track escape and continue story
            escape_count = combat_escapes + 1
            quest_context = ""
            if active_quest:
                quest_title = active_quest.get("title", "")
                quest_desc = active_quest.get("description", "")
                quest_context = f"\n\nCRITICAL: The player has an active quest: '{quest_title}' - {quest_desc}. Continue the story based on this quest. The player avoided the threat - describe how they escape/hide and then continue with quest progression."
            
            if escape_count == 1:
                # First escape - AI can try one more combat opportunity later
                phase_instruction = f"""
The player chose to {'hide' if 'hide' in choice_lower else 'run/escape'} from the danger (escape #{escape_count}). 
CRITICAL INSTRUCTIONS:
1. Describe SHORTLY (MAX 2-3 sentences, simple English) how the player successfully avoids the threat.
2. The threat is now BEHIND them - do NOT mention it again immediately.
3. You MAY introduce ONE more combat opportunity later if it fits the quest, but keep it RARE.
4. Continue the main story narrative focusing on quest progression.
5. Move the adventure forward toward quest completion.
6. Focus on exploration, discovery, or quest objectives.
{quest_context}
After this, the story phase should return to exploration and continue normally.
"""
            else:
                # Second escape - NO MORE COMBAT, just story until final puzzle
                phase_instruction = f"""
The player chose to {'hide' if 'hide' in choice_lower else 'run/escape'} from the danger (escape #{escape_count} - FINAL ESCAPE). 
CRITICAL INSTRUCTIONS:
1. Describe SHORTLY (MAX 2-3 sentences, simple English) how the player successfully avoids the threat.
2. The threat is now BEHIND them - do NOT mention it again or create new threats.
3. STRICTLY FORBIDDEN: NO MORE COMBAT OR DANGER - player has escaped twice.
4. You MUST continue the main story narrative focusing on quest progression.
5. Move the adventure forward toward quest completion and the FINAL PUZZLE.
6. Focus on exploration, discovery, or quest objectives - NO MORE COMBAT OR THREATS.
7. The choices should be about exploration, investigation, or quest-related actions - NOT combat options.
8. Build toward the COMPULSORY final puzzle which will appear soon.
{quest_context}
After this, the story phase should return to exploration and continue toward the final puzzle.
"""
            story_phase = "exploration"  # Return to exploration phase after avoiding danger
    elif is_after_combat:
        # Continue story after combat - STRICTLY NO MORE COMBAT, focus on quest
        quest_context = ""
        if active_quest:
            quest_title = active_quest.get("title", "")
            quest_desc = active_quest.get("description", "")
            quest_context = f"\n\nCRITICAL: The player has an active quest: '{quest_title}' - {quest_desc}. You MUST continue the story based on this quest and help the player progress toward completing it. DO NOT create new enemies, combat, or threats. The previous enemy is DEAD and GONE forever."
        phase_instruction = f"""
CRITICAL INSTRUCTIONS FOR POST-COMBAT STORY:
1. The combat has ENDED. The enemy is DEFEATED and DEAD.
2. STRICTLY FORBIDDEN: Do NOT create new enemies, combat encounters, attacks, strikes, or any threats.
3. STRICTLY FORBIDDEN: Do NOT mention the dead creature again - it is completely gone.
4. You MUST continue the main story narrative focusing on quest progression.
5. Generate a SHORT story (MAX 2-3 sentences, simple English) that moves the adventure forward.
6. Focus on exploration, discovery, or quest objectives - NO COMBAT.
7. The choices should be about exploration, investigation, or quest-related actions - NOT combat options.
{quest_context}
"""
    elif is_final_phase:
        # Final puzzle phase (NOT combat - it's a puzzle!)
        phase_instruction = "This is the FINAL CHALLENGE - a tricky puzzle! Create an interesting puzzle or riddle (SHORT, 2-3 sentences, simple English). The player must solve it to win. If they fail, game over. Give them puzzle choices/options to solve it."
        story_phase = "final"
    else:
        phase_instruction = "Continue the story narrative SHORTLY (MAX 2-3 sentences, simple English)."

    # Build multiplayer context
    multiplayer_context = ""
    if is_multiplayer:
        if should_merge_stories and both_survived_first_fight:
            multiplayer_context = f"\n\nMULTIPLAYER MODE - STORY MERGE:\nYou are now managing a PARTY of two players:\n1. {player.name} ({player.class_name}) - Level {player.level}\n2. {other_player.get('name', 'Unknown')} ({other_player.get('class', 'Unknown')}) - Level {other_player.get('level', 1)}\n\nFrom now on, generate ONE unified story for BOTH players. They share the same choices and outcomes."
        else:
            multiplayer_context = f"\n\nMULTIPLAYER MODE - SEPARATE STORY:\nYou are running an INDEPENDENT story for {player.name} only. Do not reference any other players."

    prompt = f"""
    You are a {genre} Dungeon Master for a text-based RPG game called Gilded Scrolls AI.

    Player Character:
    - Name: {player.name}
    - Class: {player.class_name}
    - Level: {player.level}
    - Health: {player.health}/{player.maxHealth}
    - Stats: STR {player.stats.strength}, INT {player.stats.intelligence}, AGI {player.stats.agility}
    - Inventory: {', '.join([f'{item.name} (x{item.quantity})' for item in player.inventory]) if player.inventory else 'Empty'}

    Game State:
    - Turn Count: {turn_count}
    - Story Phase: {story_phase}
    - Combat Encounters Survived: {combat_encounters}
    - Combat Escapes: {combat_escapes} (if >= 2, NO MORE COMBAT - only story until final puzzle)
    - Is Final Phase: {is_final_phase}
    {multiplayer_context}
    
    Active Quest:
    {f"Title: {active_quest.get('title', 'None')}\nDescription: {active_quest.get('description', 'None')}\nObjectives: {active_quest.get('objectives', [])}" if active_quest else "No active quest"}

    Previous Story Context (most recent first):
    {context}

    {player_choice_text}

    {phase_instruction}

    Generate the next part of the story (KEEP IT SHORT AND SIMPLE):
    1.  Write a SHORT narrative continuation (MAX 2-3 sentences, use simple English words) based on the phase instruction above.
    2.  Provide exactly 3 distinct and meaningful choices (keep each choice SHORT, 3-5 words: "Go left", "Fight", "Run away").
    3.  If in the "danger" phase and player hasn't chosen attack yet, include choices like "Attack", "Run", "Hide" (keep them short).
    4.  DO NOT include an enemy object unless the player explicitly chooses to attack AND combat hasn't started yet.
    5.  If player chose to hide/run/escape from danger, continue the story focusing on quest progression - NO MORE COMBAT OR THREATS.
    5.  Only include items if the player finds them in this specific moment.
    6.  CRITICAL: If this is after combat (isAfterCombat is true), you MUST:
       - Continue the story focusing on quest progression
       - STRICTLY FORBIDDEN: Do NOT create new enemies, combat, attacks, or threats
       - STRICTLY FORBIDDEN: Do NOT mention the dead creature
       - Focus on exploration, discovery, or quest objectives
       - Choices should be about exploration/investigation - NOT combat
       - Keep it SHORT (2-3 sentences max)

    Format your response STRICTLY as JSON:
    {{
      "story": "Your SHORT narrative here (MAX 2-3 sentences, simple English)...",
      "choices": ["Short choice 1", "Short choice 2", "Short choice 3"],
      "dangerEncounter": {{
        "description": "Description of the threat",
        "enemy": {{ "id": "enemy_goblin_1", "name": "Goblin Scout", "health": 30, "maxHealth": 30, "attack": 8, "defense": 4 }}
      }} // Optional: Include ONLY if in danger phase and player chooses to attack. STRICTLY FORBIDDEN if isAfterCombat is true - NO MORE COMBAT AFTER COMBAT ENDS!
      "finalPuzzle": {{
        "description": "Description of the tricky puzzle or riddle (SHORT, 1-2 sentences)",
        "question": "The VERY TRICKY puzzle question related to the story (SHORT, 1-2 sentences, simple English)",
        "correctAnswer": "The EXACT text of the correct option (must match one of the 5 options exactly)",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"], // EXACTLY 5 options - ONE must be correct
        "hints": ["Hint 1", "Hint 2"] // Optional
      }} // Optional: Include ONLY if in final phase (NOT an enemy - it's a puzzle!). MUST have exactly 5 options with one correct answer.
      "items": [{{ "id": "item_health_potion_1", "name": "Minor Health Potion", "type": "potion", "effect": "Restores 30 HP", "quantity": 1 }}] // Optional
      "events": [ {{ "type": "story", "text": "Event text" }} ] // Optional
      "storyPhase": "{story_phase}" // Current phase (should be "exploration" if player hid/ran from danger)
      "shouldStartCombat": false // Set to true ONLY if player chose attack in danger phase. MUST be false if player hid/ran/escaped (NOT for final phase - it's a puzzle!)
      "isFinalPhase": {str(is_final_phase).lower()} // True if this is the final puzzle challenge (COMPULSORY - must appear)
      "questProgress": 50 // Quest completion percentage (0-100). Update based on actual quest progress. When 80-90%, prepare for final puzzle.
    }}

    Important Notes:
    -   Maintain narrative consistency.
    -   Keep the difficulty appropriate for a level {player.level} {player.class_name}.
    -   Ensure the JSON format is perfect, with keys and values in double quotes.
    -   Do NOT include explanations outside the JSON structure.
    -   Combat should only start when player explicitly chooses to attack in danger phase.
    """

    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Gemini AI model not configured.")
        
        try:
            response = await model.generate_content_async(prompt)
        except Exception as model_error:
            error_str = str(model_error)
            logger.error(f"Model API error in story generation (using '{selected_model_name}'): {error_str}")
            if "404" in error_str or "not found" in error_str.lower():
                logger.error(f"Model '{selected_model_name}' not found. Available: {available_models[:5]}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Model '{selected_model_name}' not available. Check /api/models"
                )
            raise

        if not response.candidates:
             raise HTTPException(status_code=500, detail="AI failed to generate a response.")

        # Accessing the text content safely
        if hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
            ai_response_text = response.candidates[0].content.parts[0].text
        else:
            # Fallback or different structure handling if necessary
             ai_response_text = getattr(response, 'text', '') # Attempt to get text attribute directly

        if not ai_response_text:
             raise HTTPException(status_code=500, detail="AI response was empty or blocked.")

        result = parse_json_response(ai_response_text)
        
        # Validate and clean choices - ensure they are strings, not objects
        if "choices" in result and isinstance(result.get("choices"), list):
            choices = result.get("choices", [])
            result["choices"] = [
                str(choice).strip() 
                for choice in choices 
                if isinstance(choice, (str, int, float)) and str(choice).strip()
            ]
            if len(result["choices"]) == 0:
                result["choices"] = ["Continue forward", "Look around", "Proceed carefully"]
        
        # Ensure story is a string
        if "story" in result and not isinstance(result.get("story"), str):
            result["story"] = str(result.get("story", ""))
        
        return result
    except Exception as e:
        logger.error(f"Error during Gemini API call or response processing: {e}")
        # Provide a fallback generic response to keep the game going
        return {
            "story": f"An unexpected twist of fate occurs! You find yourself momentarily disoriented, unsure of what happened after trying to '{choice}'. The path ahead seems unclear.",
            "choices": ["Look around carefully", "Wait for a moment", "Push forward blindly"],
            "enemy": None,
            "items": [],
            "events": [{"type": "story", "text": "An error occurred generating the story."}]
        }


async def process_combat_with_ai(player: Player, enemy: Enemy, action: str, item_id: Optional[str]) -> Dict[str, Any]:
    """Process a combat turn using Gemini AI."""
    if not model:
        raise HTTPException(status_code=503, detail="Gemini AI model not configured.")

    item_used_text = ""
    if action == "use-item" and item_id:
        item = next((i for i in player.inventory if i.id == item_id), None)
        item_used_text = f"using item '{item.name}' ({item.effect})" if item else "attempting to use an item."
    elif action == "attack":
        item_used_text = "attacking the enemy."
    elif action == "defend":
        item_used_text = "defending."
    # 'run' action is handled before calling this in the frontend/main logic usually

    prompt = f"""
    Process a single combat turn in a text-based RPG called Gilded Scrolls AI.

    Player: {player.name} (Level {player.level} {player.class_name})
    - Health: {player.health}/{player.maxHealth}
    - Stats: STR {player.stats.strength}, INT {player.stats.intelligence}, AGI {player.stats.agility}
    - Inventory: {', '.join([f'{item.name} (x{item.quantity})' for item in player.inventory]) if player.inventory else 'Empty'}

    Enemy: {enemy.name}
    - Health: {enemy.health}/{enemy.maxHealth}
    - Attack: {enemy.attack}, Defense: {enemy.defense}

    Player Action: {action} {item_used_text}

    Calculate the outcome of this turn:
    1.  Determine Player Damage: Based on player action, stats ({player.stats.strength} STR for physical, {player.stats.intelligence} INT for magic if applicable), and enemy defense ({enemy.defense}). Defense action reduces incoming damage. Use reasonable RPG logic.
    2.  Determine Enemy Damage: Based on enemy attack ({enemy.attack}) and player stats (AGI {player.stats.agility} might influence dodging/mitigation). If player defended, reduce damage significantly.
    3.  Update Health: Calculate new health for both player and enemy (cannot go below 0).
    4.  Combat Log: Provide 1-3 short, descriptive sentences narrating the actions and results (e.g., "You strike the {enemy.name} for X damage!", "{enemy.name} retaliates, hitting you for Y damage.").
    5.  Victory/Defeat Check: Determine if player's health is <= 0 (defeat) or enemy's health is <= 0 (victory).
    6.  Rewards (if victory): If the enemy is defeated, calculate appropriate rewards (XP, maybe some gold or a simple item drop) based on enemy difficulty. A {enemy.name} might grant around {enemy.maxHealth * 2} XP.

    Return the result STRICTLY as JSON:
    {{
      "playerDamage": <calculated_damage_enemy_takes>, // Damage dealt TO the player by the enemy
      "enemyDamage": <calculated_damage_player_deals>, // Damage dealt TO the enemy by the player
      "playerHealth": <player_new_health_after_enemy_attack>,
      "enemyHealth": <enemy_new_health_after_player_attack>,
      "combatLog": ["Narration sentence 1.", "Narration sentence 2."],
      "victory": <true_if_enemy_defeated_else_false>,
      "defeat": <true_if_player_defeated_else_false>,
      "rewards": {{ "xp": <xp_amount_if_victory_else_0>, "gold": <gold_amount_if_victory_else_0>, "items": [{{ "id": "item_goblin_ear_1", "name": "Goblin Ear", "type": "quest", "quantity": 1 }}] }} // Optional: Include ONLY if victory
    }}

    Important Notes:
    -   Ensure the JSON format is perfect.
    -   Calculate damage with some variability but keep it logical for the stats.
    -   Do NOT include explanations outside the JSON structure.
    """

    try:
        if model is None:
            raise HTTPException(status_code=503, detail="Gemini AI model not configured.")
        
        try:
            response = await model.generate_content_async(prompt)
        except Exception as model_error:
            error_str = str(model_error)
            logger.error(f"Model API error in combat (using '{selected_model_name}'): {error_str}")
            if "404" in error_str or "not found" in error_str.lower():
                logger.error(f"Model '{selected_model_name}' not found. Available: {available_models[:5]}")
                raise HTTPException(
                    status_code=503, 
                    detail=f"Model '{selected_model_name}' not available. Check /api/models"
                )
            raise

        if not response.candidates:
             raise HTTPException(status_code=500, detail="AI failed to generate a combat response.")

        # Accessing the text content safely
        if hasattr(response.candidates[0].content, 'parts') and response.candidates[0].content.parts:
            ai_response_text = response.candidates[0].content.parts[0].text
        else:
             ai_response_text = getattr(response, 'text', '')

        if not ai_response_text:
             raise HTTPException(status_code=500, detail="AI combat response was empty or blocked.")

        return parse_json_response(ai_response_text)
    except Exception as e:
        logger.error(f"Error during Gemini API call for combat: {e}")
        # Provide a fallback basic combat exchange
        player_dmg = max(1, player.stats.strength // 2 - enemy.defense // 2 + (abs(hash(player.name + action)) % 5) - 2) # Basic calc with randomness
        enemy_dmg = max(1, enemy.attack // 2 - player.stats.agility // 3 + (abs(hash(enemy.name + action)) % 5) - 2) if action != 'defend' else max(0, enemy.attack // 4 - player.stats.agility // 3)
        new_enemy_health = max(0, enemy.health - player_dmg)
        new_player_health = max(0, player.health - enemy_dmg)
        victory = new_enemy_health <= 0
        defeat = new_player_health <= 0
        log = [f"You {action}!", f"You hit {enemy.name} for {player_dmg} damage."]
        if not defeat:
            log.append(f"{enemy.name} attacks you for {enemy_dmg} damage.")
        if victory:
            log.append(f"You defeated the {enemy.name}!")
        if defeat:
             log.append("You have been defeated!")

        return {
            "playerDamage": enemy_dmg,
            "enemyDamage": player_dmg,
            "playerHealth": new_player_health,
            "enemyHealth": new_enemy_health,
            "combatLog": log,
            "victory": victory,
            "defeat": defeat,
            "rewards": {"xp": enemy.maxHealth * 2, "gold": enemy.maxHealth // 2, "items": []} if victory else None,
        }

# --- API Endpoints ---
@app.options("/api/{path:path}")
async def options_handler(path: str):
    """Handle CORS preflight requests."""
    return {"message": "OK"}

@app.get("/api/models")
async def list_models():
    """List available Gemini models for debugging."""
    if not gemini_api_key:
        return {"error": "GEMINI_API_KEY not configured", "models": []}
    try:
        available_models_list = genai.list_models()
        models_info = []
        for m in available_models_list:
            if 'generateContent' in m.supported_generation_methods:
                models_info.append({
                    "name": m.name,
                    "display_name": m.display_name,
                    "description": m.description,
                })
        return {"models": models_info, "count": len(models_info)}
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        return {"error": str(e), "models": []}

@app.post("/api/initialize")
async def api_initialize_game(request: StoryRequest):
    """Endpoint to initialize the game with initial loot and quest."""
    try:
        result = await generate_initial_loot_and_quest(
            request.player,
            request.genre
        )
        # Ensure all required fields are present
        if "choices" not in result or not result.get("choices"):
            result["choices"] = ["Explore", "Investigate", "Proceed"]
        if "items" not in result:
            result["items"] = []
        if "quest" not in result:
            result["quest"] = {
                "id": "quest_start_1",
                "title": "The Beginning",
                "description": "Begin your adventure",
                "type": "main",
                "objectives": [],
                "rewards": {"xp": 100, "gold": 50, "items": []}
            }
        return result
    except Exception as e:
        logger.error(f"Error in /api/initialize endpoint: {e}")
        # Return fallback response instead of raising error
        return {
            "greeting": f"Welcome, {request.player.name}!",
            "quest": {
                "id": "quest_start_1",
                "title": "The Beginning",
                "description": "Begin your adventure",
                "type": "main",
                "objectives": [{"text": "Explore", "completed": False}],
                "rewards": {"xp": 100, "gold": 50, "items": []}
            },
            "items": [
                {"id": "item_sword_1", "name": "Rusty Sword", "type": "weapon", "effect": "+2 Attack", "quantity": 1},
                {"id": "item_potion_1", "name": "Health Potion", "type": "potion", "effect": "Restores 30 HP", "quantity": 2}
            ],
            "story": f"Welcome, {request.player.name} the {request.player.class_name}! Your adventure begins...",
            "choices": ["Explore", "Investigate", "Proceed"]
        }

@app.post("/api/story")
async def api_generate_story(request: StoryRequest):
    """Endpoint to generate the next part of the story."""
    try:
        # Pydantic automatically validates the request body against StoryRequest
        result = await generate_story_with_ai(
            request.player,
            request.genre,
            request.previousEvents,
            request.choice,
            request.gameState,
            request.multiplayer,
            request.activeQuest
        )
        
        # CRITICAL: If this is after combat, STRICTLY prevent any new combat encounters
        is_after_combat = request.gameState.get("isAfterCombat", False) if request.gameState else False
        
        # Check if player chose to hide/run - if so, don't start combat
        choice_lower = (request.choice or "").lower()
        player_hid_or_ran = any(word in choice_lower for word in ["hide", "run", "flee", "escape"]) if request.choice else False
        
        if is_after_combat:
            # Remove any combat-related content - story must continue without combat
            if "dangerEncounter" in result:
                logger.warning("AI tried to create combat after combat ended - removing it")
                del result["dangerEncounter"]
            if "enemy" in result:
                logger.warning("AI tried to create enemy after combat ended - removing it")
                del result["enemy"]
            result["shouldStartCombat"] = False  # Force no combat
        elif player_hid_or_ran:
            # Player chose to hide/run - ensure no combat starts, continue quest
            if "dangerEncounter" in result:
                logger.info("Player chose to hide/run - removing danger encounter")
                del result["dangerEncounter"]
            if "enemy" in result:
                del result["enemy"]
            result["shouldStartCombat"] = False
            # Ensure story phase is exploration after hiding/running
            result["storyPhase"] = "exploration"
        
        # Handle danger encounter - extract enemy if player chose to attack (ONLY if not after combat and not hiding/running)
        if not is_after_combat and not player_hid_or_ran and result.get("dangerEncounter") and result.get("shouldStartCombat"):
            result["enemy"] = result["dangerEncounter"].get("enemy")
            result["dangerDescription"] = result["dangerEncounter"].get("description", "")
        
        # Final validation: Ensure choices don't contain objects (like items)
        if "choices" in result and isinstance(result.get("choices"), list):
            cleaned_choices = []
            for choice in result.get("choices", []):
                # Skip if it's a dict/object (like an item)
                if isinstance(choice, dict):
                    logger.warning(f"Found object in choices array, skipping: {choice}")
                    continue
                # Only keep strings, numbers that can be converted to strings
                if isinstance(choice, (str, int, float)):
                    cleaned_choices.append(str(choice).strip())
            result["choices"] = cleaned_choices if cleaned_choices else ["Continue", "Explore", "Investigate"]
        
        # Handle final puzzle (NOT combat - it's a puzzle challenge!)
        if result.get("finalPuzzle") and result.get("isFinalPhase"):
            puzzle_data = result["finalPuzzle"]
            result["puzzle"] = puzzle_data
            result["shouldStartCombat"] = False  # No combat for final phase - it's a puzzle!
            
            # Log puzzle info to terminal for testing
            logger.info("=" * 60)
            logger.info("🧩 FINAL PUZZLE GENERATED:")
            logger.info(f"Question: {puzzle_data.get('question', 'N/A')}")
            logger.info(f"Correct Answer: {puzzle_data.get('correctAnswer', 'N/A')}")
            if puzzle_data.get('options'):
                logger.info(f"Options ({len(puzzle_data.get('options', []))}):")
                for i, opt in enumerate(puzzle_data.get('options', []), 1):
                    is_correct = opt.strip().lower() == puzzle_data.get('correctAnswer', '').strip().lower()
                    marker = "✓ CORRECT" if is_correct else ""
                    logger.info(f"  {i}. {opt} {marker}")
            logger.info("=" * 60)
        
        # Check if quest progress indicates final puzzle should appear
        quest_progress = result.get("questProgress", 0)
        if quest_progress >= 85 and not result.get("puzzle") and not is_after_combat and not player_hid_or_ran:
            # Quest is nearly complete - trigger final puzzle phase
            logger.info(f"Quest progress {quest_progress}% - preparing for final puzzle")
            # Don't force it here, let AI generate it naturally, but ensure isFinalPhase is set
            if not result.get("isFinalPhase"):
                result["isFinalPhase"] = True
        
        return result
    except Exception as e:
        logger.error(f"Error in /api/story endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/combat")
async def api_process_combat(request: CombatRequest):
    """Endpoint to process a combat turn."""
    try:
        # Pydantic validates request body against CombatRequest
        result = await process_combat_with_ai(
            request.player,
            request.enemy,
            request.action,
            request.itemId
        )
        return result
    except Exception as e:
        logger.error(f"Error in /api/combat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/save")
async def save_game(save_data: SaveData):
    """Endpoint to save game state."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        # Convert Pydantic model to dict for MongoDB
        save_dict = save_data.model_dump(by_alias=True)
        save_dict["timestamp"] = datetime.datetime.now(datetime.timezone.utc) # Add timestamp

        # Use playerId and saveSlot to uniquely identify the save, upserting it
        result = await db.saves.update_one(
            {"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]},
            {"$set": save_dict},
            upsert=True
        )

        if result.upserted_id:
            save_id = str(result.upserted_id)
            logger.info(f"Game saved successfully with new ID: {save_id}")
            return {"success": True, "saveId": save_id}
        elif result.modified_count > 0:
             # Find the existing document to get its ID if needed, though not strictly necessary for confirmation
             existing_save = await db.saves.find_one({"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]})
             save_id = str(existing_save["_id"]) if existing_save else "unknown (updated)"
             logger.info(f"Game save updated successfully for slot: {save_data.saveSlot}, Player: {save_data.playerId}")
             return {"success": True, "saveId": save_id} # Return existing ID or confirmation
        else:
             logger.warning("Save operation reported no changes.")
             # Might happen if data is identical, still consider it success
             existing_save = await db.saves.find_one({"playerId": save_dict["playerId"], "saveSlot": save_dict["saveSlot"]})
             save_id = str(existing_save["_id"]) if existing_save else "unknown (no change)"
             return {"success": True, "saveId": save_id}

    except Exception as e:
        logger.error(f"Error saving game: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save game: {str(e)}")


# Helper to convert ObjectId to string for JSON serialization
def serialize_save(save):
    if save and "_id" in save:
        save["_id"] = str(save["_id"])
    return save

@app.get("/api/saves/{player_id}")
async def get_saves(player_id: str):
    """Endpoint to retrieve all save slots for a given player ID."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        saves_cursor = db.saves.find({"playerId": player_id}).sort("timestamp", -1) # Sort by most recent
        saves = await saves_cursor.to_list(length=None) # Fetch all saves for the player
        # Return only essential info for the list, not the full gameState
        save_list = [
            {"saveId": str(s["_id"]), "name": s.get("saveName", f"Slot {s.get('saveSlot', '?')}"), "timestamp": s.get("timestamp")}
            for s in saves
        ]
        return save_list
    except Exception as e:
        logger.error(f"Error fetching saves for player {player_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch saves: {str(e)}")

@app.get("/api/load/{save_id}")
async def load_game(save_id: str):
    """Endpoint to load a specific game save state by its MongoDB ObjectId."""
    if not db:
        raise HTTPException(status_code=503, detail="Database connection not available.")
    try:
        obj_id = ObjectId(save_id) # Validate and convert string to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid save ID format.")

    try:
        save = await db.saves.find_one({"_id": obj_id})
        if not save:
            raise HTTPException(status_code=404, detail="Save not found.")

        # Return the gameState part of the save document
        loaded_state = save.get("gameState")
        if not loaded_state:
             raise HTTPException(status_code=404, detail="Save data is corrupt or missing gameState.")

        logger.info(f"Game loaded successfully for save ID: {save_id}")
        return loaded_state # Return only the game state
    except HTTPException as e:
        # Re-raise HTTPExceptions (like 404)
        raise e
    except Exception as e:
        logger.error(f"Error loading game for save ID {save_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load game: {str(e)}")


# --- Root Endpoint ---
@app.get("/")
async def read_root():
    return {"message": "AI Dungeon Master API is running!"}

# --- Run with Uvicorn (if run directly) ---
# Note: The README suggests running `python app.py`. This requires uvicorn to be installed.
# If you run `uvicorn backend.app:app --reload --port 8000`, this block is not needed.
if __name__ == "__main__":
    import uvicorn

    logger.info("Starting Uvicorn server directly...")
    # Add reload=True for development convenience if desired
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))