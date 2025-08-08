'use client';

import { Droppable, DroppableProps } from 'react-beautiful-dnd';

import { useEffect, useState } from 'react';

/**
 * StrictModeDroppable Component
 *
 * Wrapper around react-beautiful-dnd's Droppable component that works
 * properly with React 18's StrictMode. Prevents hydration issues by
 * deferring the rendering until after the initial render.
 *
 * This is necessary because react-beautiful-dnd was not designed for
 * React 18's double-rendering in development mode.
 */
const StrictModeDroppable: React.FC<DroppableProps> = props => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props} />;
};

export default StrictModeDroppable;
