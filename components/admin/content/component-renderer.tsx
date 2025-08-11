'use client';

import {
  CardsProps,
  ComponentInstance,
  DividerProps,
  ButtonProps as DynamicButtonProps,
  HeadingProps,
  ImageProps,
  ParagraphProps,
} from '@lib/types/about-page-components';
import { cn } from '@lib/utils';

import React from 'react';

/**
 * Heading component renderer
 *
 * Renders heading elements with proper styling and alignment
 */
const Heading: React.FC<HeadingProps> = ({ content, level, textAlign }) => {
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const alignmentClass = textAlignClasses[textAlign];

  // Define font sizes for different heading levels with responsive design
  const sizeClasses = {
    1: 'text-3xl sm:text-4xl md:text-5xl',
    2: 'text-2xl sm:text-3xl md:text-4xl',
    3: 'text-xl sm:text-2xl md:text-3xl',
    4: 'text-lg sm:text-xl md:text-2xl',
    5: 'text-base sm:text-lg md:text-xl',
    6: 'text-sm sm:text-base md:text-lg',
  };

  return React.createElement(
    `h${level}`,
    {
      className: cn(
        'text-foreground mb-4 font-bold sm:mb-6',
        sizeClasses[level],
        alignmentClass
      ),
    },
    content
  );
};

/**
 * Paragraph component renderer
 *
 * Renders paragraph text with proper styling and alignment
 */
const Paragraph: React.FC<ParagraphProps> = ({ content, textAlign }) => {
  const textAlignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <p
      className={cn(
        'text-foreground/80 mb-4 text-sm leading-relaxed sm:text-base lg:text-lg',
        textAlignClasses[textAlign]
      )}
    >
      {content}
    </p>
  );
};

/**
 * Cards component renderer
 *
 * Renders a grid or list of cards with title and description
 */
const Cards: React.FC<CardsProps> = ({ items, layout }) => {
  const gridClass = layout === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1';

  return (
    <div className={cn('mb-6 grid grid-cols-1 gap-4 sm:gap-6', gridClass)}>
      {items.map((item, index) => (
        <div
          key={index}
          className="border-border bg-card rounded-xl border p-4 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
        >
          <h3 className="text-card-foreground mb-2 text-base font-semibold sm:text-lg">
            {item.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
};

/**
 * Button component renderer
 *
 * Renders interactive buttons with stone color system variants
 */
const DynamicButton: React.FC<DynamicButtonProps> = ({
  text,
  variant,
  action,
  url,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (action === 'link' && url === '#') {
      e.preventDefault();
      // In preview mode, prevent default action
    }
  };

  const buttonStyles = {
    solid: cn(
      'inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium transition-all duration-200',
      'bg-stone-900 text-white hover:scale-105 hover:bg-stone-800 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none',
      'dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200 dark:focus:ring-stone-400'
    ),
    outline: cn(
      'inline-flex items-center justify-center rounded-lg px-8 py-3 text-base font-medium transition-all duration-200',
      'border border-stone-300 bg-transparent text-stone-900 hover:scale-105 hover:bg-stone-50 focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none',
      'dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800 dark:focus:ring-stone-400'
    ),
  };

  return (
    <div className="mb-6 text-center">
      <a
        href={url || '#'}
        onClick={handleClick}
        className={buttonStyles[variant]}
      >
        {text}
      </a>
    </div>
  );
};

/**
 * Image component renderer
 *
 * Renders images with captions and alignment
 */
const Image: React.FC<ImageProps> = ({
  src,
  alt,
  caption,
  alignment,
  width,
  height,
}) => {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const imageStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    maxWidth: '100%',
  };

  return (
    <div className={cn('mb-6', alignmentClasses[alignment])}>
      <img
        src={src}
        alt={alt}
        style={imageStyle}
        className="rounded-lg shadow-sm"
      />
      {caption && (
        <p className="text-muted-foreground mt-2 text-sm italic">{caption}</p>
      )}
    </div>
  );
};

/**
 * Divider component renderer
 *
 * Renders horizontal dividers with different styles
 */
const Divider: React.FC<DividerProps> = ({ style, thickness, color }) => {
  let borderStyle = 'border-solid';
  if (style === 'dashed') borderStyle = 'border-dashed';
  if (style === 'dotted') borderStyle = 'border-dotted';

  let borderThickness = 'border-t';
  if (thickness === 'medium') borderThickness = 'border-t-2';
  if (thickness === 'thick') borderThickness = 'border-t-4';

  const borderColor = color ? `border-${color}-300` : 'border-border';

  return (
    <hr className={cn(borderStyle, borderThickness, borderColor, 'my-6')} />
  );
};

/**
 * Component type to React component mapping
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, React.FC<any>> = {
  heading: Heading,
  paragraph: Paragraph,
  cards: Cards,
  button: DynamicButton,
  image: Image,
  divider: Divider,
};

/**
 * Main component renderer
 *
 * Dynamically renders components based on their type
 */
interface ComponentRendererProps {
  component: ComponentInstance;
  className?: string;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  className,
}) => {
  const Component = componentMap[component.type];

  if (!Component) {
    // Fallback for unregistered components
    return (
      <div
        className={cn(
          'border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-center',
          className
        )}
      >
        <p className="font-medium">
          Component type &quot;{component.type}&quot; not found.
        </p>
        <p className="text-sm">Please check the component registration.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Component {...component.props} />
    </div>
  );
};

export default ComponentRenderer;
