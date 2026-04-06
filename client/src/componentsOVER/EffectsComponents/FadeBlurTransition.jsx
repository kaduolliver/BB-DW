import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FadeBlurTransition = React.forwardRef(function FadeBlurTransition(
  { id, children, duration = 0.3, blur = 10, className = '', ...props },
  ref
) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        key={id}
        initial={{ opacity: 0, filter: `blur(${blur}px)` }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, filter: `blur(${blur}px)` }}
        transition={{ duration, ease: 'easeInOut' }}
        className={`absolute inset-0 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

export default FadeBlurTransition;
