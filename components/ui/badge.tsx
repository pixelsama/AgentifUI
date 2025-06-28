import { cn } from '@lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

import * as React from 'react';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-full border px-2.5 py-0.5 font-serif text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-stone-900 text-stone-50 hover:bg-stone-900/80',
        secondary:
          'border-transparent bg-stone-100 text-stone-900 hover:bg-stone-100/80',
        destructive:
          'border-transparent bg-red-500 text-stone-50 hover:bg-red-500/80',
        outline: 'border-stone-200 text-stone-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
