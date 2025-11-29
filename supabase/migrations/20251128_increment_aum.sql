-- Function to safely increment agent AUM
CREATE OR REPLACE FUNCTION increment_agent_aum(p_agent_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_agents
  SET total_aum = total_aum + p_amount
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;
