'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';

export function SiteHeader() {
    const router = useRouter();
    const t = useTranslations('Homepage');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigation = [
        { name: t('nav.features'), href: '/#features' }, // Absolute path to homepage features
        { name: t('nav.how_it_works'), href: '/#how-it-works' },
        { name: t('nav.pricing'), href: '/payment' },
        { name: t('nav.resources'), href: '/resources' },
    ];

    return (
        <>
            <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#030303]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-6'}`}>
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
                            <div className="relative h-10 w-10">
                                <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                                <div className="relative h-full w-full bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl border border-white/10">
                                    <span className="text-white font-black text-lg">A</span>
                                </div>
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Apex<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">OS</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                                >
                                    {item.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all group-hover:w-full" />
                                </a>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                            >
                                {t('nav.signin')}
                            </button>
                            <Button3D onClick={() => router.push('/signup')} className="py-2.5 px-6 text-sm">
                                {t('nav.get_started')}
                            </Button3D>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white"
                        >
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                >
                    <div className="flex flex-col gap-6">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-2xl font-bold text-zinc-400 hover:text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </a>
                        ))}
                        <hr className="border-white/10" />
                        <button onClick={() => router.push('/login')} className="text-xl font-bold text-zinc-400 text-left">{t('nav.signin')}</button>
                        <button onClick={() => router.push('/signup')} className="text-xl font-bold text-emerald-400 text-left">{t('nav.get_started')}</button>
                    </div>
                </motion.div>
            )}
        </>
    );
}
