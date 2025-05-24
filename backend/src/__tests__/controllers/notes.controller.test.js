import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotes, getNote, deleteNote } from '../../controllers/notes.controller.js';
import Note from '../../models/Note.js';

// Mock the Note model
vi.mock('../../models/Note.js', () => {
  return {
    default: {
      find: vi.fn(),
      findById: vi.fn(),
      findByIdAndDelete: vi.fn()
    }
  };
});

describe('Notes Controller', () => {
  let req;
  let res;
  let next;
  
  // Sample note data for testing
  const mockNotes = [
    { _id: '1', title: 'Note 1', content: 'Content 1', author: 'User 1', date: new Date() },
    { _id: '2', title: 'Note 2', content: 'Content 2', author: 'User 2', date: new Date() }
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    
    // Create mock request, response, and next function
    req = {
      params: {}
    };
    res = {
      json: vi.fn(),
      sendStatus: vi.fn()
    };
    next = vi.fn();
  });

  describe('getNotes', () => {
    it('should return all notes', async () => {
      // Setup the mock to return our mock data
      Note.find.mockResolvedValue(mockNotes);
      
      // Call the function
      await getNotes(req, res, next);
      
      // Assertions
      expect(Note.find).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockNotes);
    });

    it('should call next with error when Note.find fails', async () => {
      // Setup the mock to throw an error
      const error = new Error('Database error');
      Note.find.mockRejectedValue(error);
      
      // Call the function
      await getNotes(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getNote', () => {
    it('should return a note by id', async () => {
      // Setup
      const noteId = '1';
      req.params.id = noteId;
      Note.findById.mockResolvedValue(mockNotes[0]);
      
      // Call the function
      await getNote(req, res, next);
      
      // Assertions
      expect(Note.findById).toHaveBeenCalledWith(noteId);
      expect(res.json).toHaveBeenCalledWith(mockNotes[0]);
    });

    it('should return 404 when note does not exist', async () => {
      // Setup
      req.params.id = 'nonexistent';
      Note.findById.mockResolvedValue(null);
      
      // Call the function
      await getNote(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        status: 404
      }));
    });
  });

  describe('deleteNote', () => {
    it('should delete a note by id', async () => {
      // Setup
      const noteId = '1';
      req.params.id = noteId;
      Note.findByIdAndDelete.mockResolvedValue(mockNotes[0]);
      
      // Call the function
      await deleteNote(req, res, next);
      
      // Assertions
      expect(Note.findByIdAndDelete).toHaveBeenCalledWith(noteId);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('should return 404 when note to delete does not exist', async () => {
      // Setup
      req.params.id = 'nonexistent';
      Note.findByIdAndDelete.mockResolvedValue(null);
      
      // Call the function
      await deleteNote(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        status: 404
      }));
    });
  });
});
