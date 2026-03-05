import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notifications';

describe('NotificationService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs info alerts to console.log', async () => {
    await NotificationService.sendAlert({
      title: 'Test Info',
      message: 'This is a test info message',
      level: 'info',
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('info'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test Info'));
  });

  it('logs warning alerts to console.warn', async () => {
    await NotificationService.sendAlert({
      title: 'Test Warning',
      message: 'This is a test warning',
      level: 'warning',
    });

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('warn'));
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Test Warning'));
  });

  it('logs error alerts to console.error', async () => {
    await NotificationService.sendAlert({
      title: 'Test Error',
      message: 'This is a test error',
      level: 'error',
    });

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Test Error'));
  });

  it('logs critical alerts to console.error', async () => {
    await NotificationService.sendAlert({
      title: 'Test Critical',
      message: 'This is a critical alert',
      level: 'critical',
    });

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Test Critical'));
  });

  it('includes metadata in the log output', async () => {
    const metadata = { userId: '123', action: 'login' };
    await NotificationService.sendAlert({
      title: 'Metadata Test',
      message: 'Testing metadata',
      level: 'info',
      metadata,
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('123'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('login'));
  });
});
