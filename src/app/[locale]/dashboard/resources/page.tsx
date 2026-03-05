'use client';

import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  FileText,
  Gem,
  HelpCircle,
  Lock,
  MessageCircle,
  Search,
  Unlock,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGamification } from '@/hooks/useGamification';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

export default function ResourcesPage() {
  const t = useTranslations('Resources');
  const [searchQuery, setSearchQuery] = useState('');

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { available } = useWallet();
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const { awardXP } = useGamification();
  const { tier } = useUserTier();
  const router = useRouter();

  const handleUnlock = (id: string, price: number, title: string) => {
    if (unlockedItems.includes(id)) return;

    // Whale Perk: Free Access
    const finalPrice = tier === 'SOVEREIGN' ? 0 : price;

    if (available < finalPrice) {
      toast.error('Insufficient Funds', {
        description: `Required: $${finalPrice} | Available: $${available.toFixed(2)}`,
      });
      return;
    }

    // Simulate purchase
    toast.success('Purchase Successful', {
      description: `Unlocked: ${title} ${finalPrice > 0 ? `(-$${finalPrice})` : '(Free for Whale)'}`,
      action: {
        label: 'View Marketplace',
        onClick: () => router.push('/en/dashboard/marketplace'),
      },
    });
    setUnlockedItems((prev) => [...prev, id]);
    awardXP(50, `Unlocked ${title}`);
  };

  const categories = [
    {
      id: 'getting-started',
      title: t('categories.gettingStarted'),
      icon: BookOpen,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      items: [
        { title: t('items.platform_overview'), link: '#' },
        { title: t('items.account_setup'), link: '#' },
        { title: t('items.security_best_practices'), link: '#' },
      ],
    },
    {
      id: 'trading-guides',
      title: t('categories.tradingGuides'),
      icon: FileText,
      color: 'text-[#00FF94]',
      bgColor: 'bg-[#00FF94]/10',
      borderColor: 'border-[#00FF94]/20',
      items: [
        { title: t('items.understanding_rebates'), link: '#' },
        { title: t('items.risk_management_101'), link: '#' },
        { title: t('items.wolf_pack_strategies'), link: '#' },
      ],
    },
    {
      id: 'api-docs',
      title: t('categories.apiDocs'),
      icon: Code,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      items: [
        { title: t('items.api_reference'), link: '#' },
        { title: t('items.websocket_streams'), link: '#' },
        { title: t('items.rate_limits'), link: '#' },
      ],
    },
    {
      id: 'community',
      title: t('categories.community'),
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10',
      borderColor: 'border-orange-400/20',
      items: [
        { title: t('items.discord_server'), link: '#' },
        { title: t('items.telegram_group'), link: '#' },
        { title: t('items.feature_requests'), link: '#' },
      ],
    },
  ];

  const faqs = [
    {
      id: 'billing',
      question: t('faq.q1'),
      answer: t('faq.a1'),
    },
    {
      id: 'security',
      question: t('faq.q2'),
      answer: t('faq.a2'),
    },
    {
      id: 'tiers',
      question: t('faq.q3'),
      answer: t('faq.a3'),
    },
  ];

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="relative min-h-full bg-[#030303] text-white font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-[#00FF94]/5 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 p-8 relative">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {t('title')}
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">{t('subtitle')}</p>

            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00FF94]/50 focus:ring-1 focus:ring-[#00FF94]/50 transition-all"
              />
            </div>
          </div>

          {/* Premium Intelligence Section - WOW Factor */}
          <div className="glass-card rounded-xl p-8 border border-[#00FF94]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Gem className="w-32 h-32 text-[#00FF94]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Gem className="text-[#00FF94]" /> Premium Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'rep-001',
                    title: 'Whale Watch Weekly',
                    price: 50,
                    desc: 'Deep dive into wallet movements >$1M.',
                  },
                  { id: 'rep-002', title: 'Insider Protocol', price: 150, desc: 'Advanced MEV strategies & alpha.' },
                  { id: 'rep-003', title: 'Q4 Market Outlook', price: 25, desc: 'Institutional grade forecast.' },
                  {
                    id: 'rep-004',
                    title: 'Algo Studio Masterclass',
                    price: 99,
                    desc: '5 Verified Strategies: Scalping, Arb, Grid & DCA.',
                  },
                ].map((item) => (
                  <div key={item.id} className="bg-black/40 border border-white/10 rounded-xl p-5 flex flex-col">
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-zinc-400 mb-4 flex-1">{item.desc}</p>
                    <button
                      onClick={() => handleUnlock(item.id, item.price, item.title)}
                      disabled={unlockedItems.includes(item.id)}
                      className={cn(
                        'w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all',
                        unlockedItems.includes(item.id)
                          ? 'bg-white/5 text-zinc-500 cursor-default'
                          : 'bg-[#00FF94] text-black hover:bg-[#00FF94]/90',
                      )}
                    >
                      {unlockedItems.includes(item.id) ? (
                        <>
                          <Unlock className="w-4 h-4" /> Unlocked
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Unlock ${tier === 'SOVEREIGN' ? '0 (VIP)' : item.price}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="glass-card rounded-xl p-6 hover:bg-white/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn('p-3 rounded-lg border', category.bgColor, category.borderColor)}>
                    <category.icon className={cn('h-6 w-6', category.color)} />
                  </div>
                  <h2 className="text-lg font-bold group-hover:text-[#00FF94] transition-colors">{category.title}</h2>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item, idx) => (
                    <li key={idx}>
                      <a
                        href={item.link}
                        className="flex items-center justify-between text-zinc-400 hover:text-white transition-colors group/link"
                      >
                        <span>{item.title}</span>
                        <ExternalLink className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="glass-card rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <HelpCircle className="h-6 w-6 text-[#00FF94]" />
              <h2 className="text-2xl font-bold">{t('faq.title')}</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="p-4 bg-black/20 text-zinc-400 border-t border-white/10">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support CTA */}
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold mb-2">{t('support.title')}</h3>
            <p className="text-zinc-400 mb-6">{t('support.subtitle')}</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF94] text-black font-bold rounded-lg hover:bg-[#00FF94]/90 transition-colors">
              <MessageCircle className="h-5 w-5" />
              {t('support.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
