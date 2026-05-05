"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect } from "react";

export function Hero() {
  const t = useTranslations("Home");
  const reduce = useReducedMotion();

  // Mouse parallax for the floating orbs / ball
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 60, damping: 18, mass: 0.8 });

  const orbAX = useTransform(sx, (v) => v * 30);
  const orbAY = useTransform(sy, (v) => v * 30);
  const orbBX = useTransform(sx, (v) => v * -22);
  const orbBY = useTransform(sy, (v) => v * -22);
  const ballX = useTransform(sx, (v) => v * -14);
  const ballY = useTransform(sy, (v) => v * -14);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set((e.clientX - cx) / cx);
      my.set((e.clientY - cy) / cy);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  const titleParts = (t("heroTitle") || "").split(" ");
  const accentIdx = Math.max(0, titleParts.length - 2);

  return (
    <section className="relative overflow-hidden isolate">
      {/* Layered gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900" />
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(250,204,21,0.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.55), transparent 60%)",
        }}
      />

      {/* Pitch grid lines */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 80% 65% at 50% 55%, black 40%, transparent 80%)",
        }}
      />

      {/* Center field arc — half circle */}
      <svg
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 h-[120%] opacity-[0.18] mix-blend-screen pointer-events-none"
        viewBox="0 0 800 800"
        fill="none"
      >
        <circle cx="400" cy="400" r="240" stroke="white" strokeWidth="1.5" strokeDasharray="3 8" />
        <circle cx="400" cy="400" r="120" stroke="white" strokeWidth="1" />
        <line x1="400" y1="0" x2="400" y2="800" stroke="white" strokeWidth="1" />
      </svg>

      {/* Floating parallax orbs */}
      <motion.div
        className="absolute -top-32 -end-32 w-[28rem] h-[28rem] rounded-full bg-amber-300/25 blur-3xl"
        style={{ x: orbAX, y: orbAY }}
        animate={{ y: [0, 22, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -start-32 w-[28rem] h-[28rem] rounded-full bg-emerald-300/30 blur-3xl"
        style={{ x: orbBX, y: orbBY }}
        animate={{ y: [0, -28, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spinning ball */}
      <motion.div
        aria-hidden
        className="absolute end-8 md:end-16 top-12 md:top-20 text-6xl md:text-8xl select-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        style={{ x: ballX, y: ballY }}
        animate={{ rotate: 360 }}
        transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
      >
        <motion.span
          className="block"
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ⚽
        </motion.span>
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 md:pt-28 pb-28 md:pb-32 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/25 text-[0.78rem] font-semibold tracking-[0.18em] uppercase mb-7"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-amber-300 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-amber-300" />
          </span>
          Kuwait · KWD
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05] max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {titleParts.map((w, i) => (
            <span
              key={i}
              className={
                i === accentIdx
                  ? "h-display-italic font-normal text-amber-300 px-1"
                  : ""
              }
            >
              {w}
              {i < titleParts.length - 1 ? " " : ""}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.45 }}
        >
          <Link
            href="/pitches"
            className="group relative inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-8 py-3.5 rounded-xl shadow-2xl shadow-emerald-950/40 hover:shadow-emerald-950/60 hover:-translate-y-1 transition overflow-hidden isolate"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 -inset-x-12 bg-gradient-to-r from-transparent via-amber-200/70 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"
            />
            <span className="relative">{t("browse")}</span>
            <span className="relative rtl:rotate-180 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
        >
          <Stat n="25+" label="Pitches" />
          <Stat n="24/7" label="Booking" divider />
          <Stat n="< 2m" label="To Book" />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          className="mt-14 flex flex-col items-center gap-2 text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className="text-[0.7rem] tracking-[0.3em] uppercase">Scroll</span>
          <motion.span
            className="block h-8 w-[1px] bg-white/40"
            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
            style={{ transformOrigin: "top" }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Marquee strip */}
      <div className="relative bg-emerald-950/55 border-y border-white/10 backdrop-blur-sm">
        <div className="marquee py-3 text-white/85 text-sm font-semibold tracking-[0.18em] uppercase">
          <div className="marquee-track">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              [
                "Premium Turf",
                "Real Grass",
                "Indoor Arenas",
                "Floodlit Nights",
                "Match Ready",
                "Verified Hosts",
                "Instant Booking",
                "Kuwait City",
              ].map((w, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-10 shrink-0">
                  <span>⚽ {w}</span>
                  <span className="opacity-40">/</span>
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom curve */}
      <svg
        className="absolute bottom-0 start-0 end-0 w-full text-[var(--background)]"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C320,80 720,0 1440,40 L1440,80 L0,80 Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}

function Stat({ n, label, divider }: { n: string; label: string; divider?: boolean }) {
  return (
    <div className={"relative px-3 " + (divider ? "border-x border-white/15" : "")}>
      <div className="h-display text-3xl md:text-4xl font-bold text-amber-200">{n}</div>
      <div className="text-[0.7rem] mt-1 tracking-[0.22em] uppercase text-white/65">{label}</div>
    </div>
  );
}
