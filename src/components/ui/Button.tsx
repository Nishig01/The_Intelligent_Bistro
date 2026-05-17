import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-bistro-charcoal text-white hover:bg-black shadow-lg shadow-black/10",
      secondary: "bg-bistro-gold text-white hover:opacity-90 shadow-lg shadow-bistro-gold/20",
      outline: "border border-bistro-gray-light bg-transparent text-bistro-charcoal hover:border-bistro-charcoal",
      ghost: "bg-transparent text-bistro-gray hover:text-bistro-charcoal hover:bg-gray-50",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs font-medium",
      md: "h-12 px-6 text-[15px] font-medium",
      lg: "h-14 px-8 text-[16px] font-medium w-full",
      icon: "h-10 w-10 flex items-center justify-center p-0",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full tracking-wide transition-colors",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
