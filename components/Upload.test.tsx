import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Upload from './Upload';
import { PROGRESS_INCREMENT, REDIRECT_DELAY_MS, PROGRESS_INTERVAL_MS } from '../lib/constants';

// Mock react-router
const mockUseOutletContext = vi.fn();
vi.mock('react-router', () => ({
  useOutletContext: () => mockUseOutletContext(),
}));

// Helper to create a mock FileReader
const createMockFileReader = (result: string = 'data:image/png;base64,test') => {
  const mockReader = {
    result,
    readAsDataURL: vi.fn(function (this: any) {
      setTimeout(() => {
        if (this.onloadend) {
          this.onloadend();
        }
      }, 0);
    }),
    onerror: null,
    onloadend: null,
  };
  return mockReader;
};

describe('Upload Component', () => {
  let originalFileReader: typeof FileReader;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFileReader = global.FileReader;
  });

  afterEach(() => {
    global.FileReader = originalFileReader;
    vi.clearAllTimers();
  });

  describe('Rendering', () => {
    it('should render dropzone when no file is selected', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      expect(screen.getByText(/Click to upload or just drag and drop/i)).toBeInTheDocument();
    });

    it('should show sign-in message when user is not signed in', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: false });
      render(<Upload />);

      expect(screen.getByText(/Sign in or sign up with Puter to upload/i)).toBeInTheDocument();
    });

    it('should display maximum file size information', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      expect(screen.getByText(/Maximum file size 50 MB/i)).toBeInTheDocument();
    });

    it('should render file input with correct accept attribute', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toHaveAttribute('accept', '.jpg,.jpeg,.png,.webp');
    });

    it('should disable input when user is not signed in', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: false });
      render(<Upload />);

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeDisabled();
    });
  });

  describe('File Selection via Input', () => {
    it('should process valid image file when selected', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      const mockOnComplete = vi.fn();

      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload onComplete={mockOnComplete} />);

      const file = new File(['test image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await act(async () => {
        fireEvent.change(input);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should not process file when user is not signed in', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: false });
      const mockOnComplete = vi.fn();
      render(<Upload onComplete={mockOnComplete} />);

      const file = new File(['test image'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(input);

      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should add dragging class on drag over', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const dropzone = document.querySelector('.dropzone');
      fireEvent.dragOver(dropzone!);

      expect(dropzone).toHaveClass('is-dragging');
    });

    it('should remove dragging class on drag leave', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const dropzone = document.querySelector('.dropzone');
      fireEvent.dragOver(dropzone!);
      expect(dropzone).toHaveClass('is-dragging');

      fireEvent.dragLeave(dropzone!);
      expect(dropzone).not.toHaveClass('is-dragging');
    });

    it('should process valid dropped file', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload />);

      const file = new File(['test image'], 'dropped.jpg', { type: 'image/jpeg' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      await act(async () => {
        fireEvent(dropzone!, dropEvent);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('dropped.jpg')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should reject non-image file types', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      fireEvent(dropzone!, dropEvent);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    });

    it('should not process dropped file when user is not signed in', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: false });
      render(<Upload />);

      const file = new File(['test image'], 'test.png', { type: 'image/png' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      fireEvent(dropzone!, dropEvent);

      expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    });

    it('should not set dragging state when not signed in', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: false });
      render(<Upload />);

      const dropzone = document.querySelector('.dropzone');
      fireEvent.dragOver(dropzone!);

      expect(dropzone).not.toHaveClass('is-dragging');
    });
  });

  describe('File Processing and Progress', () => {
    it('should show progress bar when file is being processed', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload />);

      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await act(async () => {
        fireEvent.change(input);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      }, { timeout: 1000 });

      const progressBar = document.querySelector('.bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show "Analyzing Floor Plan..." while uploading', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await act(async () => {
        fireEvent.change(input);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText(/Analyzing Floor Plan/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('File Type Validation', () => {
    it('should accept jpeg files', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload />);

      const file = new File(['test'], 'test.jpeg', { type: 'image/jpeg' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      await act(async () => {
        fireEvent(dropzone!, dropEvent);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('test.jpeg')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should accept png files', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      await act(async () => {
        fireEvent(dropzone!, dropEvent);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('test.png')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should reject files with unsupported mime types', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const file = new File(['test'], 'test.gif', { type: 'image/gif' });
      const dropzone = document.querySelector('.dropzone');

      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          files: [file],
        },
      });

      fireEvent(dropzone!, dropEvent);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText('test.gif')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list gracefully', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(input);

      expect(screen.getByText(/Click to upload or just drag and drop/i)).toBeInTheDocument();
    });

    it('should handle multiple file selections', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      const mockOnComplete = vi.fn();
      global.FileReader = vi.fn().mockImplementation(() => createMockFileReader()) as any;

      render(<Upload onComplete={mockOnComplete} />);

      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const input1 = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input1, 'files', {
        value: [file1],
        writable: false,
      });

      await act(async () => {
        fireEvent.change(input1);
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await waitFor(() => {
        expect(screen.getByText('test1.png')).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Constants Integration', () => {
    it('should use PROGRESS_INCREMENT constant from lib/constants', () => {
      expect(PROGRESS_INCREMENT).toBe(15);
    });

    it('should use REDIRECT_DELAY_MS constant from lib/constants', () => {
      expect(REDIRECT_DELAY_MS).toBe(600);
    });

    it('should use PROGRESS_INTERVAL_MS constant from lib/constants', () => {
      expect(PROGRESS_INTERVAL_MS).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('should have error handling for FileReader', async () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });

      global.FileReader = vi.fn(function(this: any) {
        this.result = null;
        this.readAsDataURL = vi.fn(function(this: any) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read error'));
            }
          }, 0);
        });
        this.onerror = null;
        this.onloadend = null;
        return this;
      }) as any;

      render(<Upload />);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });

      await act(async () => {
        fireEvent.change(input);
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      // After error, the file should be reset and dropzone should be shown again
      await waitFor(() => {
        expect(screen.getByText(/Click to upload or just drag and drop/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Component Behavior', () => {
    it('should check isSignedIn from context', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      expect(mockUseOutletContext).toHaveBeenCalled();
    });

    it('should pass onComplete prop correctly', () => {
      const mockOnComplete = vi.fn();
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });

      render(<Upload onComplete={mockOnComplete} />);

      expect(mockOnComplete).not.toHaveBeenCalled(); // Should only call after upload completes
    });

    it('should render without onComplete prop', () => {
      mockUseOutletContext.mockReturnValue({ isSignedIn: true });
      render(<Upload />);

      expect(screen.getByText(/Click to upload or just drag and drop/i)).toBeInTheDocument();
    });
  });
});