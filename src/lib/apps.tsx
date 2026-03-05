import { BarChart3, Terminal, User } from 'lucide-react';
import { About } from '@/components/apps/about';
import { Dashboard } from '@/components/apps/dashboard';
import { TerminalApp } from '@/components/apps/terminal';

export const APPS = [
  {
    id: 'dashboard',
    title: 'Apex Trader',
    icon: <BarChart3 className="h-6 w-6" />,
    component: <Dashboard />,
  },
  {
    id: 'about',
    title: 'About Me',
    icon: <User className="h-6 w-6" />,
    component: <About />,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: <Terminal className="h-6 w-6" />,
    component: <TerminalApp />,
  },
];
