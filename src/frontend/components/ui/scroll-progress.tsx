"use client";

import { motion, useScroll } from "framer-motion";

import { cn } from "@/utils/cn";

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof typeof motion.div> {
  ref?: React.Ref<HTMLDivElement>;
}

export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-px origin-left bg-gradient-to-r from-primary via-secondary to-accent",
        className
      )}
      style={{
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
}

