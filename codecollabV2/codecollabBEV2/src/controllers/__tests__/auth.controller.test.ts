import { Request, Response } from 'express';
import { register, login, logout, getCurrentUser } from '../auth.controller';
import { supabaseClient } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  },
}));

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockReq = {
      body: {},
      headers: {},
    };
    mockRes = {
      status: mockStatus,
      json: mockJson,
    };
  });

  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      await register(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Email, password, and username are required',
      });
    });

    it('should successfully register a user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      (supabaseClient.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      (supabaseClient.from as jest.Mock)().single.mockResolvedValueOnce({
        data: { ...mockUser, username: 'testuser' },
        error: null,
      });

      await register(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      await login(mockReq as Request, mockRes as Response);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
    });

    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      (supabaseClient.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      (supabaseClient.from as jest.Mock)().single.mockResolvedValueOnce({
        data: { ...mockUser, username: 'testuser' },
        error: null,
      });

      await login(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout a user', async () => {
      (supabaseClient.auth.signOut as jest.Mock).mockResolvedValueOnce({
        error: null,
      });

      await logout(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return 401 if no user is authenticated', async () => {
      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await getCurrentUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Not authenticated',
      });
    });

    it('should return the current user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
      };

      (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      (supabaseClient.from as jest.Mock)().single.mockResolvedValueOnce({
        data: { ...mockUser, username: 'testuser' },
        error: null,
      });

      await getCurrentUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
    });
  });
}); 
