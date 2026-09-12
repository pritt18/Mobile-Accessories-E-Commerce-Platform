import React from 'react';
import { Link } from 'react-router-dom';

export const Logo = ({ size = 'md', showSubtitle = true, to = '/', variant = 'light' }) => {
  const isDark = variant === 'dark';

  const content = (
    <div className="flex items-center space-x-3 group">
      {/* Official Image Logo with Clean Refined Frame */}
      <div className="relative shrink-0">
        <div className={`absolute -inset-1 rounded-2xl blur-sm transition duration-300 ${
          isDark
            ? 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff] opacity-50 group-hover:opacity-100'
            : 'bg-gradient-to-r from-[#0072ff]/30 to-[#00c6ff]/30 opacity-0 group-hover:opacity-100'
        }`} />
        <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#06080e] overflow-hidden flex items-center justify-center p-0.5 shadow-md ${
          isDark ? 'border border-cyan-500/40 shadow-neon-blue' : 'border border-gray-200'
        }`}>
          <img
            src="/logo.jpg"
            alt="Mobixia Logo"
            className="w-full h-full object-cover object-center scale-110"
          />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`flex items-baseline font-black tracking-tight leading-none text-2xl sm:text-[26px] ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          <span>Mobi</span>
          <span className="text-[#0072ff]">x</span>
          <span>ia</span>
        </div>
        {showSubtitle && (
          <span className={`text-[9px] sm:text-[10px] tracking-[0.2em] font-bold uppercase mt-1 ${
            isDark ? 'text-cyan-400/90' : 'text-slate-500'
          }`}>
            Mobile Accessories Online
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  return content;
};
