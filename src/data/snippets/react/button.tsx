import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'buy' | 'sell';
  size?: 'Small' | 'Medium' | 'Large' | 'X-Large';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'Medium', iconLeft, iconRight, isLoading, children, className, ...props }, ref) => {
    // Figma Code Connect Snippet Example
    // Token resolution and styling should be handled via styled-components or Tailwind mapped to your theme mode.
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors";
    
    // Size Mappings
    const sizes = {
      'Small': "h-[32px] px-[12px] text-xs",
      'Medium': "h-[40px] px-[16px] text-sm",
      'Large': "h-[48px] px-[20px] text-base",
      'X-Large': "h-[56px] px-[24px] text-lg",
    };

    // Variant Mappings - In reality, map directly to your semantic token CSS variables
    const variants = {
      primary: "bg-[var(--button-solid)] text-[var(--button-solid-text)] hover:opacity-90",
      secondary: "bg-[var(--button-muted)] text-[var(--button-muted-text)] hover:opacity-90",
      buy: "bg-[var(--actions-action-01)] text-[var(--semantic-on-color)] hover:opacity-90",
      sell: "bg-[var(--actions-action-02)] text-[var(--semantic-on-color)] hover:opacity-90",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className || ''}`}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin mr-2">C</span> // Replace with actual Loader icon
        ) : iconLeft ? (
          <span className="mr-2">{iconLeft}</span>
        ) : null}
        
        {children}
        
        {!isLoading && iconRight && <span className="ml-2">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
