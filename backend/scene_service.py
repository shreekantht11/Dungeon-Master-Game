import logging
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING

from core.scene_orchestrator import SceneOrchestrator, SceneRenderRequest

load_dotenv()
logger = logging.getLogger(__name__)

mongo_client: Optional[AsyncIOMotorClient] = None
db = None
scene_orchestrator: Optional[SceneOrchestrator] = None
scene_provider_pool: List[Dict[str, Any]] = []


def _build_provider_pool() -> List[Dict[str, Any]]:
    fal_configs = [
        {
            "label": "fal-1",
            "api_key": os.getenv("FAL_API_KEY"),
            "model": os.getenv("FAL_MODEL", "fal-ai/flux/dev"),
            "resolution": os.getenv("FAL_RESOLUTION", "landscape_16_9"),
        },
        {
            "label": "fal-2",
            "api_key": os.getenv("FAL_API_KEY_2"),
            "model": os.getenv("FAL_MODEL_2") or os.getenv("FAL_MODEL", "fal-ai/flux/dev"),
            "resolution": os.getenv("FAL_RESOLUTION_2") or os.getenv("FAL_RESOLUTION", "landscape_16_9"),
        },
        {
            "label": "fal-3",
            "api_key": os.getenv("FAL_API_KEY_3"),
            "model": os.getenv("FAL_MODEL_3") or os.getenv("FAL_MODEL", "fal-ai/flux/dev"),
            "resolution": os.getenv("FAL_RESOLUTION_3") or os.getenv("FAL_RESOLUTION", "landscape_16_9"),
        },
    ]

    pool: List[Dict[str, Any]] = []
    for conf in fal_configs:
        if conf["api_key"]:
            pool.append(
                {
                    "type": "fal",
                    "label": conf["label"],
                    "api_key": conf["api_key"],
                    "model": conf["model"],
                    "resolution": conf["resolution"],
                }
            )
        if len(pool) >= 3:
            break

    return pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db, scene_orchestrator, scene_provider_pool
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        logger.error("MONGODB_URI not configured for scene service.")
        raise RuntimeError("MONGODB_URI is required for scene service.")

    mongo_client = AsyncIOMotorClient(mongo_uri)
    db = mongo_client.ai_dungeon_master
    await db.command("ping")
    await db.scenes.create_index([("sceneId", ASCENDING)], unique=True)
    await db.scenes.create_index([("playerId", ASCENDING), ("createdAt", DESCENDING)])

    # Load provider pool once at startup
    scene_provider_pool = _build_provider_pool()
    if not scene_provider_pool:
        raise RuntimeError("No FAL image provider configured. Set FAL_API_KEY (and optional _2/_3).")

    scene_orchestrator = SceneOrchestrator(db, provider_pool=scene_provider_pool)

    try:
        yield
    finally:
        if mongo_client:
            mongo_client.close()
        scene_orchestrator = None
        logger.info("Scene service shutdown complete.")


app = FastAPI(title="Scene Generation Service", lifespan=lifespan)

scene_cors_origin = os.getenv("SCENE_CORS_ORIGIN", "http://localhost:5173")
allowed_origins = [
    scene_cors_origin,
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/scene/render")
async def render_scene(request: SceneRenderRequest):
    if scene_orchestrator is None:
        raise HTTPException(status_code=503, detail="Scene orchestrator unavailable.")
    try:
        result = await scene_orchestrator.render_scene(request)
        return result
    except ValueError as value_error:
        raise HTTPException(status_code=400, detail=str(value_error)) from value_error
    except Exception as err:
        logger.error(f"Scene render failed: {err}")
        raise HTTPException(status_code=500, detail="Failed to render scene.") from err


@app.get("/api/scene/status/{scene_id}")
async def get_scene(scene_id: str):
    if scene_orchestrator is None:
        raise HTTPException(status_code=503, detail="Scene orchestrator unavailable.")
    scene_doc = await scene_orchestrator.get_scene(scene_id)
    if not scene_doc:
        raise HTTPException(status_code=404, detail="Scene not found.")
    return scene_doc


@app.get("/health")
async def health_check():
    info = scene_orchestrator.get_provider_snapshot() if scene_orchestrator else {}
    return {"status": "ok", **info}


@app.post("/api/scene/rerender/{scene_id}")
async def rerender_scene(scene_id: str):
    if scene_orchestrator is None:
        raise HTTPException(status_code=503, detail="Scene orchestrator unavailable.")
    result = await scene_orchestrator.rerender_scene(scene_id)
    if not result:
        raise HTTPException(status_code=404, detail="Scene context not found.")
    return result


@app.get("/api/provider")
async def get_provider_info():
    if scene_orchestrator is None:
        raise HTTPException(status_code=503, detail="Scene orchestrator unavailable.")
    return scene_orchestrator.get_provider_snapshot()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("SCENE_SERVICE_PORT", "8100")))

