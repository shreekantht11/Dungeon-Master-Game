import asyncio
import base64
import datetime
import logging
import os
import random
import re
import secrets
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

try:
    from fal_client import AsyncClient as FalAsyncClient
except Exception:  # pragma: no cover - optional dependency
    FalAsyncClient = None

logger = logging.getLogger(__name__)


class SceneSubject(BaseModel):
    name: str
    role: str
    description: Optional[str] = None


class SceneAssets(BaseModel):
    imageUrl: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    provider: Optional[str] = None
    model: Optional[str] = None


class ScenePayload(BaseModel):
    sceneId: str
    title: str
    subtitle: Optional[str] = None
    genre: str
    locationName: str
    biome: str
    mood: str
    weather: str
    lighting: str
    timeOfDay: str
    palette: List[str] = Field(default_factory=list)
    heroPose: str
    camera: str
    summary: str
    focalSubjects: List[SceneSubject] = Field(default_factory=list)
    supportingDetails: List[str] = Field(default_factory=list)
    prompts: Dict[str, str] = Field(default_factory=dict)
    status: str = "pending"
    createdAt: Optional[str] = None
    assets: Optional[SceneAssets] = None
    preGeneratedKey: Optional[str] = None


class SceneRenderRequest(BaseModel):
    player: Dict[str, Any]
    genre: str
    storyText: str
    previousEvents: List[Dict[str, Any]] = Field(default_factory=list)
    activeQuest: Optional[Dict[str, Any]] = None
    currentLocation: Optional[str] = None
    gameState: Optional[Dict[str, Any]] = None
    preGeneratedKey: Optional[str] = None


SCENE_MOOD_KEYWORDS = {
    "intense": ["battle", "fight", "fire", "attack", "blood", "storm"],
    "mystic": ["arcane", "mystic", "ancient", "temple", "spirit", "runic"],
    "serene": ["calm", "river", "garden", "peaceful", "rest", "glow"],
    "ominous": ["shadow", "dark", "cursed", "ominous", "fog", "haunted"],
    "victorious": ["victory", "treasure", "celebration", "light", "reward"],
}

SCENE_WEATHER_KEYWORDS = {
    "storm": ["storm", "rain", "thunder", "lightning"],
    "snow": ["snow", "ice", "frost"],
    "fog": ["fog", "mist", "haze"],
    "sunny": ["sun", "bright", "clear"],
    "ember": ["lava", "ember", "ash"],
}

SCENE_COLOR_PALETTES = {
    "intense": ["#ff7847", "#ffb347", "#1f1f1f", "#d13438", "#f0c808"],
    "mystic": ["#4b3b8f", "#6a4c93", "#a27cfe", "#1b1f3b", "#4ad9d9"],
    "serene": ["#72ddf7", "#a0f1db", "#fdfcdc", "#f4d35e", "#ee964b"],
    "ominous": ["#0d0d0d", "#2f2f2f", "#5d1451", "#1a535c", "#4d194d"],
    "victorious": ["#ffd166", "#06d6a0", "#118ab2", "#073b4c", "#ffe29a"],
}

HERO_POSES = [
    "blade poised mid-swing",
    "arcane focus glowing between hands",
    "bow drawn with shimmering arrow",
    "kneeling beside mysterious artifact",
    "cautious stance with torch raised",
]

CAMERA_STYLES = [
    "wide cinematic shot",
    "hero-focused medium shot",
    "dynamic low-angle composition",
    "sweeping aerial view",
    "over-the-shoulder perspective",
]

DEFAULT_NEGATIVE_PROMPT = "lowres, bad anatomy, text artifacts, watermarks, distorted hands, extra limbs"


