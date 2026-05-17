import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FoodImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  skeletonClassName?: string;
}

export function FoodImage({ className, containerClassName, skeletonClassName, alt, src, ...props }: FoodImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";

  return (
    <div className={cn("relative overflow-hidden bg-bistro-gray-light/30", containerClassName)}>
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={cn("absolute inset-0 bg-gray-200 animate-pulse", skeletonClassName)}
          />
        )}
      </AnimatePresence>
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
             setHasError(true);
          }
        }}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-700",
          isLoaded || hasError ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
}
