
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS leads_workspace_stage_idx
  ON public.leads (workspace_id, stage);

CREATE INDEX IF NOT EXISTS leads_workspace_owner_idx
  ON public.leads (workspace_id, owner_id);

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS lead_id UUID;

CREATE INDEX IF NOT EXISTS events_workspace_lead_idx
  ON public.events (workspace_id, lead_id, occurred_at DESC);

-- Trigger to keep last_activity_at fresh whenever a lead is updated.
CREATE OR REPLACE FUNCTION public.touch_lead_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_activity_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_touch_activity ON public.leads;
CREATE TRIGGER leads_touch_activity
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.touch_lead_activity();
