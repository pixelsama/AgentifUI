'use client';

import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { ComponentInstance } from '@lib/types/about-page-components';
import { Plus, Trash2 } from 'lucide-react';

import React from 'react';

interface PropertyEditorProps {
  component: ComponentInstance | null;
  onPropsChange: (newProps: Record<string, unknown>) => void;
  onDeleteComponent?: () => void;
}

/**
 * Array Property Editor Component
 *
 * Handles editing of array properties like cards items
 */
interface ArrayPropertyEditorProps {
  items: Array<Record<string, unknown>>;
  onItemsChange: (newItems: Array<Record<string, unknown>>) => void;
}

const ArrayPropertyEditor: React.FC<ArrayPropertyEditorProps> = ({
  items,
  onItemsChange,
}) => {
  const handleItemChange = (index: number, key: string, value: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    onItemsChange(newItems);
  };

  const handleAddItem = () => {
    // Default structure for new card items
    const newItem = {
      title: 'New Item',
      description: 'Add description here',
    };
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card key={index} className="border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Item {index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(index)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label
                  htmlFor={`item-${index}-${key}`}
                  className="text-sm capitalize"
                >
                  {key}
                </Label>
                <Textarea
                  id={`item-${index}-${key}`}
                  value={String(value || '')}
                  onChange={e => handleItemChange(index, key, e.target.value)}
                  className="min-h-[60px] text-sm"
                  placeholder={`Enter ${key}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddItem}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </div>
  );
};

/**
 * Property Editor Component
 *
 * Main property editor that renders appropriate inputs based on component type and properties
 */
const PropertyEditor: React.FC<PropertyEditorProps> = ({
  component,
  onPropsChange,
  onDeleteComponent,
}) => {
  if (!component) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center">
        <p>Select a component to edit its properties</p>
      </div>
    );
  }

  const handleInputChange = (name: string, value: unknown) => {
    onPropsChange({ ...component.props, [name]: value });
  };

  const renderPropertyField = (key: string, value: unknown) => {
    const fieldId = `prop-${key}`;

    // Array properties (cards items)
    if (key === 'items' && component.type === 'cards') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="capitalize">
            {key}
          </Label>
          <ArrayPropertyEditor
            items={value as Array<Record<string, unknown>>}
            onItemsChange={newItems => handleInputChange(key, newItems)}
          />
        </div>
      );
    }

    // Select fields
    const selectFields: Record<
      string,
      Array<{ value: string; label: string }>
    > = {
      layout: [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ],
      thickness: [
        { value: 'thin', label: 'Thin' },
        { value: 'medium', label: 'Medium' },
        { value: 'thick', label: 'Thick' },
      ],
      style: [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
      ],
      alignment: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      textAlign: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      action: [
        { value: 'link', label: 'Link' },
        { value: 'submit', label: 'Submit' },
        { value: 'external', label: 'External' },
      ],
      variant: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
      ],
      level: [
        { value: '1', label: 'H1' },
        { value: '2', label: 'H2' },
        { value: '3', label: 'H3' },
        { value: '4', label: 'H4' },
        { value: '5', label: 'H5' },
        { value: '6', label: 'H6' },
      ],
    };

    if (selectFields[key]) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="capitalize">
            {key}
          </Label>
          <Select
            value={String(value || '')}
            onValueChange={newValue =>
              handleInputChange(
                key,
                key === 'level' ? Number(newValue) : newValue
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${key}`} />
            </SelectTrigger>
            <SelectContent>
              {selectFields[key].map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Multi-line text fields
    if (
      key === 'content' &&
      (component.type === 'paragraph' || component.type === 'heading')
    ) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="capitalize">
            {key}
          </Label>
          <Textarea
            id={fieldId}
            value={String(value || '')}
            onChange={e => handleInputChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
            className="min-h-[80px]"
          />
        </div>
      );
    }

    // Number fields
    if (typeof value === 'number') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="capitalize">
            {key}
          </Label>
          <Input
            id={fieldId}
            type="number"
            value={String(value || '')}
            onChange={e => handleInputChange(key, Number(e.target.value) || 0)}
            placeholder={`Enter ${key}`}
          />
        </div>
      );
    }

    // String fields
    if (typeof value === 'string') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={fieldId} className="capitalize">
            {key}
          </Label>
          <Input
            id={fieldId}
            type="text"
            value={String(value || '')}
            onChange={e => handleInputChange(key, e.target.value)}
            placeholder={`Enter ${key}`}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">
            {component.type} Properties
          </CardTitle>
          {onDeleteComponent && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDeleteComponent}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(component.props).map(([key, value]) =>
          renderPropertyField(key, value)
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyEditor;
