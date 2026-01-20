import { API_URL, api } from "../services/api";
import * as auth from '../services/auth';

jest.mock('../services/auth');

global.fetch = jest.fn();

describe("api.ts config", () => {
  it("should have a valid API_URL", () => {
    expect(API_URL).toBeDefined();
    expect(typeof API_URL).toBe("string");
    expect(API_URL.includes("://")).toBe(true); // Contains scheme
  });

  it("should support env override via EXPO_PUBLIC_API_URL", () => {
    // This test is informational; in CI you'd set EXPO_PUBLIC_API_URL
    if (process.env.EXPO_PUBLIC_API_URL) {
      expect(API_URL).toContain(process.env.EXPO_PUBLIC_API_URL.split(":")[0]);
    }
  });
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { messages: [] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await api.get('/inbox?userId=123');

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should handle 401 and sign out', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(api.get('/inbox')).rejects.toThrow('Session expired');
      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockResponse = { success: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.post('/chat', { userId: '123', message: 'Hello' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: '123', message: 'Hello' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

