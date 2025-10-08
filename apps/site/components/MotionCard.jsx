'use client';
import { motion } from "framer-motion";
export default function MotionCard({ children, className="" }) {
  return (
    <motion.div className={className}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.28, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
