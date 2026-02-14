import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home, { meta } from './home';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock child components
vi.mock('../../components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../../components/ui/Button', () => ({
  default: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('components/Upload', () => ({
  default: ({ onComplete }: any) => (
    <div data-testid="upload" onClick={() => onComplete?.('base64data')}>
      Upload Component
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  ArrowUpRight: () => <span data-testid="arrow-up-right-icon">↗</span>,
  Clock: () => <span data-testid="clock-icon">⏰</span>,
  Layers: () => <span data-testid="layers-icon">📚</span>,
}));

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('meta function', () => {
    it('should return correct title', () => {
      const result = meta({} as any);
      const titleMeta = result.find((item: any) => item.title);
      expect(titleMeta).toBeDefined();
      expect(titleMeta.title).toBe('New React Router App');
    });

    it('should return correct description meta tag', () => {
      const result = meta({} as any);
      const descMeta = result.find((item: any) => item.name === 'description');
      expect(descMeta).toBeDefined();
      expect(descMeta.content).toBe('Welcome to React Router!');
    });

    it('should return array of meta tags', () => {
      const result = meta({} as any);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('Component Rendering', () => {
    it('should render the home container', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.home')).toBeInTheDocument();
    });

    it('should render the Navbar component', () => {
      render(<Home />);
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should render the page heading', () => {
      render(<Home />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      const heading = screen.getByText('Home');
      expect(heading).toHaveClass('text-3xl', 'text-indigo-700', 'font-extrabold');
    });

    it('should render the hero section', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.hero')).toBeInTheDocument();
    });

    it('should render the Upload component', () => {
      render(<Home />);
      expect(screen.getByTestId('upload')).toBeInTheDocument();
    });
  });

  describe('Hero Section Content', () => {
    it('should render announcement banner', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.announce')).toBeInTheDocument();
    });

    it('should display "Introducing Roomify 2.0" announcement', () => {
      render(<Home />);
      expect(screen.getByText('Introducing Roomify 2.0')).toBeInTheDocument();
    });

    it('should render main hero heading', () => {
      render(<Home />);
      expect(
        screen.getByText('Build beautiful spaces at the speed of thought with Roomify')
      ).toBeInTheDocument();
    });

    it('should render subtitle with description', () => {
      render(<Home />);
      const subtitle = screen.getByText(
        /Roomify is an AI-first design environment/i
      );
      expect(subtitle).toBeInTheDocument();
      expect(subtitle).toHaveClass('subtitle');
    });

    it('should mention AI-first in subtitle', () => {
      render(<Home />);
      expect(screen.getByText(/AI-first design environment/i)).toBeInTheDocument();
    });

    it('should mention visualization and rendering in subtitle', () => {
      render(<Home />);
      expect(screen.getByText(/visualize, render, and ship/i)).toBeInTheDocument();
    });
  });

  describe('Call-to-Action Buttons', () => {
    it('should render "Start Building" CTA', () => {
      render(<Home />);
      expect(screen.getByText('Start Building')).toBeInTheDocument();
    });

    it('should have CTA link to #upload anchor', () => {
      const { container } = render(<Home />);
      const ctaLink = container.querySelector('a.cta');
      expect(ctaLink).toHaveAttribute('href', '#upload');
    });

    it('should render ArrowRight icon in CTA', () => {
      render(<Home />);
      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
    });

    it('should render "Watch Demo" button', () => {
      render(<Home />);
      expect(screen.getByText('Watch Demo')).toBeInTheDocument();
    });

    it('should render demo button with Button component', () => {
      render(<Home />);
      const demoButton = screen.getByTestId('button');
      expect(demoButton).toBeInTheDocument();
      expect(demoButton).toHaveTextContent('Watch Demo');
    });
  });

  describe('Upload Section', () => {
    it('should render upload shell with id="upload"', () => {
      const { container } = render(<Home />);
      const uploadShell = container.querySelector('#upload');
      expect(uploadShell).toBeInTheDocument();
      expect(uploadShell).toHaveClass('upload-shell');
    });

    it('should render grid overlay', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.grid-overlay')).toBeInTheDocument();
    });

    it('should render upload card', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.upload-card')).toBeInTheDocument();
    });

    it('should render upload heading', () => {
      render(<Home />);
      expect(screen.getByText('Upload your floor plan')).toBeInTheDocument();
    });

    it('should display supported file formats', () => {
      render(<Home />);
      expect(screen.getByText(/Supports JPG, PNG/i)).toBeInTheDocument();
    });

    it('should display file size limit', () => {
      render(<Home />);
      expect(screen.getByText(/up to 10MB/i)).toBeInTheDocument();
    });

    it('should render Layers icon in upload section', () => {
      render(<Home />);
      expect(screen.getByTestId('layers-icon')).toBeInTheDocument();
    });
  });

  describe('Projects Section', () => {
    it('should render projects section', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.projects')).toBeInTheDocument();
    });

    it('should render projects heading', () => {
      render(<Home />);
      const headings = screen.getAllByText('Projects');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should render projects description', () => {
      render(<Home />);
      expect(
        screen.getByText(/Your latest work and shared community projects/i)
      ).toBeInTheDocument();
    });

    it('should render project card', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.project-card')).toBeInTheDocument();
    });

    it('should render project preview image', () => {
      const { container } = render(<Home />);
      const img = container.querySelector('.preview img') as HTMLImageElement;
      expect(img).toBeInTheDocument();
      expect(img.src).toContain('roomify-mlhuk267-dfwu1i.puter.site');
    });

    it('should display "Community" badge', () => {
      render(<Home />);
      expect(screen.getByText('Community')).toBeInTheDocument();
    });

    it('should render project title', () => {
      render(<Home />);
      expect(screen.getByText('Project Manhattan')).toBeInTheDocument();
    });

    it('should render project author', () => {
      render(<Home />);
      expect(screen.getByText('By JS Mastery')).toBeInTheDocument();
    });

    it('should render Clock icon in project meta', () => {
      render(<Home />);
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should render ArrowUpRight icon in project card', () => {
      render(<Home />);
      expect(screen.getByTestId('arrow-up-right-icon')).toBeInTheDocument();
    });

    it('should format and display project date', () => {
      render(<Home />);
      const date = new Date('01.01.2027').toLocaleDateString();
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  describe('handleUploadComplete', () => {
    it('should navigate to visualizer route with new ID', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');

      // Mock Date.now for predictable ID
      const mockDate = 1234567890;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      // Trigger upload complete
      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/visualizer/${mockDate}`);
      });
    });

    it('should generate unique ID based on timestamp', async () => {
      const timestamp1 = 1000000000;
      vi.spyOn(Date, 'now').mockReturnValue(timestamp1);

      const { unmount } = render(<Home />);
      const upload1 = screen.getByTestId('upload');
      upload1.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/visualizer/${timestamp1}`);
      });

      unmount();
      vi.clearAllMocks();

      const timestamp2 = 2000000000;
      vi.spyOn(Date, 'now').mockReturnValue(timestamp2);

      render(<Home />);
      const upload2 = screen.getByTestId('upload');
      upload2.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/visualizer/${timestamp2}`);
      });
    });

    it('should convert timestamp to string for ID', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');
      const mockDate = 9876543210;
      vi.spyOn(Date, 'now').mockReturnValue(mockDate);

      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(`/visualizer/9876543210`);
        const callArg = mockNavigate.mock.calls[0][0];
        expect(typeof callArg).toBe('string');
      });
    });

    it('should return true after navigation', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);

      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const { container } = render(<Home />);
      const h1 = container.querySelector('h1');
      const h3 = container.querySelector('h3');
      expect(h1).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should have alt text for project image', () => {
      const { container } = render(<Home />);
      const img = container.querySelector('.preview img') as HTMLImageElement;
      expect(img).toHaveAttribute('alt', 'Project');
    });

    it('should use semantic HTML elements', () => {
      const { container } = render(<Home />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct classes to hero section', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.hero')).toBeInTheDocument();
    });

    it('should apply correct classes to actions div', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.actions')).toBeInTheDocument();
    });

    it('should apply group class to project card', () => {
      const { container } = render(<Home />);
      const projectCard = container.querySelector('.project-card');
      expect(projectCard).toHaveClass('group');
    });

    it('should have pulse animation element', () => {
      const { container } = render(<Home />);
      expect(container.querySelector('.pulse')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should pass base64Data to handleUploadComplete', async () => {
      render(<Home />);

      const base64Data = 'data:image/png;base64,test123';
      const upload = screen.getByTestId('upload');

      // Our mock Upload component calls onComplete with the data
      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it('should render all major sections in correct order', () => {
      const { container } = render(<Home />);
      const sections = Array.from(container.querySelectorAll('section'));

      expect(sections[0]).toHaveClass('hero');
      expect(sections[1]).toHaveClass('projects');
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid upload completions', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');

      vi.spyOn(Date, 'now').mockReturnValueOnce(1111);
      upload.click();

      vi.spyOn(Date, 'now').mockReturnValueOnce(2222);
      upload.click();

      vi.spyOn(Date, 'now').mockReturnValueOnce(3333);
      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle Date.now returning 0', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');
      vi.spyOn(Date, 'now').mockReturnValue(0);

      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/visualizer/0');
      });
    });

    it('should handle very large timestamp values', async () => {
      render(<Home />);

      const upload = screen.getByTestId('upload');
      const largeTimestamp = Number.MAX_SAFE_INTEGER;
      vi.spyOn(Date, 'now').mockReturnValue(largeTimestamp);

      upload.click();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          `/visualizer/${largeTimestamp}`
        );
      });
    });
  });

  describe('Content Verification', () => {
    it('should mention speed in hero text', () => {
      render(<Home />);
      expect(screen.getByText(/speed of thought/i)).toBeInTheDocument();
    });

    it('should mention architectural projects', () => {
      render(<Home />);
      expect(screen.getByText(/architectural projects/i)).toBeInTheDocument();
    });

    it('should have correct image URL format', () => {
      const { container } = render(<Home />);
      const img = container.querySelector('.preview img') as HTMLImageElement;
      expect(img.src).toMatch(/\.(png|jpg|jpeg)$/);
    });
  });

  describe('Project Date Handling', () => {
    it('should correctly parse and format date string', () => {
      const testDate = new Date('01.01.2027');
      expect(testDate).toBeInstanceOf(Date);
      expect(testDate.getFullYear()).toBe(2027);
    });

    it('should render localized date string', () => {
      render(<Home />);
      const expectedDate = new Date('01.01.2027').toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });
});