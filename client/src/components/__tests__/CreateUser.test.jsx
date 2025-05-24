import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import CreateUser from '../CreateUser';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock window.confirm
const originalConfirm = window.confirm;

describe('CreateUser Component', () => {
  const mockUsers = [
    { _id: '1', username: 'testuser1' },
    { _id: '2', username: 'testuser2' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Mock axios.get to return mock users
    axios.get.mockResolvedValue({ data: mockUsers });
  });

  afterAll(() => {
    // Restore the original window.confirm
    window.confirm = originalConfirm;
  });

  test('renders form and user list', async () => {
    render(<CreateUser />);
    
    // Check if form elements are rendered
    expect(screen.getByText('Create New User')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    
    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
      expect(screen.getByText('testuser2')).toBeInTheDocument();
    });
    
    // Verify that axios.get was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith('/api/users');
  });

  test('adds a new user when form is submitted', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock axios.post
    axios.post.mockResolvedValue({});
    
    render(<CreateUser />);
    
    // Type in the username input
    const input = screen.getByRole('textbox');
    await user.type(input, 'newuser');
    expect(input).toHaveValue('newuser');
    
    // Submit the form
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    // Verify that axios.post was called with the correct URL and data
    expect(axios.post).toHaveBeenCalledWith('/api/users', { username: 'newuser' });
    
    // Verify that axios.get was called again to refresh the user list
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith('/api/users');
    
    // Check if the input was cleared after submission
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  test('deletes a user when confirmed', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock window.confirm to return true
    window.confirm = vi.fn(() => true);
    
    // Mock axios.delete
    axios.delete.mockResolvedValue({});
    
    render(<CreateUser />);
    
    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });
    
    // Double click on the first user to delete it
    const firstUser = screen.getByText('testuser1');
    await user.dblClick(firstUser);
    
    // Verify that window.confirm was called
    expect(window.confirm).toHaveBeenCalledWith('are you sure you want to delete it?');
    
    // Verify that axios.delete was called with the correct URL
    expect(axios.delete).toHaveBeenCalledWith('/api/users/1');
    
    // Verify that axios.get was called again to refresh the user list
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('does not delete a user when not confirmed', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock window.confirm to return false
    window.confirm = vi.fn(() => false);
    
    render(<CreateUser />);
    
    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('testuser1')).toBeInTheDocument();
    });
    
    // Double click on the first user to delete it
    const firstUser = screen.getByText('testuser1');
    await user.dblClick(firstUser);
    
    // Verify that window.confirm was called
    expect(window.confirm).toHaveBeenCalledWith('are you sure you want to delete it?');
    
    // Verify that axios.delete was NOT called
    expect(axios.delete).not.toHaveBeenCalled();
    
    // Verify that axios.get was NOT called again
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
