'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';

import React, { useCallback, useRef, useState } from 'react';

interface DndContextWrapperProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

interface DragState {
  id: string;
  content: React.ReactNode;
  isPaletteItem: boolean;
  isValidDrop: boolean;
  originalRect?: DOMRect;
}

/**
 * DndKit Context Wrapper
 *
 * Enhanced drag and drop with component cloning, drop validation, and animations
 */
export function DndContextWrapper({
  children,
  onDragEnd,
}: DndContextWrapperProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [isAnimatingReturn, setIsAnimatingReturn] = useState(false);
  const dragOverlayRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const isPaletteItem = String(active.id).startsWith('palette-');

    // Get original element position for return animation
    let originalRect: DOMRect | undefined;
    if (isPaletteItem) {
      const element =
        document.querySelector(
          `[data-rbd-drag-handle-draggable-id="${active.id}"]`
        ) || document.querySelector(`[data-dnd-id="${active.id}"]`);
      if (element) {
        originalRect = element.getBoundingClientRect();
      }

      // Add CSS class to disable pointer events on sortable components during palette drag
      document.body.classList.add('palette-dragging');
    }

    setDragState({
      id: String(active.id),
      content: active.data.current?.preview || String(active.id),
      isPaletteItem,
      isValidDrop: false,
      originalRect,
    });
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;

    setDragState(prev => {
      if (!prev) return prev;

      // Check if current position is a valid drop zone
      const isValidDrop =
        over &&
        (String(over.id).startsWith('section-') ||
          String(over.id).includes('drop') ||
          over.data.current?.type === 'container');

      return {
        ...prev,
        isValidDrop: Boolean(isValidDrop),
      };
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const isPaletteItem = String(active.id).startsWith('palette-');
      const isValidDrop =
        over &&
        (String(over.id).startsWith('section-') ||
          String(over.id).includes('drop') ||
          over.data.current?.type === 'container');

      if (isPaletteItem && !isValidDrop && dragState?.originalRect) {
        // Animate return to original position
        setIsAnimatingReturn(true);

        // Start return animation
        const overlay = dragOverlayRef.current;
        if (overlay) {
          const currentRect = overlay.getBoundingClientRect();
          const deltaX = dragState.originalRect.left - currentRect.left;
          const deltaY = dragState.originalRect.top - currentRect.top;

          overlay.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
          overlay.style.transition =
            'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)';

          // Clean up after animation
          setTimeout(() => {
            setDragState(null);
            setIsAnimatingReturn(false);
          }, 300);
        } else {
          // Fallback if no overlay ref
          setTimeout(() => {
            setDragState(null);
            setIsAnimatingReturn(false);
          }, 100);
        }
      } else {
        // Normal drag end handling
        setDragState(null);
        setIsAnimatingReturn(false);
        onDragEnd(event);
      }

      // Always remove the palette-dragging class
      document.body.classList.remove('palette-dragging');
    },
    [dragState, onDragEnd]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <DragOverlay dropAnimation={null}>
            {dragState ? (
              <div
                ref={dragOverlayRef}
                className={`rounded-lg border p-2 shadow-xl transition-all duration-200 ${
                  dragState.isValidDrop
                    ? 'scale-105 border-emerald-200 bg-emerald-50 shadow-emerald-200/50 dark:border-emerald-700 dark:bg-emerald-900/20'
                    : dragState.isPaletteItem
                      ? 'border-stone-200 bg-white shadow-stone-200/50 dark:border-stone-600 dark:bg-stone-800'
                      : 'border-stone-200 bg-white shadow-stone-200/50 dark:border-stone-600 dark:bg-stone-800'
                } ${isAnimatingReturn ? 'pointer-events-none' : ''} `}
                style={{
                  transform: isAnimatingReturn ? undefined : 'rotate(5deg)',
                }}
              >
                {dragState.content}
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
