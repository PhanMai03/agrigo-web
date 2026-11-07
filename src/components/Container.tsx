import type { HTMLAttributes, ReactNode } from 'react';

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'main';
};

/**
 * Standard Global Layout Container for AgriGo:
 * w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 (max-w-7xl is configured as 1360px)
 */
export function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

