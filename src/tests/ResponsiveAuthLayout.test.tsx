import { render, screen } from '@testing-library/react';
import { ResponsiveAuthLayout } from '@/components/auth/ResponsiveAuthLayout';
import { vi, describe, it, expect } from 'vitest';
import * as hooks from '@/hooks/use-mobile';

// Mock the useMediaQuery hook to test different viewport sizes
vi.mock('@/hooks/use-mobile', async () => {
  const actual = await vi.importActual('@/hooks/use-mobile');
  return {
    ...actual,
    useMediaQuery: vi.fn()
  };
});

describe('ResponsiveAuthLayout', () => {
  it('renders with desktop styles when not on mobile', () => {
    // Mock the hook to return false (not mobile)
    vi.spyOn(hooks, 'useMediaQuery').mockReturnValue(false);

    render(
      <ResponsiveAuthLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveAuthLayout>
    );

    // Check if content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check for desktop-specific class
    const container = screen.getByTestId('test-content').closest('div');
    expect(container).toHaveClass('max-w-md');
    expect(container).toHaveClass('mx-auto');
    
    // Check for proper padding in container
    const innerContainer = container?.firstChild;
    expect(innerContainer).toHaveClass('p-8');
  });

  it('renders with mobile styles when on mobile', () => {
    // Mock the hook to return true (mobile)
    vi.spyOn(hooks, 'useMediaQuery').mockReturnValue(true);

    render(
      <ResponsiveAuthLayout>
        <div data-testid="test-content">Test Content</div>
      </ResponsiveAuthLayout>
    );

    // Check if content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Check for mobile-specific class
    const container = screen.getByTestId('test-content').closest('div');
    expect(container).toHaveClass('px-4');
    expect(container).not.toHaveClass('max-w-md');
    
    // Check for proper padding in container
    const innerContainer = container?.firstChild;
    expect(innerContainer).toHaveClass('p-5');
  });

  it('applies custom className when provided', () => {
    vi.spyOn(hooks, 'useMediaQuery').mockReturnValue(false);

    render(
      <ResponsiveAuthLayout className="test-custom-class">
        <div>Test Content</div>
      </ResponsiveAuthLayout>
    );

    const container = screen.getByText('Test Content').closest('div').parentElement;
    expect(container).toHaveClass('test-custom-class');
  });

  it('renders with animation properties', async () => {
    vi.spyOn(hooks, 'useMediaQuery').mockReturnValue(false);

    render(
      <ResponsiveAuthLayout>
        <div>Animated Content</div>
      </ResponsiveAuthLayout>
    );

    // Check for framer-motion animation attributes
    const motionDiv = screen.getByText('Animated Content').closest('div');
    
    // Since framer-motion attributes are added dynamically, we need to 
    // check for the presence of style and data attributes that indicate animations
    expect(motionDiv).toHaveStyle({ opacity: 1 });
  });
});
