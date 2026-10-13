import React from 'react';
import { Github, ExternalLink, Coffee, History, Code2, X } from 'lucide-react';
import { CHANGELOG_VERSIONS } from '../../data/changelogData';

interface FooterProps {
  onOpenChangelog?: () => void;
  onOpenLicense?: () => void;
  onDismiss?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenChangelog, onOpenLicense, onDismiss }) => {
  const latestVersion = CHANGELOG_VERSIONS[0]?.version || 'v3.0.0';

  return (
    <footer className="w-full mt-10 sm:mt-14 mb-0 relative group">
      <div className="bg-[var(--bg-surface-card)] p-5 sm:p-7 rounded-3xl border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-2xs transition-all relative">
        {/* Small Red Cross Filled Button on Bottom Footer Showcase to Remove It */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Remove footer showcase"
            title="Remove footer showcase from home page"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#7F1D1D] hover:bg-[#991B1B] text-white flex items-center justify-center shadow-xs transition-all duration-200 active:scale-90 cursor-pointer z-10 border border-[#991B1B]"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-6 sm:pr-8 lg:pr-0">
          {/* Left Brand & Open Source Statement */}
          <div className="space-y-2 max-w-xl text-left">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-primary)] text-[var(--bg-primary)] flex items-center justify-center font-black text-xs shadow-xs">
                EP
              </div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--text-primary)]">
                EHSAAN PLAY
              </span>
              {onOpenLicense ? (
                <button
                  type="button"
                  onClick={onOpenLicense}
                  className="px-2.5 py-0.5 rounded-full bg-[var(--bg-card-olive)] hover:opacity-90 active:scale-95 text-[var(--text-card-olive)] text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs border border-[var(--border-subtle)] cursor-pointer transition"
                  title="View GNU GPL-3.0 License Terms"
                >
                  <Code2 className="w-3 h-3" />
                  <span>Open Source</span>
                </button>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-card-olive)] text-[var(--text-card-olive)] text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs border border-[var(--border-subtle)]">
                  <Code2 className="w-3 h-3" />
                  <span>Open Source</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              A personal cinema journal designed with extreme minimalism, local-first privacy, calm typography, and zero commercial noise.
            </p>
          </div>

          {/* Right Action Pills (Support, GitHub, Changelog) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* 1. Support Button with Coffee Cup Logo */}
            <a
              href="https://ehsaan.odoo.com/support"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent-primary)] hover:opacity-90 text-[var(--bg-primary)] text-xs font-bold transition shadow-xs active:scale-95 group"
              title="Support EHSAAN PLAY on Odoo"
            >
              <Coffee className="w-4 h-4 text-[var(--accent-secondary)] group-hover:rotate-12 transition-transform" />
              <span>Support Project</span>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* 2. GitHub Showcase Link */}
            <a
              href="https://github.com/ehsaanullah0/ehsaanplay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--bg-card-yellow)] hover:opacity-90 text-[var(--text-card-yellow)] text-xs font-bold transition shadow-xs active:scale-95 group border border-[var(--border-subtle)]"
              title="View GitHub Repository"
            >
              <Github className="w-4 h-4 text-[var(--text-card-yellow)] group-hover:scale-110 transition-transform" />
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* 3. Changelog Trigger Button */}
            {onOpenChangelog && (
              <button
                type="button"
                onClick={onOpenChangelog}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--bg-card-yellow)] hover:opacity-90 text-[var(--text-card-yellow)] text-xs font-black transition border border-[var(--border-subtle)] active:scale-95 group shadow-2xs"
                title="View Full Version Changelog in Settings"
              >
                <History className="w-4 h-4 text-[var(--text-card-yellow)] group-hover:rotate-12 transition-transform" />
                <span>Changelog {latestVersion}</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Divider & Meta Tagline */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2.5 font-medium">
            <span>Version {latestVersion}</span>
            <span aria-hidden="true">·</span>
            <span>Local-First PWA</span>
            <span aria-hidden="true">·</span>
            {onOpenLicense ? (
              <button
                type="button"
                onClick={onOpenLicense}
                className="hover:underline text-[var(--text-primary)] font-semibold transition active:scale-95 cursor-pointer"
                title="View GNU GPL-3 License Terms"
              >
                GPL-3 License
              </button>
            ) : (
              <a
                href="https://github.com/ehsaanullah0/ehsaanplay/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-[var(--text-primary)]"
              >
                GPL-3 License
              </a>
            )}
          </div>

          <div className="text-[11px] opacity-80">
            Crafted for cinephiles · Fully Offline Capable · No Ads
          </div>
        </div>
      </div>
    </footer>
  );
};
