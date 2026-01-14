-- Row Level Security Policies for Auroma

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Make this script re-runnable: drop policies if they already exist
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are manageable by admins" ON products;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are created on signup" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Order items can be created with orders" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

DROP POLICY IF EXISTS "Active creator codes are viewable" ON creator_codes;
DROP POLICY IF EXISTS "Admins can manage creator codes" ON creator_codes;

DROP POLICY IF EXISTS "Creator code usage viewable by admins" ON creator_code_usage;
DROP POLICY IF EXISTS "Creator code usage can be created" ON creator_code_usage;

DROP POLICY IF EXISTS "Anyone can subscribe" ON email_subscribers;
DROP POLICY IF EXISTS "Admins can view subscribers" ON email_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON email_subscribers;

DROP POLICY IF EXISTS "Published posts are viewable" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;

DROP POLICY IF EXISTS "Users can view own points" ON points_transactions;
DROP POLICY IF EXISTS "Points can be created" ON points_transactions;

DROP POLICY IF EXISTS "Users can view own store credit" ON store_credit_transactions;
DROP POLICY IF EXISTS "Store credit can be created" ON store_credit_transactions;

-- Helper to avoid policy recursion when checking admin status
-- NOTE: This function must be owned by a role that can bypass RLS (e.g. postgres).
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

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are manageable by admins" ON categories FOR ALL USING (public.is_admin());

-- Products: Public read access
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are manageable by admins" ON products FOR ALL USING (public.is_admin());

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles are created on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());

-- Orders: Users can view their own orders, admins can view all
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (public.is_admin());

-- Order items: Same as orders
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Order items can be created with orders" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (public.is_admin());

-- Creator codes: Public read for active codes, admin manage
CREATE POLICY "Active creator codes are viewable" ON creator_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage creator codes" ON creator_codes FOR ALL USING (public.is_admin());

-- Creator code usage: Admin only
CREATE POLICY "Creator code usage viewable by admins" ON creator_code_usage FOR SELECT USING (public.is_admin());
CREATE POLICY "Creator code usage can be created" ON creator_code_usage FOR INSERT WITH CHECK (true);

-- Email subscribers: Admin only view, public insert
CREATE POLICY "Anyone can subscribe" ON email_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view subscribers" ON email_subscribers FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage subscribers" ON email_subscribers FOR ALL USING (public.is_admin());

-- Blog posts: Public read for published, admin manage
CREATE POLICY "Published posts are viewable" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage posts" ON blog_posts FOR ALL USING (public.is_admin());

-- Points transactions: Users can view their own
CREATE POLICY "Users can view own points" ON points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Points can be created" ON points_transactions FOR INSERT WITH CHECK (true);

-- Store credit transactions: Users can view their own
CREATE POLICY "Users can view own store credit" ON store_credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Store credit can be created" ON store_credit_transactions FOR INSERT WITH CHECK (true);