class SceneOrchestrator:
    def __init__(self, db, provider_pool: Optional[List[Dict[str, Any]]] = None):
        self.db = db
        self.fal_model = os.getenv("FAL_MODEL", "fal-ai/flux/dev")
        self.fal_resolution = os.getenv("FAL_RESOLUTION", "landscape_16_9")
        self.fal_timeout = int(os.getenv("FAL_TIMEOUT", "45"))
        self.fal_max_retries = int(os.getenv("FAL_MAX_RETRIES", "2"))
        self.fal_retry_delay = int(os.getenv("FAL_RETRY_DELAY", "0"))
        self._retry_tasks: Dict[str, asyncio.Task] = {}
        self._active_renders: Dict[str, bool] = {}
        self._provider_index = 0

        self.providers: List[Dict[str, Any]] = []
        raw_pool = provider_pool or []
        for idx, raw in enumerate(raw_pool):
            normalized = self._create_provider_entry(idx, raw)
            if normalized:
                self.providers.append(normalized)

        if not self.providers:
            fallback = self._create_provider_entry(
                0,
                {
                    "label": "fal-default",
                    "api_key": os.getenv("FAL_API_KEY"),
                    "model": self.fal_model,
                    "resolution": self.fal_resolution,
                },
            )
            if fallback:
                self.providers.append(fallback)

    def _create_provider_entry(self, idx: int, raw: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        label = raw.get("label") or f"fal-{idx + 1}"
        api_key = raw.get("api_key") or os.getenv("FAL_API_KEY")
        if not api_key:
            logger.warning("Skipping FAL provider '%s' - API key missing.", label)
            return None
        if FalAsyncClient is None:
            logger.warning("fal_client not installed; cannot use FAL provider '%s'.", label)
            return None
        entry: Dict[str, Any] = {
            "id": label,
            "type": "fal",
            "api_key": api_key,
            "model": raw.get("model") or self.fal_model,
            "resolution": raw.get("resolution") or self.fal_resolution,
            "lock": asyncio.Lock(),
            "failure_count": 0,
            "disabled": False,
            "disabled_reason": None,
        }
        return entry

    def _disable_provider(self, provider: Dict[str, Any], reason: str) -> None:
        provider["disabled"] = True
        provider["disabled_reason"] = reason
        logger.error("Provider %s disabled: %s", provider["id"], reason)

    async def render_scene(self, request: SceneRenderRequest) -> Dict[str, Any]:
        if not request.storyText:
            raise ValueError("storyText is required to generate scenes.")

        payload = self._compose_scene_payload(request)
        
        # Prevent duplicate renders for the same sceneId
        if payload.sceneId in self._active_renders:
            logger.warning(f"Scene {payload.sceneId} is already being rendered. Skipping duplicate render.")
            # Return existing scene if available
            existing_scene = await self.get_scene(payload.sceneId)
            if existing_scene:
                return existing_scene
        
        # Mark as active render
        self._active_renders[payload.sceneId] = True
        
        try:
            render_metadata = await self._render_with_provider(payload)
        finally:
            # Remove from active renders after completion
            self._active_renders.pop(payload.sceneId, None)
        status = render_metadata.get("status", "offline")
        assets = render_metadata.get("assets")
        payload.status = status
        if assets:
            payload.assets = SceneAssets(**assets)

        public_scene = payload.model_dump(exclude={"prompts"})
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if self.db is not None:
            scene_doc = {
                "sceneId": payload.sceneId,
                "playerId": request.player.get("name"),
                "turn": (request.gameState or {}).get("turnCount", 0),
                "genre": request.genre,
                "status": status,
                "scene": public_scene,
                "assets": assets,
                "createdAt": payload.createdAt or now,
                "updatedAt": now,
                "context": request.model_dump(exclude_none=True),
                "preGeneratedKey": request.preGeneratedKey,
            }
            await self.db.scenes.update_one(
                {"sceneId": payload.sceneId},
                {"$set": scene_doc},
                upsert=True,
            )

        response_payload: Dict[str, Any] = {
            "scene": public_scene,
            "sceneId": payload.sceneId,
            "sceneStatus": status,
            "preGeneratedKey": request.preGeneratedKey,
        }
        if assets:
            response_payload["sceneAssets"] = assets
        return response_payload

    async def get_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        if self.db is None:
            return None
        scene_doc = await self.db.scenes.find_one({"sceneId": scene_id})
        if not scene_doc:
            return None
        return {
            "sceneId": scene_doc.get("sceneId"),
            "scene": scene_doc.get("scene"),
            "sceneStatus": scene_doc.get("status", "offline"),
            "sceneAssets": scene_doc.get("assets"),
            "updatedAt": scene_doc.get("updatedAt"),
        }

    async def rerender_scene(self, scene_id: str) -> Optional[Dict[str, Any]]:
        if self.db is None:
            return None
        scene_doc = await self.db.scenes.find_one({"sceneId": scene_id})
        if not scene_doc:
            return None
        context = scene_doc.get("context")
        if not context:
            return None
        request = SceneRenderRequest(**context)
        return await self.render_scene(request)

    def _compose_scene_payload(self, request: SceneRenderRequest) -> ScenePayload:
        player = request.player or {}
        scene_id = secrets.token_hex(12)
        mood = self._infer_scene_mood(request.storyText)
        weather = self._infer_scene_weather(request.storyText)
        time_of_day = self._infer_time_of_day(request.storyText)
        palette = self._select_palette(mood, request.genre)
        biome = self._derive_biome(request.genre, request.currentLocation)
        summary = self._safe_story_excerpt(request.storyText)
        subtitle = (request.activeQuest or {}).get("title") or request.currentLocation or request.genre
        hero_subject = SceneSubject(
            name=player.get("name", "Unknown Hero"),
            role=f"Level {player.get('level', 1)} {player.get('class', 'Adventurer')}",
            description=f"{player.get('class', 'Hero')} exploring the realm",
        )
        supporting = []
        quest_desc = (request.activeQuest or {}).get("description")
        if quest_desc:
            supporting.append(f"Quest focus: {quest_desc}")
        if request.currentLocation:
            supporting.append(f"Location highlight: {request.currentLocation}")
        supporting.append(f"Weather tone: {weather}")
        payload = ScenePayload(
            sceneId=scene_id,
            title=f"{player.get('name', 'Hero')}'s {mood.title()} Moment",
            subtitle=subtitle,
            genre=request.genre,
            locationName=request.currentLocation or biome.title(),
            biome=biome,
            mood=mood,
            weather=weather,
            lighting="dramatic rim light" if mood in {"intense", "ominous"} else "soft bounce light",
            timeOfDay=time_of_day,
            palette=palette,
            heroPose=random.choice(HERO_POSES),
            camera=random.choice(CAMERA_STYLES),
            summary=summary,
            focalSubjects=[hero_subject],
            supportingDetails=supporting,
            createdAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        )
        if request.preGeneratedKey:
            payload.preGeneratedKey = request.preGeneratedKey
        payload.prompts = self._build_scene_prompts(payload, player, summary, request.activeQuest)
        return payload

    async def _render_with_provider(self, scene_payload: ScenePayload) -> Dict[str, Any]:
        if not self.providers:
            return {"status": "offline"}

        tried_ids = set()
        attempts = 0
        total = len(self.providers)

        while attempts < total:
            provider = self._next_provider()
            attempts += 1
            if not provider or provider["id"] in tried_ids:
                continue
            if provider.get("disabled"):
                continue
            tried_ids.add(provider["id"])

            lock: asyncio.Lock = provider["lock"]
            if lock.locked():
                continue

            async with lock:
                assets = await self._attempt_scene_render_with_fal(scene_payload, provider)

            if assets:
                provider["failure_count"] = 0
                return {"status": "ready", "assets": assets}

            provider["failure_count"] = provider.get("failure_count", 0) + 1

        self._schedule_scene_retry(scene_payload)
        return {"status": "pending"}

        return {"status": "offline"}

    def _next_provider(self) -> Optional[Dict[str, Any]]:
        if not self.providers:
            return None
        provider = self.providers[self._provider_index % len(self.providers)]
        self._provider_index = (self._provider_index + 1) % len(self.providers)
        return provider if not provider.get("disabled") else self._get_primary_provider()

    async def _attempt_scene_render_with_fal(
        self, scene_payload: ScenePayload, provider: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        if FalAsyncClient is None:
            logger.error("fal_client library unavailable. Cannot use FAL image provider.")
            self._disable_provider(provider, "fal_client missing")
            return None

        client = FalAsyncClient(key=provider["api_key"])
        arguments = {
            "prompt": scene_payload.prompts.get("base"),
            "image_size": provider.get("resolution") or self.fal_resolution,
            "num_images": 1,
        }
        negative_prompt = scene_payload.prompts.get("negative")
        if negative_prompt:
            arguments["negative_prompt"] = negative_prompt

        try:
            response = await client.run(provider.get("model") or self.fal_model, arguments=arguments)
        except Exception as fal_error:
            logger.warning(f"FAL render failed for scene {scene_payload.sceneId}: {fal_error}")
            return None
        finally:
            closer = getattr(client, "close", None)
            if callable(closer):
                try:
                    await closer()
                except Exception:
                    pass

        images = None
        if isinstance(response, dict):
            images = response.get("images") or response.get("image")
        if not images:
            return None

        if isinstance(images, list):
            if len(images) > 1:
                logger.warning(
                    "Scene %s: FAL returned %s images, using the first.",
                    scene_payload.sceneId,
                    len(images),
                )
            first = images[0]
        else:
            first = images

        if not isinstance(first, dict):
            logger.error("Scene %s: Invalid FAL image payload.", scene_payload.sceneId)
            return None

        url = first.get("url") or first.get("signed_url") or first.get("image_url")
        if not url:
            return None

        return {
            "imageUrl": url,
            "thumbnailUrl": first.get("thumbnail") or url,
            "width": first.get("width"),
            "height": first.get("height"),
            "provider": "fal",
            "model": provider.get("model") or self.fal_model,
        }

    def _schedule_scene_retry(self, scene_payload: ScenePayload) -> None:
        if scene_payload.sceneId in self._retry_tasks:
            return
        provider = self._next_provider()
        if provider is None or provider.get("disabled"):
            return
        if self.fal_max_retries <= 0:
            return
        payload_data = scene_payload.model_dump()

        async def _runner() -> None:
            for attempt in range(1, self.fal_max_retries + 1):
                try:
                    fresh_payload = ScenePayload(**payload_data)
                    async with provider["lock"]:
                        assets = await self._attempt_scene_render_with_fal(fresh_payload, provider)
                    if assets:
                        await self._update_scene_assets(fresh_payload.sceneId, assets, "ready")
                        return
                except Exception as retry_err:
                    logger.warning(f"Scene retry attempt {attempt} failed: {retry_err}")
                if self.fal_retry_delay > 0:
                    await asyncio.sleep(self.fal_retry_delay)
            await self._update_scene_assets(payload_data.get("sceneId"), None, "offline")

        task = asyncio.create_task(_runner())

        def _cleanup_task(_: asyncio.Task) -> None:
            self._retry_tasks.pop(scene_payload.sceneId, None)

        task.add_done_callback(_cleanup_task)
        self._retry_tasks[scene_payload.sceneId] = task

    async def _update_scene_assets(self, scene_id: Optional[str], assets: Optional[Dict[str, Any]], status: str) -> None:
        if not scene_id or self.db is None:
            return
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_fields: Dict[str, Any] = {
            "status": status,
            "scene.status": status,
            "updatedAt": now,
        }
        if assets:
            update_fields["assets"] = assets
            update_fields["scene.assets"] = assets
        await self.db.scenes.update_one(
            {"sceneId": scene_id},
            {"$set": update_fields},
        )

    def _safe_story_excerpt(self, text: str, limit: int = 320) -> str:
        if not text:
            return ""
        clean = re.sub(r"\s+", " ", text).strip()
        return clean[:limit] + ("..." if len(clean) > limit else "")

    def get_provider_snapshot(self) -> Dict[str, Any]:
        if not self.providers:
            return {"providerPool": []}
        primary = self._get_primary_provider()
        pool_info = []
        for provider in self.providers:
            pool_info.append(
                {
                    "id": provider["id"],
                    "provider": provider["type"],
                    "model": provider.get("model"),
                    "busy": provider["lock"].locked(),
                    "failures": provider.get("failure_count", 0),
                    "disabled": provider.get("disabled", False),
                    "reason": provider.get("disabled_reason"),
                }
            )
        return {
            "provider": primary.get("type"),
            "model": primary.get("model"),
            "providerPool": pool_info,
        }

    def _get_primary_provider(self) -> Dict[str, Any]:
        for provider in self.providers:
            if not provider.get("disabled"):
                return provider
        return self.providers[0]

    def _infer_scene_mood(self, story_text: str) -> str:
        lowered = story_text.lower()
        for mood, keywords in SCENE_MOOD_KEYWORDS.items():
            if any(word in lowered for word in keywords):
                return mood
        return "serene"

    def _infer_scene_weather(self, story_text: str) -> str:
        lowered = story_text.lower()
        for weather, keywords in SCENE_WEATHER_KEYWORDS.items():
            if any(word in lowered for word in keywords):
                return weather
        return "sunny"

    def _infer_time_of_day(self, story_text: str) -> str:
        lowered = story_text.lower()
        if any(word in lowered for word in ["dawn", "sunrise", "morning"]):
            return "dawn"
        if any(word in lowered for word in ["noon", "bright"]):
            return "day"
        if any(word in lowered for word in ["dusk", "evening", "sunset"]):
            return "dusk"
        if any(word in lowered for word in ["night", "moon", "stars", "midnight"]):
            return "night"
        return random.choice(["day", "dusk"])

    def _select_palette(self, mood: str, genre: str) -> List[str]:
        if mood in SCENE_COLOR_PALETTES:
            return SCENE_COLOR_PALETTES[mood]
        if genre == "Mystery":
            return ["#1b1b2f", "#16213e", "#0f3460", "#53354a", "#e84545"]
        if genre == "Sci-Fi":
            return ["#0f2027", "#203a43", "#2c5364", "#00b4d8", "#90e0ef"]
        if genre == "Mythical":
            return ["#331832", "#c84b31", "#f3ecc8", "#daa49a", "#c1a57b"]
        return SCENE_COLOR_PALETTES["serene"]

    def _derive_biome(self, genre: str, location: Optional[str]) -> str:
        if location:
            lowered = location.lower()
            if any(token in lowered for token in ["forest", "grove", "woods"]):
                return "enchanted forest"
            if any(token in lowered for token in ["desert", "dune", "waste"]):
                return "sun-scorched desert"
            if any(token in lowered for token in ["city", "village", "town"]):
                return "ancient settlement"
            if "temple" in lowered or "ruin" in lowered:
                return "sacred ruins"
        genre_defaults = {
            "Fantasy": "mossy dungeon hall",
            "Mystery": "fog-laced alley",
            "Sci-Fi": "orbital observation deck",
            "Mythical": "celestial amphitheater",
        }
        return genre_defaults.get(genre, "mystic crossroads")

    def _build_scene_prompts(
        self,
        payload: ScenePayload,
        player: Dict[str, Any],
        story_excerpt: str,
        active_quest: Optional[Dict[str, Any]],
    ) -> Dict[str, str]:
        quest_line = ""
        if active_quest:
            quest_line = (
                f"The hero is advancing the quest '{active_quest.get('title', '')}' which is about "
                f"{(active_quest.get('description') or '').lower()}."
            )
        focal = ", ".join([subject.name for subject in payload.focalSubjects]) or player.get("name", "Hero")
        base_prompt = (
            f"Ultra-detailed, high fidelity {payload.genre} illustration set in a {payload.biome} at {payload.timeOfDay}. "
            f"The weather is {payload.weather} with lighting that feels {payload.lighting}. "
            f"Focus on {focal} with a {payload.heroPose} and capture the mood as {payload.mood}. "
            f"Camera style: {payload.camera}. "
            f"Story context: {story_excerpt}. {quest_line} "
            f"Palette: {', '.join(payload.palette)}. Bright, vibrant, high-exposure daylight with luminous rim lighting, reflective highlights, and crisp contrast. "
            f"Make the scene feel sunlit, saturated, and vivid with cinematic volumetric light rays and glowy atmospherics for a fast concept-art render."
        )
        negative_prompt = f"{DEFAULT_NEGATIVE_PROMPT}, oversaturated skin, text overlays, extra limbs, malformed hands"
        return {"base": base_prompt, "negative": negative_prompt}

