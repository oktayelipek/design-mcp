import React, { forwardRef } from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'Default' | 'Enable' | 'Disabled';
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ state = 'Default', label, className, ...props }, ref) => {
    
    // Figma Size & Border Structure
    // - Size: 24x24px (w-6 h-6)
    // - Default Border: 1px solid secondary
    // - Active (Enable) Structure: often uses thicker colored border or inner dot
    
    // Map states to semantic tokens
    const states = {
      Default: "border-[var(--form-border-default)] bg-[var(--form-background-default)]",
      Enable: "border-[6px] border-[var(--actions-action-01)] bg-[var(--form-background-default)]", // 6px border creates an inner dot effect visually 
      Disabled: "border-[var(--form-border-disabled)] bg-[var(--form-background-disabled)] opacity-50 cursor-not-allowed",
    };

    return (
      <label className={`inline-flex items-center gap-2 cursor-pointer ${state === 'Disabled' ? 'cursor-not-allowed pointer-events-none' : ''} ${className || ''}`}>
        
        {/* Hidden internal HTML radio for accessibility & form submittions */}
        <input
          type="radio"
          ref={ref}
          className="peer sr-only"
          disabled={state === 'Disabled'}
          {...props}
        />

        {/* Custom Visual Radio Circle (extracted from Figma: 24x24 Circle) */}
        <div 
          className={`
            w-6 h-6 rounded-full flex-shrink-0 transition-all duration-200 ease-in-out
            peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--actions-action-01)]
            ${states[state]}
            ${state === 'Default' ? 'border' : ''}
          `}
          aria-hidden="true"
        />
        
        {/* Label (if any) */}
        {label && (
          <span className={`text-sm ${state === 'Disabled' ? 'text-[var(--text-disabled)]' : 'text-[var(--text-primary)]'}`}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';
