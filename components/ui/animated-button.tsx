"use client";

import { motion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";

export function AnimatedButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
}
