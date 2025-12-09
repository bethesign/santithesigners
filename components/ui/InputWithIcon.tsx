import React from 'react';
import { Input } from './input';
import { cn } from './utils';
import { LucideIcon } from 'lucide-react';

interface InputWithIconProps extends React.ComponentProps<typeof Input> {
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
}

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, iconPosition = 'left', className, onIconClick, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className={cn("h-5 w-5", onIconClick && "cursor-pointer")} onClick={onIconClick} />
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            className,
            Icon && iconPosition === 'left' ? "pl-10" : "",
            Icon && iconPosition === 'right' ? "pr-10" : ""
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon className={cn("h-5 w-5", onIconClick && "cursor-pointer")} onClick={onIconClick} />
          </div>
        )}
      </div>
    );
  }
);
InputWithIcon.displayName = "InputWithIcon";
