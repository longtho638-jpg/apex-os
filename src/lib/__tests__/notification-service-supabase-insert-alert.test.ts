import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
      update: mockUpdate.mockReturnValue({ eq: mockEq }),
    }),
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { logger } from '@/lib/logger';
import { NotificationService } from '../notifications';

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('warns when env vars are missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    new NotificationService();
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Missing Supabase'));
  });

  it('send() calls supabase insert with correct data', async () => {
    mockInsert.mockResolvedValue({ error: null });
    const svc = new NotificationService();
    await svc.send('user-1', 'Title', 'Msg', 'SUCCESS', { ref: 'abc' });
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Title',
      message: 'Msg',
      type: 'SUCCESS',
      metadata: { ref: 'abc' },
      read: false,
    });
  });

  it('send() catches and logs errors gracefully', async () => {
    mockInsert.mockResolvedValue({ error: new Error('DB failure') });
    const svc = new NotificationService();
    await expect(svc.send('user-2', 'T', 'M')).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });

  it('markAsRead() calls supabase update + eq with notification id', async () => {
    mockEq.mockResolvedValue({ error: null });
    const svc = new NotificationService();
    await svc.markAsRead('notif-99');
    expect(mockUpdate).toHaveBeenCalledWith({ read: true });
    expect(mockEq).toHaveBeenCalledWith('id', 'notif-99');
  });

  it('sendAlert() logs at info level', async () => {
    await NotificationService.sendAlert({ title: 'T', message: 'M', level: 'info' });
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('[ALERT] INFO'), undefined);
  });

  it('sendAlert() logs at warning level', async () => {
    await NotificationService.sendAlert({ title: 'T', message: 'M', level: 'warning' });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('sendAlert() logs at error level for error and critical', async () => {
    await NotificationService.sendAlert({ title: 'T', message: 'M', level: 'error' });
    await NotificationService.sendAlert({ title: 'T', message: 'M', level: 'critical' });
    expect(logger.error).toHaveBeenCalledTimes(2);
  });

  it('sendAlert() defaults to info for unknown level', async () => {
    await NotificationService.sendAlert({ title: 'T', message: 'M', level: 'unknown' });
    expect(logger.info).toHaveBeenCalled();
  });
});
