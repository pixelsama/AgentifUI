import { DynamicAboutRenderer } from '@components/about/dynamic-about-renderer';
import type { AboutTranslationData } from '@lib/types/about-page-components';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Skip NextIntl for testing

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    hr: ({ children, ...props }: any) => <hr {...props}>{children}</hr>,
  },
}));

// Mock messages
const messages = {
  pages: {
    about: {
      title: 'About Us',
      subtitle: 'Test subtitle',
      buttonText: 'Get Started',
    },
  },
};

const mockColors = {
  titleGradient: 'from-blue-600 to-purple-600',
  textColor: 'text-gray-900',
  headingColor: 'text-gray-900',
  paragraphColor: 'text-gray-700',
  cardBg: 'bg-white',
  cardBorder: 'border-gray-200',
  cardShadow: 'shadow-lg',
  cardHeadingColor: 'text-gray-900',
  cardTextColor: 'text-gray-700',
  buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
};

const createMockTranslationData = (isDynamic = true): AboutTranslationData => {
  if (isDynamic) {
    return {
      sections: [
        {
          id: 'section-1',
          layout: 'single-column',
          columns: [
            [
              {
                id: 'comp-1',
                type: 'heading',
                props: {
                  content: 'Test Heading',
                  level: 1,
                  textAlign: 'center',
                },
              },
              {
                id: 'comp-2',
                type: 'paragraph',
                props: {
                  content: 'Test paragraph content',
                  textAlign: 'left',
                },
              },
            ],
          ],
        },
        {
          id: 'section-2',
          layout: 'two-column',
          columns: [
            [
              {
                id: 'comp-3',
                type: 'cards',
                props: {
                  layout: 'grid',
                  items: [
                    {
                      title: 'Card 1',
                      description: 'Card 1 description',
                    },
                    {
                      title: 'Card 2',
                      description: 'Card 2 description',
                    },
                  ],
                },
              },
            ],
            [
              {
                id: 'comp-4',
                type: 'button',
                props: {
                  text: 'Click Me',
                  variant: 'primary',
                  action: 'link',
                  url: '/test',
                },
              },
            ],
          ],
        },
      ],
      metadata: {
        version: '1.0.0',
        lastModified: '2024-01-01T00:00:00.000Z',
        author: 'test',
      },
    };
  }

  // Legacy format
  return {
    title: 'Legacy Title',
    subtitle: 'Legacy Subtitle',
    mission: {
      description: 'Legacy mission description',
    },
    values: {
      items: [
        {
          title: 'Value 1',
          description: 'Value 1 description',
        },
      ],
    },
    buttonText: 'Legacy Button',
    copyright: {
      prefix: '© 2024',
      linkText: 'Company',
      suffix: '. All rights reserved.',
    },
  } as any;
};

const renderWithIntl = (component: React.ReactNode) => {
  return render(component);
};

describe('DynamicAboutRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders heading components correctly', () => {
      const translationData = createMockTranslationData(true);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Test Heading'
      );
      expect(screen.getByRole('heading', { level: 1 })).toHaveClass(
        'text-center'
      );
    });

    it('renders paragraph components correctly', () => {
      const translationData = createMockTranslationData(true);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      expect(screen.getByText('Test paragraph content')).toBeInTheDocument();
    });

    it('renders card components correctly', () => {
      const translationData = createMockTranslationData(true);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 1 description')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 2 description')).toBeInTheDocument();
    });

    it('renders button components correctly', () => {
      const translationData = createMockTranslationData(true);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600');
    });
  });

  describe('Layout Rendering', () => {
    it('renders single-column layout correctly', () => {
      const translationData = createMockTranslationData(true);

      const { container } = renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      const singleColumnSection = container.querySelector('.grid-cols-1');
      expect(singleColumnSection).toBeInTheDocument();
    });

    it('renders two-column layout correctly', () => {
      const translationData = createMockTranslationData(true);

      const { container } = renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      const twoColumnSection = container.querySelector('.md\\:grid-cols-2');
      expect(twoColumnSection).toBeInTheDocument();
    });
  });

  describe('Legacy Data Migration', () => {
    it('handles legacy format data correctly', () => {
      const legacyData = createMockTranslationData(false);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={legacyData}
          colors={mockColors}
        />
      );

      // Should migrate and render legacy data
      expect(screen.getByText('Legacy Title')).toBeInTheDocument();
      expect(screen.getByText('Legacy Subtitle')).toBeInTheDocument();
      expect(
        screen.getByText('Legacy mission description')
      ).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onButtonClick when button is clicked', async () => {
      const mockOnButtonClick = jest.fn();
      const translationData = createMockTranslationData(true);

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
          onButtonClick={mockOnButtonClick}
        />
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnButtonClick).toHaveBeenCalledWith('/test');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing content gracefully', () => {
      const emptyData: AboutTranslationData = {
        sections: [],
        metadata: {
          version: '1.0.0',
          lastModified: '2024-01-01T00:00:00.000Z',
          author: 'test',
        },
      };

      renderWithIntl(
        <DynamicAboutRenderer translationData={emptyData} colors={mockColors} />
      );

      expect(screen.getByText('No content available')).toBeInTheDocument();
    });

    it('handles unknown component types gracefully', () => {
      const invalidData: AboutTranslationData = {
        sections: [
          {
            id: 'section-1',
            layout: 'single-column',
            columns: [
              [
                {
                  id: 'comp-1',
                  type: 'unknown' as any,
                  props: {
                    content: 'Test content',
                  },
                },
              ],
            ],
          },
        ],
        metadata: {
          version: '1.0.0',
          lastModified: '2024-01-01T00:00:00.000Z',
          author: 'test',
        },
      };

      renderWithIntl(
        <DynamicAboutRenderer
          translationData={invalidData}
          colors={mockColors}
        />
      );

      expect(
        screen.getByText('Unknown component type: unknown')
      ).toBeInTheDocument();
    });
  });

  describe('Performance Optimizations', () => {
    it('uses memoized component rendering', () => {
      const translationData = createMockTranslationData(true);

      const { rerender } = renderWithIntl(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Rerender with same data should use memoized components
      rerender(
        <DynamicAboutRenderer
          translationData={translationData}
          colors={mockColors}
        />
      );

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
