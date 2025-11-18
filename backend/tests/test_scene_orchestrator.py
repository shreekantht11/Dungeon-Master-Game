import pytest

from backend.core.scene_orchestrator import SceneOrchestrator, SceneRenderRequest


def _make_request(**overrides) -> SceneRenderRequest:
    base_payload = {
        "player": {
            "name": "Aria",
            "class": "Warrior",
            "gender": "Other",
            "level": 5,
            "health": 120,
            "maxHealth": 120,
            "xp": 50,
            "maxXp": 150,
            "coins": 200,
            "dungeonLevel": 2,
            "stats": {"strength": 12, "intelligence": 8, "agility": 9},
        },
        "genre": "Fantasy",
        "storyText": "The hero steps into a torch-lit hall filled with ancient murals.",
        "previousEvents": [],
        "activeQuest": None,
        "currentLocation": "Ancient Hall",
        "gameState": {"turnCount": 4},
    }
    base_payload.update(overrides)
    return SceneRenderRequest(**base_payload)


@pytest.mark.asyncio
async def test_scene_orchestrator_returns_payload_without_renderer(monkeypatch):
    orchestrator = SceneOrchestrator(db=None)

    async def fake_render(self, payload):
        return {"status": "offline"}

    monkeypatch.setattr(SceneOrchestrator, "_render_with_fal", fake_render)

    result = await orchestrator.render_scene(_make_request())

    assert result["scene"]["sceneId"]
    assert result["sceneStatus"] == "offline"


@pytest.mark.asyncio
async def test_scene_orchestrator_includes_assets_when_renderer_ready(monkeypatch):
    orchestrator = SceneOrchestrator(db=None)

    async def fake_render(self, payload):
        return {
            "status": "ready",
            "assets": {"imageUrl": "https://example.com/scene.png", "provider": "test"},
        }

    monkeypatch.setattr(SceneOrchestrator, "_render_with_fal", fake_render)

    request = _make_request(
        genre="Mythical",
        storyText="Divine light pours over the marble dais as celestial choirs swell.",
        activeQuest={"title": "Celestial Accord", "description": "Broker peace between rival pantheons."},
        currentLocation="Sky Temple",
        gameState={"turnCount": 7},
    )
    result = await orchestrator.render_scene(request)

    assert result["sceneStatus"] == "ready"
    assert result["sceneAssets"]["imageUrl"] == "https://example.com/scene.png"

