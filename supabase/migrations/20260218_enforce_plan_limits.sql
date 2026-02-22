-- Create function to check plan limits
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  client_plan text;
  current_profile_count int;
  max_profiles int;
BEGIN
  -- Get client plan
  SELECT plan INTO client_plan
  FROM clients
  WHERE id = NEW.client_id;

  -- If no client found, allow
  IF client_plan IS NULL THEN
    RETURN NEW;
  END IF;

  -- ENFORCE MAX PROFILES (On INSERT only)
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO current_profile_count FROM profiles WHERE client_id = NEW.client_id;
    
    -- Define limits based on plan (Sync with plansConfig.ts)
    IF client_plan = 'starter' THEN max_profiles := 1;
    ELSIF client_plan = 'pro' THEN max_profiles := 2;
    ELSIF client_plan = 'business' THEN max_profiles := 8;
    ELSIF client_plan = 'enterprise' THEN max_profiles := 15;
    ELSE max_profiles := 1; -- Fallback
    END IF;

    IF current_profile_count >= max_profiles THEN
       RAISE EXCEPTION 'Plan limit exceeded: You have reached the maximum number of profiles for your % plan.', client_plan;
    END IF;
  END IF;


  -- ENTERPRISE: No feature limits
  IF client_plan = 'enterprise' THEN
    RETURN NEW;
  END IF;

  -- BUSINESS: 
  -- Allowed: Scheduling, NPS, Pix, Catalog, Portfolio, Videos, Lead Capture
  -- Restricted: CRM (Management interface only, so DB doesn't block), White Label? (Allowed)
  IF client_plan = 'business' THEN
     -- Business has access to almost everything except full CRM *management* which is UI side.
     -- Lead Capture (form) IS allowed.
     RETURN NEW;
  END IF;

  -- PRO:
  -- Restricted: Scheduling
  IF client_plan = 'pro' THEN
     -- Check Scheduling
     IF NEW.enable_scheduling = true AND (OLD.enable_scheduling IS DISTINCT FROM true) THEN
        RAISE EXCEPTION 'Plan limit exceeded: Scheduling requires Business plan.';
     END IF;
     RETURN NEW;
  END IF;

  -- STARTER:
  -- Restricted: Everything Pro/Business has
  IF client_plan = 'starter' THEN
     -- Check Scheduling
     IF NEW.enable_scheduling = true AND (OLD.enable_scheduling IS DISTINCT FROM true) THEN
        RAISE EXCEPTION 'Plan limit exceeded: Scheduling requires Business plan.';
     END IF;
     -- Check Lead Capture (CRM Form) - Starter actually allows nothing? plansConfig says false.
     IF NEW.enable_lead_capture = true AND (OLD.enable_lead_capture IS DISTINCT FROM true) THEN
        RAISE EXCEPTION 'Plan limit exceeded: Lead Capture requires Pro plan.';
     END IF;
     -- Check Pix
     IF NEW.pix_key IS NOT NULL AND NEW.pix_key <> '' AND (OLD.pix_key IS DISTINCT FROM NEW.pix_key) THEN
        RAISE EXCEPTION 'Plan limit exceeded: Pix Key requires Pro plan.';
     END IF;
     -- Check NPS
     IF NEW.enable_nps = true AND (OLD.enable_nps IS DISTINCT FROM true) THEN
        RAISE EXCEPTION 'Plan limit exceeded: NPS requires Pro plan.';
     END IF;
     -- Check Branding Removal
     IF NEW.hide_branding = true AND (OLD.hide_branding IS DISTINCT FROM true) THEN
        RAISE EXCEPTION 'Plan limit exceeded: White Label (Hide Branding) requires Pro plan.';
     END IF;
     
     RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger (Before Update/Insert)
DROP TRIGGER IF EXISTS enforce_plan_limits_trigger ON profiles;

CREATE TRIGGER enforce_plan_limits_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_limits();
