import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Section({ title, subtitle, viewAll, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-[1400px] mx-auto px-4 md:px-8 mt-14 md:mt-20"
    >
      <div className="flex items-end justify-between gap-4 mb-5 md:mb-7">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-white/45 mt-1">{subtitle}</p>}
        </div>
        {viewAll && (
          <Link to={viewAll} className="text-sm text-white/60 hover:text-white flex items-center gap-1 shrink-0 group">
            View all <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}