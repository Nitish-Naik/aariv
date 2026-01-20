import { api } from '../services/api';
import { getCurrentUser, isSignedIn, signInWithGoogle, signOut } from '../services/auth';
import * as storage from '../utils/storage';

jest.mock('../services/api');
jest.mock('../utils/storage');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('should sign in successfully and store user data', async () => {
      const mockUser = { id: '123', email: 'test@example.com', name: 'Test User' };
      const mockToken = 'session_123';
      
      (api.post as jest.Mock).mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });

      const result = await signInWithGoogle('mock-id-token');

      expect(api.post).toHaveBeenCalledWith('/auth/google', { idToken: 'mock-id-token' });
      expect(storage.storeUserData).toHaveBeenCalledWith('user', mockUser);
      expect(storage.storeUserData).toHaveBeenCalledWith('token', mockToken);
      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
    });

    it('should throw error on invalid server response', async () => {
      (api.post as jest.Mock).mockResolvedValue({});

      await expect(signInWithGoogle('mock-token')).rejects.toThrow('Invalid response from server');
    });
  });

  describe('signOut', () => {
    it('should clear stored user data', async () => {
      await signOut();

      expect(storage.storeUserData).toHaveBeenCalledWith('user', null);
      expect(storage.storeUserData).toHaveBeenCalledWith('token', null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return stored user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (storage.getUserData as jest.Mock).mockResolvedValue(mockUser);

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(storage.getUserData).toHaveBeenCalledWith('user');
    });
  });

  describe('isSignedIn', () => {
    it('should return true when user exists', async () => {
      (storage.getUserData as jest.Mock).mockResolvedValue({ id: '123' });

      const signedIn = await isSignedIn();

      expect(signedIn).toBe(true);
    });

    it('should return false when no user', async () => {
      (storage.getUserData as jest.Mock).mockResolvedValue(null);

      const signedIn = await isSignedIn();

      expect(signedIn).toBe(false);
    });
  });
});
