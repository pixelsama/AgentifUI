'use client';

import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
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
  PageContent,
  isDynamicFormat,
  migrateAboutTranslationData,
} from '@lib/types/about-page-components';
import { cn } from '@lib/utils';
import { Plus, Redo2, RotateCcw, Save, Trash2, Undo2 } from 'lucide-react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';

import React, { useEffect, useMemo } from 'react';

import { useTranslations } from 'next-intl';

import ComponentPalette from './component-palette';
import ComponentRenderer from './component-renderer';
import PropertyEditor from './property-editor';
import StrictModeDroppable from './strict-mode-droppable';

interface AboutEditorProps {
  translations: Record<SupportedLocale, AboutTranslationData>;
  currentLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  onTranslationsChange: (
    newTranslations: Record<SupportedLocale, AboutTranslationData>
  ) => void;
  onLocaleChange: (newLocale: SupportedLocale) => void;
}

export function AboutEditor({
  translations,
  currentLocale,
  supportedLocales,
  onTranslationsChange,
  onLocaleChange,
}: AboutEditorProps) {
  const t = useTranslations('pages.admin.content.editor');

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

  // Get selected component from page content
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

  // Load current translation into editor when locale changes
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
  }, [currentLocale, currentTranslation, setPageContent, setCurrentLanguage]);

  // Handle property changes
  const handlePropsChange = (newProps: Record<string, unknown>) => {
    if (selectedComponentId) {
      updateComponentProps(selectedComponentId, newProps);
    }
  };

  // Handle component deletion
  const handleDeleteComponent = () => {
    if (selectedComponentId) {
      deleteComponent(selectedComponentId);
    }
  };

  // Handle component selection
  const handleComponentClick = (componentId: string) => {
    setSelectedComponent(componentId);
  };

  // Save changes back to translations
  const handleSave = () => {
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
  };

  // Handle reset
  const handleReset = () => {
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
  };

  if (!pageContent) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="bg-card space-y-4 border-b p-4">
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!isDirty}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={!isDirty}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-h-0 flex-1">
          {/* Left Panel - Components & Properties */}
          <div className="bg-background w-80 space-y-6 overflow-y-auto border-r p-4">
            {/* Component Palette */}
            <ComponentPalette />

            {/* Property Editor */}
            <PropertyEditor
              component={selectedComponent}
              onPropsChange={handlePropsChange}
              onDeleteComponent={handleDeleteComponent}
            />
          </div>

          {/* Right Panel - Canvas */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {pageContent.sections.map((section, sectionIndex) => (
                <div key={section.id} className="space-y-4">
                  {/* Section Drop Zone (before each section) */}
                  {sectionIndex > 0 && (
                    <StrictModeDroppable
                      droppableId={`section-drop-${sectionIndex}`}
                    >
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={cn(
                            'rounded-lg border-2 border-dashed transition-all duration-200',
                            snapshot.isDraggingOver
                              ? 'h-16 border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
                              : 'h-2 border-transparent'
                          )}
                        >
                          {snapshot.isDraggingOver && (
                            <div className="flex h-full items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                              Drop here to create new section
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  )}

                  {/* Section Content */}
                  <Card className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-muted-foreground text-sm">
                          Section {sectionIndex + 1} • {section.layout}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Delete section logic here
                          }}
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={cn(
                          'grid gap-4',
                          section.layout === 'single-column' && 'grid-cols-1',
                          section.layout === 'two-column' && 'grid-cols-2',
                          section.layout === 'three-column' && 'grid-cols-3'
                        )}
                      >
                        {section.columns.map((column, columnIndex) => (
                          <StrictModeDroppable
                            key={`${section.id}-${columnIndex}`}
                            droppableId={`section-${section.id}-${columnIndex}`}
                          >
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={cn(
                                  'min-h-24 rounded-lg border-2 border-dashed p-3 transition-colors',
                                  snapshot.isDraggingOver
                                    ? 'border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
                                    : 'border-border bg-muted/30'
                                )}
                              >
                                {column.length === 0 &&
                                  !snapshot.isDraggingOver && (
                                    <div className="text-muted-foreground flex h-16 items-center justify-center text-sm">
                                      Drop components here
                                    </div>
                                  )}

                                {column.map((component, componentIndex) => (
                                  <Draggable
                                    key={component.id}
                                    draggableId={component.id}
                                    index={componentIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() =>
                                          handleComponentClick(component.id)
                                        }
                                        className={cn(
                                          'mb-3 cursor-pointer rounded-lg border p-3 transition-all',
                                          selectedComponentId === component.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                            : 'border-border bg-card hover:border-blue-200 hover:bg-blue-50/50',
                                          snapshot.isDragging &&
                                            'rotate-2 shadow-lg'
                                        )}
                                      >
                                        <ComponentRenderer
                                          component={component}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </StrictModeDroppable>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Final Drop Zone */}
              <StrictModeDroppable droppableId="section-drop-final">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      'rounded-lg border-2 border-dashed transition-all duration-200',
                      snapshot.isDraggingOver
                        ? 'h-16 border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-950'
                        : 'h-8 border-transparent'
                    )}
                  >
                    {snapshot.isDraggingOver && (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        Drop here to create new section
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
