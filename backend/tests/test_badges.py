import datetime
import pytest

from backend.story_service import resolve_badges, BADGE_DEFINITIONS


@pytest.mark.asyncio
async def test_resolve_badges_adds_new_entries(monkeypatch):
    existing = [
        {
            "id": "trailblazer",
            "title": BADGE_DEFINITIONS["trailblazer"]["title"],
            "description": BADGE_DEFINITIONS["trailblazer"]["description"],
            "icon": BADGE_DEFINITIONS["trailblazer"]["icon"],
            "earnedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    ]

    badges, newly_unlocked = await resolve_badges(
        "PlayerOne",
        existing,
        {"trailblazer", "puzzle_master"},
    )

    assert len(badges) == 2
    assert any(badge["id"] == "puzzle_master" for badge in badges)
    assert len(newly_unlocked) == 1
    assert newly_unlocked[0]["id"] == "puzzle_master"


@pytest.mark.asyncio
async def test_resolve_badges_ignores_unknown_ids():
    badges, newly_unlocked = await resolve_badges("PlayerTwo", [], {"unknown"})

    assert badges == []
    assert newly_unlocked == []


