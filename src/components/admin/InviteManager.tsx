'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invite {
  code: string;
  is_used: boolean;
  created_at: string;
}

export function InviteManager() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = async () => {
    const res = await fetch('/api/v1/admin/invites');
    const data = await res.json();
    setInvites(data);
  };

  const generateInvite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/invites', {
        method: 'POST',
        body: JSON.stringify({ count: 1 }),
      });
      if (res.ok) {
        alert('Invite code generated');
        fetchInvites();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Beta Invites</CardTitle>
        <Button onClick={generateInvite} disabled={loading}>
          {loading ? 'Generating...' : 'Generate New Code'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {invites.map((invite) => (
            <div key={invite.code} className="flex items-center justify-between p-2 border rounded bg-slate-900/50">
              <code className="text-lg font-mono text-yellow-400">{invite.code}</code>
              <Badge variant={invite.is_used ? 'secondary' : 'default'}>{invite.is_used ? 'USED' : 'AVAILABLE'}</Badge>
            </div>
          ))}
          {invites.length === 0 && <p className="text-muted-foreground">No invites generated yet.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
