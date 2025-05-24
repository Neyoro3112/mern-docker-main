import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers } from '../../controllers/users.controller.js';
import User from '../../models/User.js';

// Mock the User model
vi.mock('../../models/User.js', () => {
  return {
    default: {
      find: vi.fn()
    }
  };
});

describe('Users Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Create mock request, response, and next function
    req = {};
    res = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis()
    };
    next = vi.fn();
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      // Mock data
      const mockUsers = [
        { _id: '1', username: 'user1' },
        { _id: '2', username: 'user2' }
      ];
      
      // Setup the mock to return our mock data
      User.find.mockResolvedValue(mockUsers);
      
      // Call the function
      await getUsers(req, res, next);
      
      // Assertions
      expect(User.find).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error when User.find fails', async () => {
      // Setup the mock to throw an error
      const error = new Error('Database error');
      User.find.mockRejectedValue(error);
      
      // Call the function
      await getUsers(req, res, next);
      
      // Assertions
      expect(User.find).toHaveBeenCalledTimes(1);
      expect(res.json).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
