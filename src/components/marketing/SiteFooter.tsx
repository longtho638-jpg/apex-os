'use client';

import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('Homepage');

  return (
    <footer className="border-t border-white/5 bg-[#050505] pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">A</span>
              </div>
              <span className="font-bold text-xl">ApexOS</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">{t('footer.company_desc')}</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors hover:text-emerald-400"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors hover:text-emerald-400"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors hover:text-emerald-400"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {[
            {
              title: t('footer.product'),
              links: [
                { name: t('nav.features'), href: '/#features' },
                { name: t('nav.pricing'), href: '/pricing' },
                { name: 'Demo', href: '/landing' },
                { name: 'Dashboard', href: '/dashboard/overview' },
              ],
            },
            {
              title: t('footer.resources'),
              links: [
                { name: 'Documentation', href: '/docs' },
                { name: 'API Reference', href: '/docs' }, // Point to docs for now
                { name: 'Status', href: '/status' },
                { name: 'Support', href: '/support' },
              ],
            },
            {
              title: t('footer.legal'),
              links: [
                { name: 'Terms', href: '/legal/terms' },
                { name: 'Privacy', href: '/legal/privacy' },
                { name: 'Security', href: '/legal/security' },
                { name: 'Cookies', href: '/legal/cookies' },
              ],
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-bold mb-6">{col.title}</h4>
              <ul className="space-y-4 text-sm text-zinc-400">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-emerald-400 transition-all" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <p>&copy; 2026 ApexOS. {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <a href="mailto:support@apexrebate.com" className="hover:text-white flex items-center gap-2">
              <Mail className="w-4 h-4" /> support@apexrebate.com
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/5 text-xs text-zinc-600 text-center leading-relaxed">
          {t('footer.risk_disclosure')}
        </div>
      </div>
    </footer>
  );
}
