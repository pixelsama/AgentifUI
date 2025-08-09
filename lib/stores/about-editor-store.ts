import { availableComponents } from '@components/admin/content/component-palette';
import { arrayMove } from '@components/admin/content/dnd-components';
import { DragEndEvent } from '@dnd-kit/core';
import {
  ComponentInstance,
  PageContent,
  createDefaultSection,
  generateUniqueId,
} from '@lib/types/about-page-components';
import { create } from 'zustand';

/**
 * About Editor State Interface
 *
 * Manages the state of the dynamic about page editor
 */
interface AboutEditorState {
  // Current page content being edited
  pageContent: PageContent | null;
  // ID of the currently selected component
  selectedComponentId: string | null;
  // Undo stack for history management
  undoStack: PageContent[];
  // Redo stack for history management
  redoStack: PageContent[];
  // Whether there are unsaved changes
  isDirty: boolean;
  // Whether the editor is loading
  isLoading: boolean;
  // Current language being edited
  currentLanguage: string;

  // Actions
  // Set the entire page content
  setPageContent: (content: PageContent) => void;
  // Set the currently selected component
  setSelectedComponent: (id: string | null) => void;
  // Update properties of a specific component
  updateComponentProps: (id: string, props: Record<string, unknown>) => void;
  // Add a new component to a specific section and column
  addComponent: (
    sectionId: string,
    columnIndex: number,
    component: ComponentInstance
  ) => void;
  // Delete a component by ID
  deleteComponent: (id: string) => void;
  // Handle drag and drop operations
  handleDragEnd: (event: DragEndEvent) => void;
  // Create a new section
  addSection: (
    layout?: 'single-column' | 'two-column' | 'three-column'
  ) => void;
  // Delete a section by ID
  deleteSection: (sectionId: string) => void;
  // Undo last change
  undo: () => void;
  // Redo last undone change
  redo: () => void;
  // Set loading state
  setLoading: (loading: boolean) => void;
  // Set dirty state
  setDirty: (dirty: boolean) => void;
  // Set current language
  setCurrentLanguage: (language: string) => void;
  // Reset editor to initial state
  reset: () => void;
}

/**
 * About Editor Store
 *
 * Zustand store for managing the dynamic about page editor state
 */
