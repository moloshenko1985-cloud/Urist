import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  visible: boolean;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ visible, onFinish }) => {
  useEffect(() => {
    if (!visible) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(onFinish, prefersReduced ? 450 : 1450);
    return () => window.clearTimeout(timer);
  }, [visible, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="app-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          onClick={onFinish}
          role="status"
          aria-label="Загрузка приложения Юрист в кармане — ЖК Прогресс"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, #1C3D7A 0%, #102552 48%, #091530 100%)',
          }}
        >
          {/* Ambient Golden Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.55, scale: 1.15 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="pointer-events-none absolute w-72 h-72 rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(245, 210, 122, 0.32) 0%, rgba(245, 210, 122, 0) 70%)',
            }}
          />

          {/* Subtle Expanding Golden Ring */}
          <motion.div
            initial={{ opacity: 0.65, scale: 0.72 }}
            animate={{ opacity: 0, scale: 1.75 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="pointer-events-none absolute w-36 h-36 rounded-[36px] border border-[#F5D27A]/45"
          />

          {/* App Emblem Container */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.72, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 20,
                mass: 0.9,
              }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-[#F5D27A]/40"
            >
              <img
                src="/pwa-512x512.png"
                alt="Юрист в кармане — ЖК Прогресс"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Diagonal Gold Light Sheen */}
              <motion.div
                initial={{ x: '-140%', opacity: 0 }}
                animate={{ x: '160%', opacity: [0, 0.75, 0] }}
                transition={{ duration: 0.85, delay: 0.35, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-0 w-1/2 h-full skew-x-[-22deg]"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,243,205,0.45) 50%, rgba(255,255,255,0) 100%)',
                }}
              />
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 text-center px-6"
            >
              <div className="text-[24px] sm:text-[26px] font-bold tracking-tight text-white">
                Юрист в кармане
              </div>
              <div className="mt-1 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#F5D27A]">
                ЖК Прогресс
              </div>
            </motion.div>

            {/* Minimal Golden Loading Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="mt-8 w-36 h-[3px] rounded-full bg-white/12 overflow-hidden"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.0, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: '0% 50%' }}
                className="w-full h-full rounded-full bg-gradient-to-r from-[#C89328] via-[#F6D379] to-[#FFF2C2]"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
