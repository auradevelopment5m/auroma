-- Support Chat (Tickets + Messages + Attachments)
-- Run after 001_create_tables.sql and 002_rls_policies.sql

-- Helper used by policies (re-created here for safety)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  subject TEXT DEFAULT 'Support',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  label TEXT NOT NULL DEFAULT 'general',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message_at ON support_tickets(last_message_at DESC);

-- Messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'admin')),
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_created ON support_messages(ticket_id, created_at);

-- Attachments
CREATE TABLE IF NOT EXISTS support_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES support_messages(id) ON DELETE CASCADE,
  storage_bucket TEXT NOT NULL DEFAULT 'support-uploads',
  storage_path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket ON support_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_message ON support_attachments(message_id);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_attachments ENABLE ROW LEVEL SECURITY;

-- Ticket policies
DROP POLICY IF EXISTS "Users can view own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage support tickets" ON support_tickets;

CREATE POLICY "Users can view own support tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create support tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage support tickets" ON support_tickets
  FOR ALL USING (public.is_admin());

-- Message policies
DROP POLICY IF EXISTS "Users can view ticket messages" ON support_messages;
DROP POLICY IF EXISTS "Users can create ticket messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can manage ticket messages" ON support_messages;

CREATE POLICY "Users can view ticket messages" ON support_messages
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket messages" ON support_messages
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ticket messages" ON support_messages
  FOR ALL USING (public.is_admin());

-- Attachment policies
DROP POLICY IF EXISTS "Users can view ticket attachments" ON support_attachments;
DROP POLICY IF EXISTS "Users can create ticket attachments" ON support_attachments;
DROP POLICY IF EXISTS "Admins can manage ticket attachments" ON support_attachments;

CREATE POLICY "Users can view ticket attachments" ON support_attachments
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_attachments.ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ticket attachments" ON support_attachments
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = support_attachments.ticket_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ticket attachments" ON support_attachments
  FOR ALL USING (public.is_admin());

-- Storage bucket (public CDN URLs)
-- NOTE: Requires "storage" schema (Supabase).
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('support-uploads', 'support-uploads', true)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN undefined_table OR insufficient_privilege THEN
    RAISE NOTICE 'Skipping bucket creation (storage.buckets not accessible in this session). Create bucket support-uploads in the Supabase Storage UI.';
END $$;

-- Storage policies for bucket objects
-- Hosted Supabase sometimes prevents ALTER/DROP on storage.objects depending on role.
-- This block tries to create the policies and skips cleanly if not permitted.
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Support uploads readable" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Support uploads insertable" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Support uploads deletable by admin" ON storage.objects';

  -- Path convention: support/{ticket_id}/{message_id}/{filename}
  EXECUTE $pol$
    CREATE POLICY "Support uploads readable" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'support-uploads'
        AND (
          public.is_admin()
          OR EXISTS (
            SELECT 1
            FROM support_tickets t
            WHERE t.id = (split_part(name, '/', 2))::uuid
              AND t.user_id = auth.uid()
          )
        )
      )
  $pol$;

  EXECUTE $pol$
    CREATE POLICY "Support uploads insertable" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'support-uploads'
        AND (
          public.is_admin()
          OR EXISTS (
            SELECT 1
            FROM support_tickets t
            WHERE t.id = (split_part(name, '/', 2))::uuid
              AND t.user_id = auth.uid()
          )
        )
      )
  $pol$;

  EXECUTE $pol$
    CREATE POLICY "Support uploads deletable by admin" ON storage.objects
      FOR DELETE USING (bucket_id = 'support-uploads' AND public.is_admin())
  $pol$;
EXCEPTION
  WHEN undefined_table OR insufficient_privilege THEN
    RAISE NOTICE 'Skipping storage.objects policies (not permitted). Add equivalent policies in Supabase Dashboard → Storage → Policies for bucket support-uploads.';
END $$;
