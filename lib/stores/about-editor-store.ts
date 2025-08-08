import { availableComponents } from '@components/admin/content/component-palette';
import {
  ComponentInstance,
  PageContent,
  createDefaultSection,
  generateUniqueId,
} from '@lib/types/about-page-components';
import { DropResult } from 'react-beautiful-dnd';
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
  handleDragEnd: (result: DropResult) => void;
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

  // Handle drag and drop
  handleDragEnd: (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const state = get();
    if (!state.pageContent) return;

    const newPageContent = JSON.parse(
      JSON.stringify(state.pageContent)
    ) as PageContent;

    // Handle dragging from component palette
    if (source.droppableId === 'component-palette') {
      const componentDef = availableComponents.find(
        comp => comp.type === draggableId
      );
      if (!componentDef) return;

      // Parse destination
      const [type, sectionId, columnIndex] = destination.droppableId.split('-');

      if (type === 'section' && sectionId && columnIndex !== undefined) {
        const section = newPageContent.sections.find(s => s.id === sectionId);
        if (section && section.columns[parseInt(columnIndex)]) {
          const newComponent: ComponentInstance = {
            id: generateUniqueId('comp'),
            type: componentDef.type,
            props: { ...componentDef.defaultProps },
          };

          section.columns[parseInt(columnIndex)].splice(
            destination.index,
            0,
            newComponent
          );
        }
      }
    } else {
      // Handle moving existing components
      const [sourceType, sourceSectionId, sourceColumnIndex] =
        source.droppableId.split('-');
      const [destType, destSectionId, destColumnIndex] =
        destination.droppableId.split('-');

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
            // Remove from source
            const [removed] = sourceColumn.splice(source.index, 1);
            // Add to destination
            destColumn.splice(destination.index, 0, removed);
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
