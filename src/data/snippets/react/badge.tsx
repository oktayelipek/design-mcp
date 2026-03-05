import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'Default' | 'Active' | 'Success' | 'Warning' | 'Error';
  type?: 'Solid' | 'Subtle' | 'Outline';
  size?: 'Small' | 'Medium' | 'Large';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant = 'Default', 
  type = 'Subtle', 
  size = 'Medium', 
  dot = false, 
  children, 
  className, 
  ...props 
}) => {
  // Base structural classes
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-full";
  
  // Sizing standard from Figma
  const sizes = {
    'Small': "h-4 px-1.5 text-[10px]",
    'Medium': "h-5 px-2 text-[11px]",
    'Large': "h-6 px-2.5 text-[12px]",
  };

  // Combine Type and Variant into structural tokens (CSS variables)
  // Example implementation structure using pseudo-tokens
  const getTokens = (t: string, v: string) => {
    // You would resolve to actual token variables like var(--actions-action-01) depending on type/variant matrix
    if (t === 'Subtle') {
      if (v === 'Success') return "bg-[var(--actions-action-01-10)] text-[var(--actions-action-01)]";
      if (v === 'Error') return "bg-[var(--actions-action-02-10)] text-[var(--actions-action-02)]";
    }
    return "bg-[var(--level-subsurface)] text-[var(--text-secondary)]";
  };

  return (
    <div className={`${baseClasses} ${sizes[size]} ${getTokens(type, variant)} ${className || ''}`} {...props}>
      {dot && <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />}
      {children}
    </div>
  );
};

Badge.displayName = 'Badge';
