'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  SortingStrategy,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@lib/utils';

import React from 'react';

// Re-export arrayMove for convenience
export { arrayMove };

// Droppable component interface
interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * DndKit Droppable Component
 *
 * Replaces react-beautiful-dnd's Droppable
 */
export function Droppable({
  id,
  children,
  className,
  disabled = false,
}: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && 'ring-opacity-50 ring-2 ring-blue-500'
      )}
    >
      {children}
    </div>
  );
}

// Draggable component interface
interface DraggableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  preview?: React.ReactNode;
}

/**
 * DndKit Draggable Component
 *
 * Replaces react-beautiful-dnd's Draggable
 */
export function Draggable({
  id,
  children,
  className,
  disabled = false,
  preview,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
      data: {
        type: id.startsWith('palette-') ? 'palette-item' : 'component',
        preview,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        isDragging && 'scale-95 opacity-50',
        !disabled && 'cursor-grab active:cursor-grabbing'
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

// Sortable component for within containers
interface SortableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * DndKit Sortable Component
 *
 * For sortable items within containers
 */
export function Sortable({
  id,
  children,
  className,
  disabled = false,
}: SortableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    data: {
      type: 'component',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        isDragging && 'z-50 scale-105 opacity-60',
        !disabled && 'cursor-grab active:cursor-grabbing'
      )}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

// Sortable Container
interface SortableContainerProps {
  id: string;
  items: string[];
  children: React.ReactNode;
  className?: string;
  strategy?: SortingStrategy;
}

/**
 * DndKit Sortable Container
 *
 * Provides sortable context for child components
 */
export function SortableContainer({
  id,
  items,
  children,
  className,
  strategy = verticalListSortingStrategy,
}: SortableContainerProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'container',
      accepts: ['component', 'palette-item'],
    },
  });

  return (
    <SortableContext items={items} strategy={strategy}>
      <div
        ref={setNodeRef}
        className={cn(
          className,
          isOver &&
            'ring-opacity-75 bg-blue-50/70 shadow-lg ring-2 ring-blue-400 dark:bg-blue-900/30 dark:ring-blue-300'
        )}
      >
        {children}
      </div>
    </SortableContext>
  );
}
