import AdminExchangeManager from '@/components/admin/AdminExchangeManager';

export const metadata = {
  title: 'Exchange Configuration | Apex Admin',
  description: 'Manage IB Partner API Keys and Exchange Settings',
};

export default function ExchangeConfigPage() {
  return (
    <div className="p-6">
      <AdminExchangeManager />
    </div>
  );
}
