import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'focus' | 'success' | 'warning' | 'error' | 'disabled';
  size?: 'Small' | 'Medium' | 'Large' | 'X-Large';
  label?: string;
  assistiveText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ state = 'default', size = 'Medium', label, assistiveText, iconLeft, iconRight, className, ...props }, ref) => {
    // Structural layout wrapper
    const wrapperClasses = "flex flex-col gap-1 w-full";
    
    // Size to height mapping
    const sizes = {
      'Small': "h-8 text-sm",
      'Medium': "h-10 text-sm",
      'Large': "h-12 text-base",
      'X-Large': "h-14 text-lg",
    };

    // Semantic state mappings to background/border/text
    const states = {
      default: "bg-[var(--form-background-default)] border-[var(--form-border-default)] text-[var(--text-primary)]",
      focus: "bg-[var(--form-background-focus)] border-[var(--form-border-focus)] text-[var(--text-primary)] ring-1 ring-[var(--form-border-focus)]",
      success: "bg-[var(--form-background-default)] border-[var(--semantic-success-border)] text-[var(--text-primary)]",
      warning: "bg-[var(--form-background-default)] border-[var(--semantic-warning-border)] text-[var(--text-primary)]",
      error: "bg-[var(--form-background-default)] border-[var(--semantic-error-border)] text-[var(--text-primary)]",
      disabled: "bg-[var(--form-background-disabled)] border-transparent text-[var(--text-disabled)] cursor-not-allowed opacity-60",
    };

    const containerClasses = `flex items-center px-4 rounded-lg border transition-colors ${states[state]} ${sizes[size]}`;

    return (
      <div className={`${wrapperClasses} ${className || ''}`}>
        {label && (
          <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        
        <div className={containerClasses}>
          {iconLeft && <span className="mr-2 text-[var(--icon-tertiary)] flex-shrink-0">{iconLeft}</span>}
          
          <input
            ref={ref}
            disabled={state === 'disabled'}
            className="w-full h-full bg-transparent border-none outline-none focus:ring-0 peer placeholder-[var(--text-quaternary)]"
            {...props}
          />
          
          {iconRight && <span className="ml-2 text-[var(--icon-tertiary)] flex-shrink-0">{iconRight}</span>}
        </div>
        
        {assistiveText && (
          <span className={`text-xs mt-1 ${state === 'error' ? 'text-[var(--actions-action-02)]' : 'text-[var(--text-tertiary)]'}`}>
            {assistiveText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
