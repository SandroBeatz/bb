-- Function to recalculate master rating after review insert or delete
CREATE OR REPLACE FUNCTION update_master_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_master_id uuid;
BEGIN
  v_master_id := COALESCE(NEW.master_id, OLD.master_id);

  UPDATE master_profiles
  SET rating = COALESCE(
    (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE master_id = v_master_id),
    0
  )
  WHERE id = v_master_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: after INSERT on reviews
DROP TRIGGER IF EXISTS reviews_after_insert ON reviews;
CREATE TRIGGER reviews_after_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_master_rating();

-- Trigger: after DELETE on reviews
DROP TRIGGER IF EXISTS reviews_after_delete ON reviews;
CREATE TRIGGER reviews_after_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_master_rating();