export const useAboutEditorStore = create<AboutEditorState>((set, get) => ({
  // Initial state
  pageContent: null,
  selectedComponentId: null,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  isLoading: false,
  currentLanguage: 'en-US',

  // Set page content
  setPageContent: (content: PageContent) => {
    set({
      pageContent: content,
      selectedComponentId: null,
      isDirty: false,
    });
  },

  // Set selected component
  setSelectedComponent: (id: string | null) => {
    set({ selectedComponentId: id });
  },

  // Update component properties
  updateComponentProps: (id: string, props: Record<string, unknown>) => {
    const { pageContent } = get();
    if (!pageContent) return;

    // Create deep copy of page content
    const newPageContent = JSON.parse(
      JSON.stringify(pageContent)
    ) as PageContent;

    // Find and update the component
    let updated = false;
    for (const section of newPageContent.sections) {
      for (const column of section.columns) {
        const componentIndex = column.findIndex(comp => comp.id === id);
        if (componentIndex !== -1) {
          column[componentIndex].props = {
            ...column[componentIndex].props,
            ...props,
          };
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (updated) {
      // Save current state to undo stack before updating
      set(state => ({
        pageContent: newPageContent,
        undoStack: [...state.undoStack, pageContent].slice(-20), // Keep last 20 states
        redoStack: [], // Clear redo stack on new change
        isDirty: true,
      }));
    }
  },

  // Add component
  addComponent: (
    sectionId: string,
    columnIndex: number,
    component: ComponentInstance
  ) => {
    const state = get();
    if (!state.pageContent) return;

    const newPageContent = JSON.parse(
      JSON.stringify(state.pageContent)
    ) as PageContent;

    const section = newPageContent.sections.find(s => s.id === sectionId);
    if (section && section.columns[columnIndex]) {
      section.columns[columnIndex].push(component);

      // Save to undo stack
      set(state => ({
        pageContent: newPageContent,
        undoStack: [...state.undoStack, state.pageContent!].slice(-20),
        redoStack: [],
        isDirty: true,
      }));
    }
  },

  // Delete component
  deleteComponent: (id: string) => {
    const state = get();
    if (!state.pageContent) return;

    const newPageContent = JSON.parse(
      JSON.stringify(state.pageContent)
    ) as PageContent;
    let deleted = false;

    // Find and remove the component
    for (const section of newPageContent.sections) {
      for (const column of section.columns) {
        const componentIndex = column.findIndex(comp => comp.id === id);
        if (componentIndex !== -1) {
          column.splice(componentIndex, 1);
          deleted = true;
          break;
        }
      }
      if (deleted) break;
    }

    // Clean up empty sections
    const cleanedSections = newPageContent.sections.filter(section =>
      section.columns.some(column => column.length > 0)
    );

    if (deleted) {
      set(state => ({
        pageContent: { ...newPageContent, sections: cleanedSections },
        undoStack: [...state.undoStack, state.pageContent!].slice(-20),
        redoStack: [],
        selectedComponentId:
          state.selectedComponentId === id ? null : state.selectedComponentId,
        isDirty: true,
      }));
    }
  },

  // Handle drag and drop (optimized with performance considerations)
  handleDragEnd: (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const state = get();
    if (!state.pageContent) return;

    // More efficient cloning - only clone what we need to modify
    const newPageContent: PageContent = {
      ...state.pageContent,
      sections: state.pageContent.sections.map(section => ({
        ...section,
        columns: section.columns.map(column => [...column]),
      })),
    };

    const activeId = String(active.id);
    const overId = String(over.id);

    // Handle dragging from component palette
    if (activeId.startsWith('palette-')) {
      const componentType = activeId.replace('palette-', '');
      const componentDef = availableComponents.find(
        comp => comp.type === componentType
      );
      if (!componentDef) return;

      // Parse destination - handle both direct drops on containers and on components
      let targetContainerId = overId;

      // If dropping on a component, get its container
      if (!overId.startsWith('section-')) {
        // Find which container this component belongs to
        for (const section of newPageContent.sections) {
          for (
            let colIndex = 0;
            colIndex < section.columns.length;
            colIndex++
          ) {
            const componentExists = section.columns[colIndex].find(
              comp => comp.id === overId
            );
            if (componentExists) {
              targetContainerId = `section-${section.id}-${colIndex}`;
              break;
            }
          }
        }
      }

      const [type, sectionId, columnIndex] = targetContainerId.split('-');

      if (type === 'section' && sectionId && columnIndex !== undefined) {
        const section = newPageContent.sections.find(s => s.id === sectionId);
        if (section && section.columns[parseInt(columnIndex)]) {
          const newComponent: ComponentInstance = {
            id: generateUniqueId('comp'),
            type: componentDef.type,
            props: { ...componentDef.defaultProps },
          };

          // Add to the end of the column
          section.columns[parseInt(columnIndex)].push(newComponent);
        }
      }
    } else {
      // Handle moving existing components within or between containers
      const activeContainer = active.data.current?.sortable?.containerId;
      const overContainer = over.data.current?.sortable?.containerId || overId;

      if (activeContainer && overContainer) {
        if (activeContainer === overContainer) {
          // Reordering within the same container
          const [containerType, sectionId, columnIndex] =
            activeContainer.split('-');

          if (
            containerType === 'section' &&
            sectionId &&
            columnIndex !== undefined
          ) {
            const section = newPageContent.sections.find(
              s => s.id === sectionId
            );
            if (section && section.columns[parseInt(columnIndex)]) {
              const column = section.columns[parseInt(columnIndex)];
              const activeIndex = column.findIndex(
                comp => comp.id === activeId
              );
              const overIndex = column.findIndex(comp => comp.id === overId);

              if (
                activeIndex !== -1 &&
                overIndex !== -1 &&
                activeIndex !== overIndex
              ) {
                // Use arrayMove to reorder within the same container
                section.columns[parseInt(columnIndex)] = arrayMove(
                  column,
                  activeIndex,
                  overIndex
                );
              }
            }
          }
        } else {
          // Moving between containers
          const [sourceType, sourceSectionId, sourceColumnIndex] =
            activeContainer.split('-');
          const [destType, destSectionId, destColumnIndex] =
            overContainer.split('-');

          if (sourceType === 'section' && destType === 'section') {
            const sourceSection = newPageContent.sections.find(
              s => s.id === sourceSectionId
            );
            const destSection = newPageContent.sections.find(
              s => s.id === destSectionId
            );

            if (sourceSection && destSection) {
              const sourceColumn =
                sourceSection.columns[parseInt(sourceColumnIndex)];
              const destColumn = destSection.columns[parseInt(destColumnIndex)];

              if (sourceColumn && destColumn) {
                // Find and move the component
                const componentIndex = sourceColumn.findIndex(
                  comp => comp.id === activeId
                );
                if (componentIndex !== -1) {
                  const [removed] = sourceColumn.splice(componentIndex, 1);
                  // Insert at the position of the over item, or at the end
                  const overIndex = over.data.current?.sortable?.index;
                  if (typeof overIndex === 'number') {
                    destColumn.splice(overIndex, 0, removed);
                  } else {
                    destColumn.push(removed);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Clean up empty sections
    const cleanedSections = newPageContent.sections.filter(section =>
      section.columns.some(column => column.length > 0)
    );

    // Save changes
    set(state => ({
      pageContent: { ...newPageContent, sections: cleanedSections },
      undoStack: [...state.undoStack, state.pageContent!].slice(-20),
      redoStack: [],
      isDirty: true,
    }));
  },

  // Add new section
  addSection: (layout = 'single-column') => {
    const { pageContent } = get();
    if (!pageContent) return;

    const newSection = createDefaultSection(layout);
    const newPageContent = {
      ...pageContent,
      sections: [...pageContent.sections, newSection],
    };

    set(state => ({
      pageContent: newPageContent,
      undoStack: [...state.undoStack, pageContent].slice(-20),
      redoStack: [],
      isDirty: true,
    }));
  },

  // Delete section
  deleteSection: (sectionId: string) => {
    const { pageContent } = get();
    if (!pageContent) return;

    const newSections = pageContent.sections.filter(s => s.id !== sectionId);
    const newPageContent = { ...pageContent, sections: newSections };

    set(state => ({
      pageContent: newPageContent,
      undoStack: [...state.undoStack, pageContent].slice(-20),
      redoStack: [],
      isDirty: true,
    }));
  },

  // Undo
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0 || !state.pageContent) return;

    const previousState = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);

    set({
      pageContent: previousState,
      undoStack: newUndoStack,
      redoStack: [state.pageContent, ...state.redoStack].slice(0, 20),
      selectedComponentId: null,
    });
  },

  // Redo
  redo: () => {
    const state = get();
    if (state.redoStack.length === 0 || !state.pageContent) return;

    const nextState = state.redoStack[0];
    const newRedoStack = state.redoStack.slice(1);

    set({
      pageContent: nextState,
      undoStack: [...state.undoStack, state.pageContent].slice(-20),
      redoStack: newRedoStack,
      selectedComponentId: null,
    });
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set dirty state
  setDirty: (dirty: boolean) => {
    set({ isDirty: dirty });
  },

  // Set current language
  setCurrentLanguage: (language: string) => {
    set({ currentLanguage: language });
  },

  // Reset editor
  reset: () => {
    set({
      pageContent: null,
      selectedComponentId: null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
      isLoading: false,
      currentLanguage: 'en-US',
    });
  },
}));
