import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'Solid' | 'Solid Focus' | 'Outline' | 'Outline Focus';
  size?: 'Large' | 'Medium' | 'Small';
  presence?: 'Default' | 'Subtle';
  typeProps?: 'Text Only' | 'Icon+Text' | 'Text + Icon' | 'Icon Only';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'Solid', 
    size = 'Large', 
    presence = 'Default',
    typeProps = 'Text Only',
    iconLeft, 
    iconRight, 
    isLoading, 
    children, 
    className, 
    ...props 
  }, ref) => {
    
    // Core structure logic extracted perfectly from Figma
    // Figma -> BorderRadius: 8px (rounded-lg)
    // Figma -> Gap: 8px (gap-2) between Icon and Text
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors gap-2 flex-shrink-0";
    
    // Size Mappings (Figma px-perfect absolute bounds mapping)
    const sizes = {
      'Small': "h-[24px] px-[12px] py-[4px] text-xs",
      'Medium': "h-[32px] px-[36px] py-[8px] text-sm",
      'Large': "h-[44px] px-[48px] py-[12px] text-base",
    };

    // Variant Styles Mappings (Adapted for APP - No Hover & True Colors)
    const variants = {
      'Solid': "bg-[var(--button-primary)] text-[var(--inverse-pureWhite)] border border-transparent active:opacity-80 active:scale-[0.98]",
      'Solid Focus': "bg-[var(--text-focus)] text-[var(--level-basement)] border border-transparent active:opacity-80 active:scale-[0.98]",
      'Outline': "bg-transparent text-[var(--text-focus)] border border-[var(--level-elevation-\\+3)] active:bg-[#ffffff08] active:scale-[0.98]",
      'Outline Focus': "bg-transparent text-[var(--text-focus)] border border-[var(--text-focus)] active:bg-[#ffffff08] active:scale-[0.98]",
    };

    // Presence adjustment (e.g. Subtle lowers opacity or alters state logic if needed)
    const presenceClass = presence === 'Subtle' ? 'opacity-70' : '';

    const btnDisabled = isLoading || props.disabled;
    const disabledClass = btnDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

    return (
      <button
        ref={ref}
        disabled={btnDisabled}
        className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${presenceClass} ${disabledClass} ${className || ''}`}
        {...props}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
        ) : iconLeft || typeProps === 'Icon+Text' || typeProps === 'Icon Only' ? (
          <span className="flex-shrink-0">{iconLeft || <span className="w-4 h-4 bg-current opacity-50 rounded-full inline-block" />}</span> // Fallback pseudo icon
        ) : null}
        
        {typeProps !== 'Icon Only' && (
          <span>{children}</span>
        )}
        
        {!isLoading && (iconRight || typeProps === 'Text + Icon') && (
          <span className="flex-shrink-0">{iconRight || <span className="w-4 h-4 bg-current opacity-50 rounded-full inline-block" />}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
