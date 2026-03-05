# Phase 3: Notification Provider Architecture

## Context Links

- [Uptime-Kuma Notification System](research/researcher-01-architecture-patterns.md#3-notificationplugin-system)
- [90+ Channels Pattern](research/researcher-02-features-ux.md#3-notificationalert-architecture)
- Existing: `src/lib/notification-service.ts` (DB-only, no external channels)
- Existing: `src/lib/notifications.ts` (duplicate, basic DB insert + static alert logger)

## Overview

- **Priority:** P1
- **Status:** pending
- **Effort:** 3h

Adapt uptime-kuma's Provider+Factory pattern: one class per notification channel, registered at startup, dispatched by name. Replace current DB-only notification system with multi-channel routing. Start with 3 providers (Telegram, Discord webhook, generic webhook) -- pattern makes adding more trivial.

## Key Insights from Uptime-Kuma

- **Base class:** `NotificationProvider` with `send(notification, msg, monitorJSON, heartbeatJSON)`
- **Registration:** `Notification.init()` at startup validates each provider (unique name + send method)
- **Flat file structure:** `server/notification-providers/*.js` -- one file = one channel
- **Notification groups:** One alert → fan-out to multiple providers simultaneously
- **`important` flag:** Only fires on state transitions (UP→DOWN, DOWN→UP)
- **Resend interval:** Configurable repeat of unresolved alerts (e.g., every 5 min while DOWN)
- **Liquid templates:** Optional custom message templates per provider

## Requirements

### Functional
- Base `NotificationProvider` abstract class with `send()` interface
- Provider registry: auto-discover providers at startup, index by name
- 3 initial providers: Telegram bot, Discord webhook, generic HTTP webhook
- Notification groups: user configures which providers receive which alert types
- Alert on state transitions only (`important=true` from Phase 1 heartbeats)
- Resend interval: re-alert every N minutes while agent remains DOWN
- Recovery notification: alert when agent transitions DOWN→UP

### Non-Functional
- Adding new provider = one file + export -- zero config changes elsewhere
- Provider failures don't cascade -- catch per-provider, log error, continue fan-out
- Send operations are async fire-and-forget (don't block heartbeat pipeline)

## Architecture

```
Heartbeat (important=true)
  │
  ▼
┌────────────────────────┐
│ NotificationDispatcher │  Reads notification_groups config
│   (orchestrator)       │  Resolves which providers to call
└────────┬───────────────┘
         │ fan-out
         ├──► TelegramProvider.send()
         ├──► DiscordProvider.send()
         └──► WebhookProvider.send()

Provider Registry (startup):
  notification-providers/
    ├── telegram-notification-provider.ts
    ├── discord-notification-provider.ts
    └── webhook-notification-provider.ts

  registry.init() → scan dir → validate → index by name
```

### Data Model

```sql
-- notification_channels: user-configured provider instances
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    provider_name VARCHAR(50) NOT NULL,  -- 'telegram' | 'discord' | 'webhook'
    config JSONB NOT NULL,               -- provider-specific: { bot_token, chat_id } or { webhook_url }
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_groups: which channels receive which alert types
CREATE TABLE notification_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    alert_types TEXT[] NOT NULL,         -- ['agent_down', 'agent_up', 'risk_alert']
    channel_ids UUID[] NOT NULL,         -- references notification_channels
    resend_interval_minutes INT DEFAULT 0, -- 0 = no resend
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Related Code Files

### Create
- `src/lib/notifications/notification-provider-base.ts` -- abstract base class
- `src/lib/notifications/notification-provider-registry.ts` -- auto-discover + register providers
- `src/lib/notifications/notification-dispatcher.ts` -- fan-out orchestrator
- `src/lib/notifications/providers/telegram-notification-provider.ts` -- Telegram Bot API
- `src/lib/notifications/providers/discord-notification-provider.ts` -- Discord webhook
- `src/lib/notifications/providers/webhook-notification-provider.ts` -- generic HTTP POST
- `src/lib/notifications/types.ts` -- NotificationPayload, ProviderConfig, AlertType interfaces
- `src/database/migrations/add-notification-channels-and-groups.sql` -- migration
- `src/app/api/v1/admin/notifications/channels/route.ts` -- CRUD notification channels
- `src/app/api/v1/admin/notifications/groups/route.ts` -- CRUD notification groups
- `src/app/api/v1/admin/notifications/test/route.ts` -- send test notification

### Modify
- `src/lib/notification-service.ts` -- wire dispatcher into existing service
- `src/app/api/cron/heartbeat-check/route.ts` (Phase 1) -- trigger dispatcher on important transitions

### Delete (consolidate)
- `src/lib/notifications.ts` -- merge into notification-service.ts (eliminate duplication)

## Implementation Steps

1. **Create types.ts** -- define `AlertType`, `NotificationPayload` (alert_type, title, message, severity, agent_id, metadata), `ProviderConfig`
2. **Create notification-provider-base.ts** -- abstract class with: `abstract name: string`, `abstract send(payload: NotificationPayload): Promise<boolean>`, `formatMessage(payload): string` default implementation
3. **Create telegram provider** -- uses Telegram Bot API `sendMessage` via fetch; config: `{ bot_token, chat_id }`; formats as Markdown with status emoji
4. **Create discord provider** -- POST to Discord webhook URL with embed; config: `{ webhook_url }`; color-coded embed (red=down, green=up)
5. **Create webhook provider** -- generic HTTP POST with JSON body; config: `{ url, headers?, method? }`
6. **Create notification-provider-registry.ts** -- imports all providers, validates (unique name + send method), indexes by name; `getProvider(name): NotificationProvider`
7. **Create notification-dispatcher.ts** -- `dispatch(payload)`: query notification_groups matching alert_type → resolve channel_ids → get provider configs → fan-out `provider.send()` with per-provider try/catch
8. **Write migration** -- create notification_channels + notification_groups tables
9. **Create admin API endpoints** -- CRUD for channels and groups, test endpoint sends sample notification
10. **Wire dispatcher** -- integrate into heartbeat-check cron (Phase 1): on important=true transitions, call `dispatcher.dispatch({ alert_type: 'agent_down', ... })`
11. **Consolidate** -- merge `notifications.ts` into `notification-service.ts`, remove duplicate

## Todo List

- [ ] Create notification types.ts
- [ ] Implement notification-provider-base.ts
- [ ] Implement telegram-notification-provider.ts
- [ ] Implement discord-notification-provider.ts
- [ ] Implement webhook-notification-provider.ts
- [ ] Implement notification-provider-registry.ts
- [ ] Implement notification-dispatcher.ts
- [ ] Write migration SQL
- [ ] Create channels CRUD API
- [ ] Create groups CRUD API
- [ ] Create test notification endpoint
- [ ] Wire dispatcher into heartbeat-check cron
- [ ] Consolidate duplicate notification files
- [ ] Test full flow: heartbeat miss → dispatcher → Telegram message

## Success Criteria

- Adding new provider requires only 1 new file + export
- Telegram/Discord/Webhook providers successfully deliver test notifications
- Fan-out: single alert dispatches to all configured channels in group
- Provider failure doesn't block other providers in same group
- Resend interval correctly re-fires alerts for unresolved DOWN agents

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Telegram/Discord API rate limits | Medium | Queue with exponential backoff; batch alerts per 1-min window |
| Webhook target unreachable | Low | 3 retries with 5s delay; log failure; don't block other providers |
| Notification spam during cascading failures | High | Resend interval minimum 5 min; group aggregation (one alert per group, not per service) |

## Security Considerations

- Provider configs (bot tokens, webhook URLs) stored encrypted in JSONB -- use vault.ts encryption
- Admin-only endpoints for channel/group management -- require admin JWT
- Test endpoint rate-limited to 1 req/min to prevent abuse
- Webhook provider validates URL scheme (https only in production)

## Next Steps

- Phase 4 uses notification system for exchange health alerts + maintenance windows
- Future providers: Email (Resend), SMS (Twilio), PagerDuty -- same pattern
