'use client';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Separator } from '@components/ui/separator';
import type { SupportedLocale } from '@lib/config/language-config';
import { getLanguageInfo } from '@lib/config/language-config';
import { useAboutEditorStore } from '@lib/stores/about-editor-store';
import {
  AboutTranslationData,
  ComponentInstance,
  PageContent,
  isDynamicFormat,
  migrateAboutTranslationData,
} from '@lib/types/about-page-components';
import { cn } from '@lib/utils';
import {
  useDebouncedCallback,
  useThrottledCallback,
} from '@lib/utils/performance';
import { Plus, Redo2, Trash2, Undo2 } from 'lucide-react';

import React, { useCallback, useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import ComponentPalette from './component-palette';
import ComponentRenderer from './component-renderer';
import { ContextMenu } from './context-menu';
import { Droppable, Sortable, SortableContainer } from './dnd-components';
import { DndContextWrapper } from './dnd-context';

interface AboutEditorProps {
  translations: Record<SupportedLocale, AboutTranslationData>;
  currentLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  onTranslationsChange: (
    newTranslations: Record<SupportedLocale, AboutTranslationData>
  ) => void;
  onLocaleChange: (newLocale: SupportedLocale) => void;
}

// Section Drop Zone Component for visual feedback - simplified approach
function SectionDropZone({
  sectionId,
  children,
  className,
}: {
  sectionId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [isHighlighted, setIsHighlighted] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      // Only handle palette item drags
      if (!document.body.classList.contains('palette-dragging')) {
        setIsHighlighted(false);
        return;
      }

      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        setIsHighlighted(isInside);
      }
    };

    const handleDragEnd = () => {
      setIsHighlighted(false);
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragend', handleDragEnd);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      data-section-id={sectionId}
      className={cn(
        className,
        isHighlighted &&
          'ring-opacity-75 bg-blue-50/30 ring-2 ring-blue-400 dark:bg-blue-900/30 dark:ring-blue-300'
      )}
    >
      {children}
    </div>
  );
}

