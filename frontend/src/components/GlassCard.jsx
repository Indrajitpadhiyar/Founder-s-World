import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({
  children,
  className = '',
  glowColor = 'none',
  hoverable = true,
  onClick,
}) => {
  let borderGlowClass;
  switch (glowColor) {
    case 'emerald':
      borderGlowClass = 'glow-border-emerald';
      break;
    case 'cyan':
      borderGlowClass = 'glow-border-cyan';
      break;
    case 'indigo':
      borderGlowClass = 'glow-border-indigo';
      break;
    case 'purple':
      borderGlowClass = 'glow-border-purple';
      break;
    default:
      borderGlowClass = 'border-slate-800/40';
  }

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.4)' } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 border ${borderGlowClass} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
export default GlassCard;
