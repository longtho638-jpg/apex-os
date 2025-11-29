-- Add constraints to prevent negative prices or excessive discounts
ALTER TABLE discount_codes
ADD CONSTRAINT check_discount_value_positive CHECK (discount_value > 0);

ALTER TABLE discount_codes
ADD CONSTRAINT check_discount_percentage_limit 
CHECK (
  (discount_type = 'percentage' AND discount_value <= 100) OR 
  (discount_type = 'fixed')
);
