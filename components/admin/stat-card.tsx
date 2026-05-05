"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function StatCard({
  label,
  value,
  numeric,
  prefix,
  suffix,
  icon,
  decimals = 0,
  delay = 0,
}: {
  label: string;
  value?: ReactNode;
  numeric?: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  decimals?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toString();
    return `${prefix ?? ""}${n}${suffix ?? ""}`;
  });

  useEffect(() => {
    if (numeric !== undefined && inView) {
      const controls = animate(count, numeric, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
      return () => controls.stop();
    }
  }, [inView, numeric, count]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card p-5 relative overflow-hidden group"
    >
      <div className="absolute -end-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)]/10 to-transparent group-hover:scale-125 transition-transform duration-500" />
      <div className="relative flex items-start justify-between mb-3">
        <div className="text-sm text-[var(--muted-foreground)] font-medium">{label}</div>
        {icon && <div className="text-2xl opacity-80">{icon}</div>}
      </div>
      <div className="relative text-3xl font-bold tracking-tight">
        {numeric !== undefined ? <motion.span>{display}</motion.span> : value}
      </div>
    </motion.div>
  );
}