export function AboutEditor({
  translations,
  currentLocale,
  supportedLocales,
  onTranslationsChange,
  onLocaleChange,
}: AboutEditorProps) {
  const t = useTranslations('pages.admin.content.editor');

  // Context menu state
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);

  // Zustand store
  const {
    pageContent,
    selectedComponentId,
    undoStack,
    redoStack,
    isDirty,
    setPageContent,
    setSelectedComponent,
    updateComponentProps,
    deleteComponent,
    handleDragEnd,
    addSection,
    undo,
    redo,
    setCurrentLanguage,
  } = useAboutEditorStore();

  // Get current translation and ensure it's in dynamic format
  const currentTranslation = useMemo(() => {
    let translation = translations[currentLocale] || {};

    // If it's not already in dynamic format, migrate it
    if (!isDynamicFormat(translation)) {
      translation = migrateAboutTranslationData(translation);
    }

    return translation;
  }, [translations, currentLocale]);

  // Get selected component from page content (currently unused but kept for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedComponent = useMemo(() => {
    if (!pageContent || !selectedComponentId) return null;

    for (const section of pageContent.sections) {
      for (const column of section.columns) {
        const component = column.find(comp => comp.id === selectedComponentId);
        if (component) return component;
      }
    }
    return null;
  }, [pageContent, selectedComponentId]);

  // Get context menu component (dynamically updated)
  const contextMenuComponent = useMemo(() => {
    if (!pageContent || !contextMenu?.componentId) return null;

    for (const section of pageContent.sections) {
      for (const column of section.columns) {
        const component = column.find(
          comp => comp.id === contextMenu.componentId
        );
        if (component) return component;
      }
    }
    return null;
  }, [pageContent, contextMenu?.componentId]);

  // Initial load and locale change handling
  useEffect(() => {
    if (currentTranslation.sections) {
      const content: PageContent = {
        sections: currentTranslation.sections,
        metadata: currentTranslation.metadata || {
          version: '1.0.0',
          lastModified: new Date().toISOString(),
          author: 'admin',
        },
      };
      setPageContent(content);
    }
    setCurrentLanguage(currentLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocale, setPageContent, setCurrentLanguage]); // Only reload on locale change, not on translation data updates

  // Debounced auto-save function
  const debouncedSave = useDebouncedCallback(
    useCallback(() => {
      if (!pageContent) return;

      const updatedTranslation: AboutTranslationData = {
        sections: pageContent.sections,
        metadata: {
          ...pageContent.metadata,
          lastModified: new Date().toISOString(),
        },
      };

      const newTranslations = {
        ...translations,
        [currentLocale]: updatedTranslation,
      };

      onTranslationsChange(newTranslations);
    }, [pageContent, translations, currentLocale, onTranslationsChange]),
    100, // 100ms delay for near real-time sync
    [pageContent, translations, currentLocale]
  );

  // Auto-save when pageContent changes
  useEffect(() => {
    if (pageContent) {
      debouncedSave();
    }
  }, [pageContent, debouncedSave]);

  // Throttled property change handler for better performance
  const throttledPropsChange = useThrottledCallback(
    useCallback(
      (newProps: Record<string, unknown>) => {
        if (selectedComponentId) {
          updateComponentProps(selectedComponentId, newProps);
          debouncedSave(); // Auto-save after prop changes
        }
      },
      [selectedComponentId, updateComponentProps, debouncedSave]
    ),
    100, // 100ms throttle
    [selectedComponentId, updateComponentProps]
  );

  // Handle property changes (currently unused but kept for future use)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePropsChange = throttledPropsChange;

  // Handle component deletion
  const handleDeleteComponent = (componentId: string) => {
    deleteComponent(componentId);
    setContextMenu(null);
  };

  // Handle component selection
  const handleComponentClick = (componentId: string) => {
    setSelectedComponent(componentId);
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Find the component
    let targetComponent: ComponentInstance | null = null;
    for (const section of pageContent?.sections || []) {
      for (const column of section.columns) {
        const component = column.find(comp => comp.id === componentId);
        if (component) {
          targetComponent = component;
          break;
        }
      }
      if (targetComponent) break;
    }

    if (targetComponent) {
      setSelectedComponent(componentId); // Set as selected when right-clicking
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        componentId: componentId,
      });
    }
  };

  // Handle context menu props change
  const handleContextMenuPropsChange = (newProps: Record<string, unknown>) => {
    if (contextMenu?.componentId) {
      updateComponentProps(contextMenu.componentId, newProps);
      debouncedSave(); // Auto-save after prop changes
    }
  };

  if (!pageContent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <DndContextWrapper onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div
          className={cn(
            'space-y-4 border-b p-4',
            'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'
          )}
        >
          {/* Language Selector */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {t('common.editLanguage')}
              </label>
              <Select
                value={currentLocale}
                onValueChange={value =>
                  onLocaleChange(value as SupportedLocale)
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-60">
                        {getLanguageInfo(currentLocale).code}
                      </span>
                      <span className="font-medium">
                        {getLanguageInfo(currentLocale).nativeName}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {supportedLocales.map(locale => {
                    const langInfo = getLanguageInfo(locale);
                    return (
                      <SelectItem key={locale} value={locale}>
                        <div className="flex w-full items-center justify-between">
                          <span className="font-medium">
                            {langInfo.nativeName}
                          </span>
                          <span className="ml-2 text-xs opacity-60">
                            {langInfo.code}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              {isDirty && <Badge variant="secondary">Unsaved</Badge>}
              <Badge variant="outline">
                {pageContent.sections.length} sections
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={undoStack.length === 0}
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={redoStack.length === 0}
              >
                <Redo2 className="mr-2 h-4 w-4" />
                Redo
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addSection('single-column')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1">
          {/* Left Panel - Component Palette */}
          <div
            className={cn(
              'w-64 overflow-y-auto border-r p-4',
              'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-900'
            )}
          >
            <ComponentPalette />
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {pageContent.sections.map((section, sectionIndex) => (
                <div key={section.id} className="space-y-4">
                  {/* Section Drop Zone (before each section) */}
                  {sectionIndex > 0 && (
                    <Droppable
                      id={`section-drop-${sectionIndex}`}
                      className="h-2 rounded-lg border-2 border-dashed border-transparent transition-all duration-200 hover:h-16 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-950"
                    >
                      <div className="flex h-full items-center justify-center text-sm font-medium text-blue-600 opacity-0 hover:opacity-100 dark:text-blue-400">
                        Drop here to create new section
                      </div>
                    </Droppable>
                  )}

                  {/* Section Content */}
                  <SectionDropZone
                    sectionId={section.id}
                    className={cn(
                      'rounded-lg border p-4 transition-all duration-200',
                      'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'
                    )}
                  >
                    <div className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            'text-sm font-medium',
                            'text-stone-600 dark:text-stone-400'
                          )}
                        >
                          Section {sectionIndex + 1} • {section.layout}
                        </h3>
                        <button
                          onClick={() => {
                            // Delete section logic here
                          }}
                          className={cn(
                            'h-6 w-6 rounded p-0 text-red-500 transition-colors',
                            'hover:bg-red-100 dark:hover:bg-red-900/50'
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'grid gap-4',
                        section.layout === 'single-column' && 'grid-cols-1',
                        section.layout === 'two-column' && 'grid-cols-2',
                        section.layout === 'three-column' && 'grid-cols-3'
                      )}
                    >
                      {section.columns.map((column, columnIndex) => {
                        const columnItems = column.map(comp => comp.id);
                        return (
                          <SortableContainer
                            key={`${section.id}-${columnIndex}`}
                            id={`section-${section.id}-${columnIndex}`}
                            items={columnItems}
                            className={cn(
                              'min-h-24 rounded-md border-2 border-dashed p-3 transition-all duration-200',
                              'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100',
                              'dark:border-stone-600 dark:bg-stone-700/50 dark:hover:border-stone-500 dark:hover:bg-stone-600/50'
                            )}
                          >
                            {column.length === 0 && (
                              <div
                                className={cn(
                                  'flex h-16 items-center justify-center text-sm',
                                  'text-stone-500 dark:text-stone-400'
                                )}
                              >
                                Drop components here
                              </div>
                            )}

                            {column.map(component => (
                              <Sortable
                                key={component.id}
                                id={component.id}
                                className={cn(
                                  'mb-3 cursor-pointer rounded-lg border p-3 transition-all duration-300',
                                  selectedComponentId === component.id
                                    ? 'border-stone-500 bg-stone-100 dark:border-stone-400 dark:bg-stone-700'
                                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:hover:border-stone-500 dark:hover:bg-stone-700'
                                )}
                              >
                                <div
                                  data-component-id={component.id}
                                  onClick={() =>
                                    handleComponentClick(component.id)
                                  }
                                  onContextMenu={e =>
                                    handleContextMenu(e, component.id)
                                  }
                                  className="animate-component-target"
                                >
                                  <ComponentRenderer component={component} />
                                </div>
                              </Sortable>
                            ))}
                          </SortableContainer>
                        );
                      })}
                    </div>
                  </SectionDropZone>
                </div>
              ))}

              {/* Final Drop Zone */}
              <Droppable
                id="section-drop-final"
                className="h-8 rounded-lg border-2 border-dashed border-transparent transition-all duration-200 hover:h-16 hover:border-blue-300 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-950"
              >
                <div className="flex h-full items-center justify-center text-sm font-medium text-blue-600 opacity-0 hover:opacity-100 dark:text-blue-400">
                  Drop here to create new section
                </div>
              </Droppable>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && contextMenuComponent && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          component={contextMenuComponent}
          onPropsChange={handleContextMenuPropsChange}
          onDelete={handleDeleteComponent}
          onClose={() => setContextMenu(null)}
        />
      )}
    </DndContextWrapper>
  );
}
