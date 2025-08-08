'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { ComponentType } from '@lib/types/about-page-components';
import { cn } from '@lib/utils';
import {
  AlignLeft,
  Grid3x3,
  Image as ImageIcon,
  Minus,
  MousePointer,
  Palette,
  Type,
} from 'lucide-react';
import { Draggable } from 'react-beautiful-dnd';

import React from 'react';

import StrictModeDroppable from './strict-mode-droppable';

/**
 * Available component definitions for the palette
 */
interface ComponentDefinition {
  type: ComponentType;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultProps: Record<string, unknown>;
  category: 'basic' | 'content' | 'media' | 'layout';
}

const availableComponents: ComponentDefinition[] = [
  {
    type: 'heading',
    name: 'Heading',
    icon: <Type className="h-4 w-4" />,
    description: 'Add headings (H1-H6)',
    defaultProps: {
      content: 'New Heading',
      level: 2,
      textAlign: 'left',
    },
    category: 'basic',
  },
  {
    type: 'paragraph',
    name: 'Paragraph',
    icon: <AlignLeft className="h-4 w-4" />,
    description: 'Add paragraph text',
    defaultProps: {
      content: 'New paragraph text.',
      textAlign: 'left',
    },
    category: 'basic',
  },
  {
    type: 'button',
    name: 'Button',
    icon: <MousePointer className="h-4 w-4" />,
    description: 'Interactive button',
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      action: 'link',
      url: '#',
    },
    category: 'content',
  },
  {
    type: 'cards',
    name: 'Cards',
    icon: <Grid3x3 className="h-4 w-4" />,
    description: 'Grid or list of cards',
    defaultProps: {
      layout: 'grid',
      items: [
        { title: 'Card 1', description: 'Description for card 1' },
        { title: 'Card 2', description: 'Description for card 2' },
      ],
    },
    category: 'content',
  },
  {
    type: 'image',
    name: 'Image',
    icon: <ImageIcon className="h-4 w-4" />,
    description: 'Add images with captions',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop',
      alt: 'Placeholder Image',
      caption: '',
      alignment: 'center',
      width: 'auto',
      height: 'auto',
    },
    category: 'media',
  },
  {
    type: 'divider',
    name: 'Divider',
    icon: <Minus className="h-4 w-4" />,
    description: 'Horizontal divider line',
    defaultProps: {
      style: 'solid',
      thickness: 'thin',
      color: 'gray',
    },
    category: 'layout',
  },
];

/**
 * Component categories for organization
 */
const categories = [
  { id: 'basic' as const, name: 'Basic', icon: <Type className="h-4 w-4" /> },
  {
    id: 'content' as const,
    name: 'Content',
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    id: 'media' as const,
    name: 'Media',
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    id: 'layout' as const,
    name: 'Layout',
    icon: <Palette className="h-4 w-4" />,
  },
];

interface ComponentPaletteProps {
  className?: string;
}

/**
 * Component Palette
 *
 * Displays available components that can be dragged to the editor
 */
const ComponentPalette: React.FC<ComponentPaletteProps> = ({ className }) => {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Components
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <StrictModeDroppable
          droppableId="component-palette"
          isDropDisabled={true}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {provided => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-6 px-4 pb-4"
            >
              {categories.map(category => {
                const categoryComponents = availableComponents.filter(
                  comp => comp.category === category.id
                );

                if (categoryComponents.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-2">
                    <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                      {category.icon}
                      {category.name}
                    </h3>
                    <div className="space-y-2">
                      {categoryComponents.map(comp => {
                        const globalIndex = availableComponents.indexOf(comp);

                        return (
                          <Draggable
                            key={comp.type}
                            draggableId={comp.type}
                            index={globalIndex}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  'bg-card hover:bg-accent hover:text-accent-foreground flex cursor-grab items-center gap-3 rounded-md border p-3 transition-colors active:cursor-grabbing',
                                  snapshot.isDragging && 'opacity-50 shadow-lg'
                                )}
                              >
                                <div className="text-muted-foreground flex-shrink-0">
                                  {comp.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {comp.name}
                                  </p>
                                  <p className="text-muted-foreground truncate text-xs">
                                    {comp.description}
                                  </p>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </StrictModeDroppable>
      </CardContent>
    </Card>
  );
};

export default ComponentPalette;
export { availableComponents };
