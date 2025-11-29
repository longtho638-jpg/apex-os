import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturePlaceholderProps {
    title: string;
    description: string;
    phase: number;
    sunTzuQuote: {
        chinese: string;
        english: string;
        meaning: string;
    };
}

export function FeaturePlaceholder({ title, description, phase, sunTzuQuote }: FeaturePlaceholderProps) {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#030303]">
            <div className="max-w-2xl w-full">
                {/* Phase Badge */}
                <div className="flex justify-center mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/20 text-[#00FF94] font-mono text-sm">
                        PHASE {phase.toString().padStart(2, '0')} • COMING SOON
                    </div>
                </div>

                {/* Content Card */}
                <div className="relative group">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF94] to-[#06B6D4] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-8 md:p-12 text-center overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                        <h1 className="relative text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            {title}
                        </h1>

                        <p className="relative text-lg text-gray-400 mb-8 max-w-lg mx-auto">
                            {description}
                        </p>

                        {/* Sun Tzu Quote */}
                        <div className="relative mb-10 p-6 bg-white/5 rounded-lg border border-white/5 backdrop-blur-sm">
                            <div className="text-2xl font-serif text-yellow-500/80 mb-2">{sunTzuQuote.chinese}</div>
                            <div className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">{sunTzuQuote.english}</div>
                            <p className="text-sm text-gray-400 italic">"{sunTzuQuote.meaning}"</p>
                        </div>

                        {/* Action Button */}
                        <div className="relative flex justify-center">
                            <button className="group flex items-center gap-2 px-6 py-3 bg-[#00FF94] text-black font-bold rounded-lg hover:bg-[#00FF94]/90 transition-all transform hover:scale-105">
                                <Bell className="w-4 h-4" />
                                <span>Notify When Live</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
