'use client';

import { useTheme } from '@lib/hooks/use-theme';
import { type VariantProps, cva } from 'class-variance-authority';

import * as React from 'react';

import { cn } from '../../lib/utils';

const alertVariants = cva(
  '[&>svg]:text-foreground relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive: '',
        success: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => {
  const { isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return cn(
          'border-destructive/50 text-destructive [&>svg]:text-destructive',
          isDark ? 'border-destructive' : ''
        );
      case 'success':
        return cn(
          'border-green-200 text-green-700 [&>svg]:text-green-600',
          isDark
            ? 'border-green-800 bg-green-950 text-green-300'
            : 'bg-green-50'
        );
      default:
        return '';
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), getVariantStyles(), className)}
      {...props}
    />
  );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 leading-none font-medium tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
