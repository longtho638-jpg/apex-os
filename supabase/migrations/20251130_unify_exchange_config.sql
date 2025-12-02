-- 20251130_unify_exchange_config.sql
-- Hợp nhất cấu hình sàn vào bảng exchange_configs

ALTER TABLE exchange_configs 
ADD COLUMN IF NOT EXISTS partner_uuid VARCHAR(255);

-- Cập nhật dữ liệu mẫu
UPDATE exchange_configs SET partner_uuid = 'LIMITLESS_BINANCE_ID' WHERE exchange_name = 'Binance';
UPDATE exchange_configs SET partner_uuid = 'LIMITLESS_OKX_ID' WHERE exchange_name = 'OKX';
UPDATE exchange_configs SET partner_uuid = 'LIMITLESS_BYBIT_ID' WHERE exchange_name = 'Bybit';
