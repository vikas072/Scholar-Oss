import { useState, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CustomTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right" | "top-right" | "top-left";
  disabled?: boolean;
  key?: any;
}

export default function CustomTooltip({
  content,
  children,
  position = "top",
  disabled = false,
}: CustomTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Slight delay before opening so rapid cursors don't trigger flickering
    timeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(false);
  };

  // Map positions to tailwind styles and Framer Motion offsets
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-3.5 origin-bottom";
      case "top-right":
        return "bottom-full right-0 mb-3.5 origin-bottom-right";
      case "top-left":
        return "bottom-full left-0 mb-3.5 origin-bottom-left";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-3.5 origin-top";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-3.5 origin-right";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-3.5 origin-left";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-3.5 origin-bottom";
    }
  };

  const getAnimationVariants = () => {
    const shift = 8;
    switch (position) {
      case "top":
        return {
          initial: { opacity: 0, scale: 0.92, y: shift, x: "-50%" },
          animate: { opacity: 1, scale: 1, y: 0, x: "-50%" },
          exit: { opacity: 0, scale: 0.94, y: shift / 2, x: "-50%" },
        };
      case "top-right":
        return {
          initial: { opacity: 0, scale: 0.92, y: shift },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.94, y: shift / 2 },
        };
      case "top-left":
        return {
          initial: { opacity: 0, scale: 0.92, y: shift },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.94, y: shift / 2 },
        };
      case "bottom":
        return {
          initial: { opacity: 0, scale: 0.92, y: -shift, x: "-50%" },
          animate: { opacity: 1, scale: 1, y: 0, x: "-50%" },
          exit: { opacity: 0, scale: 0.94, y: -shift / 2, x: "-50%" },
        };
      case "left":
        return {
          initial: { opacity: 0, scale: 0.92, x: shift, y: "-50%" },
          animate: { opacity: 1, scale: 1, x: 0, y: "-50%" },
          exit: { opacity: 0, scale: 0.94, x: shift / 2, y: "-50%" },
        };
      case "right":
        return {
          initial: { opacity: 0, scale: 0.92, x: -shift, y: "-50%" },
          animate: { opacity: 1, scale: 1, x: 0, y: "-50%" },
          exit: { opacity: 0, scale: 0.94, x: -shift / 2, y: "-50%" },
        };
    }
  };

  // Render tooltip arrow
  const renderArrow = () => {
    const baseArrow = "absolute w-2.5 h-2.5 bg-slate-950 border border-slate-800 rotate-45 pointer-events-none";
    switch (position) {
      case "top":
        return <div className={`${baseArrow} bottom-[-6px] left-1/2 -translate-x-1/2 border-t-0 border-l-0 z-[-1] bg-slate-950`} />;
      case "top-right":
        return <div className={`${baseArrow} bottom-[-6px] right-6 border-t-0 border-l-0 z-[-1] bg-slate-950`} />;
      case "top-left":
        return <div className={`${baseArrow} bottom-[-6px] left-6 border-t-0 border-l-0 z-[-1] bg-slate-950`} />;
      case "bottom":
        return <div className={`${baseArrow} top-[-6px] left-1/2 -translate-x-1/2 border-b-0 border-r-0 z-[-1] bg-slate-950`} />;
      case "left":
        return <div className={`${baseArrow} right-[-6px] top-1/2 -translate-y-1/2 border-b-0 border-l-0 z-[-1] bg-slate-950`} />;
      case "right":
        return <div className={`${baseArrow} left-[-6px] top-1/2 -translate-y-1/2 border-t-0 border-r-0 z-[-1] bg-slate-950`} />;
    }
  };

  return (
    <div
      className="relative inline-block w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            variants={getAnimationVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 18, stiffness: 180 }}
            className={`absolute ${getPositionClasses()} z-50 pointer-events-none`}
          >
            <div className="bg-slate-950/98 backdrop-blur-md text-slate-200 border border-slate-800/80 p-4 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] select-none w-72">
              {content}
              {renderArrow()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
