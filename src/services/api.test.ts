import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from './api';

declare global {
  // eslint-disable-next-line no-var
  var __lastFetchUrl: string | undefined;
  // eslint-disable-next-line no-var
  var __lastFetchOptions: RequestInit | undefined;
}

const okJson = (data: any) => ({ ok: true, json: async () => data } as Response);

beforeEach(() => {
  global.__lastFetchUrl = undefined;
  global.__lastFetchOptions = undefined;
  // @ts-expect-error override
  global.fetch = vi.fn(async (url: string, opts?: any) => {
    global.__lastFetchUrl = url;
    global.__lastFetchOptions = opts;
    return okJson({ success: true });
  });
});

describe('api service endpoints', () => {
  it('calls correct URL for loadGame', async () => {
    await api.loadGame('abc123');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/load/abc123')).toBe(true);
  });

  it('calls correct URL for loadGameByName', async () => {
    await api.loadGameByName('Alice');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.includes('/api/load/by-name')).toBe(true);
    expect(global.__lastFetchUrl!.includes('name=Alice')).toBe(true);
  });

  it('calls correct URL for renameSave', async () => {
    await api.renameSave('id1', 'New Name');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/saves/id1')).toBe(true);
  });

  it('calls correct URL for deleteSave', async () => {
    await api.deleteSave('id2');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/saves/id2')).toBe(true);
  });

  it('calls correct URL for arcade puzzle catalog', async () => {
    await api.getPuzzleCatalog('Hero');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl).toContain('/api/minigames/puzzles');
    expect(global.__lastFetchUrl).toContain('playerId=Hero');
  });

  it('calls correct URL for starting an arcade puzzle', async () => {
    await api.startPuzzleSession({ playerId: 'Hero', puzzleId: 'p1' });
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/minigames/puzzles/start')).toBe(true);
    expect(global.__lastFetchOptions?.method).toBe('POST');
    expect(global.__lastFetchOptions?.body).toContain('p1');
  });

  it('calls correct URL for submitting an arcade puzzle result', async () => {
    await api.submitPuzzleResult({ playerId: 'Hero', puzzleId: 'p1', answer: 'A', timeTaken: 42, hintsUsed: 1 });
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/minigames/puzzles/submit')).toBe(true);
    expect(global.__lastFetchOptions?.method).toBe('POST');
    expect(global.__lastFetchOptions?.body).toContain('"answer":"A"');
  });

  it('calls correct URL for getSaves', async () => {
    await api.getSaves('Player');
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/saves/Player')).toBe(true);
  });

  it('calls correct URL for createCameoInvite and sends payload', async () => {
    await api.createCameoInvite({
      playerId: 'Hero',
      cameoPlayer: {
        name: 'Hero',
        class: 'Warrior',
        gender: 'Male',
        level: 5,
        health: 100,
        maxHealth: 100,
        xp: 200,
        maxXp: 400,
        position: { x: 0, y: 0 },
        inventory: [],
        stats: { strength: 10, intelligence: 5, agility: 7 },
      },
      personalMessage: 'Join me!',
      expiresInMinutes: 60,
    });
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/cameo/invite')).toBe(true);
    expect(global.__lastFetchOptions?.method).toBe('POST');
    expect(global.__lastFetchOptions?.body).toContain('Join me!');
  });

  it('calls correct URL for acceptCameoInvite', async () => {
    await api.acceptCameoInvite({ playerId: 'Hero', inviteCode: 'ABCD1234' });
    expect(global.__lastFetchUrl).toBeDefined();
    expect(global.__lastFetchUrl!.endsWith('/api/cameo/accept')).toBe(true);
    expect(global.__lastFetchOptions?.method).toBe('POST');
    expect(global.__lastFetchOptions?.body).toContain('ABCD1234');
  });
});


