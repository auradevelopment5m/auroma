-- Seed data for Auroma

-- Insert categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Home Diffusers', 'home-diffusers', 'Transform your living space with our premium home diffusers', '/placeholder.svg?height=400&width=400'),
('Car Diffusers', 'car-diffusers', 'Elevate your driving experience with portable car diffusers', '/placeholder.svg?height=400&width=400'),
('Essential Oils', 'essential-oils', 'Pure, therapeutic-grade essential oils for every mood', '/placeholder.svg?height=400&width=400');

-- Insert products
INSERT INTO products (name, slug, description, long_description, price, compare_at_price, category_id, image_url, images, features, in_stock, stock_quantity) VALUES
-- Home Diffusers
('Serenity Mist Pro', 'serenity-mist-pro', 'Premium ultrasonic diffuser with ambient lighting', 'The Serenity Mist Pro is our flagship home diffuser, featuring advanced ultrasonic technology that disperses essential oils into a fine, aromatic mist. With customizable LED lighting and whisper-quiet operation, it''s perfect for creating a tranquil atmosphere in any room. The large 500ml tank provides up to 12 hours of continuous operation.', 89.99, 119.99, (SELECT id FROM categories WHERE slug = 'home-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['500ml capacity', '12-hour runtime', '7 LED colors', 'Whisper-quiet', 'Auto shut-off', 'Timer settings'], true, 50),

('Zen Garden Diffuser', 'zen-garden-diffuser', 'Elegant ceramic diffuser with zen-inspired design', 'Inspired by Japanese zen gardens, this ceramic diffuser combines artistry with functionality. Its handcrafted design adds a touch of elegance to any space while providing powerful aromatherapy benefits. Features include multiple mist modes and a peaceful ambient glow.', 69.99, 89.99, (SELECT id FROM categories WHERE slug = 'home-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['300ml capacity', '8-hour runtime', 'Ceramic construction', '2 mist modes', 'Soft ambient light'], true, 35),

('Nordic Air Purifier Diffuser', 'nordic-air-purifier', 'Dual-function air purifier and diffuser combo', 'Experience clean, fragrant air with our Nordic Air Purifier Diffuser. This innovative device combines HEPA filtration with ultrasonic diffusion, purifying your air while releasing your favorite essential oil blends. Perfect for bedrooms and home offices.', 129.99, 159.99, (SELECT id FROM categories WHERE slug = 'home-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['HEPA filtration', '400ml capacity', '10-hour runtime', 'Air quality sensor', 'Smart timer', 'Sleep mode'], true, 25),

('Bamboo Essence Diffuser', 'bamboo-essence', 'Eco-friendly bamboo diffuser with natural aesthetics', 'Crafted from sustainable bamboo, this eco-conscious diffuser brings natural beauty to your aromatherapy routine. Its organic design complements any décor while delivering consistent, fine mist distribution for optimal scent coverage.', 54.99, NULL, (SELECT id FROM categories WHERE slug = 'home-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['Sustainable bamboo', '250ml capacity', '6-hour runtime', 'Natural finish', 'BPA-free'], true, 40),

-- Car Diffusers
('AutoScent Elite', 'autoscent-elite', 'Premium vent-clip car diffuser with USB charging', 'The AutoScent Elite attaches seamlessly to your car''s air vent, using your vehicle''s airflow to distribute refreshing scents throughout the cabin. With its sleek aluminum design and long-lasting oil pads, it''s the perfect companion for your daily commute.', 34.99, 44.99, (SELECT id FROM categories WHERE slug = 'car-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['Vent-clip design', 'Aluminum body', 'Includes 10 oil pads', 'Adjustable airflow', '360° rotation'], true, 100),

('RoadZen Mini Diffuser', 'roadzen-mini', 'Compact USB-powered car diffuser', 'The RoadZen Mini is a compact powerhouse that fits perfectly in your cup holder. Simply add water and your favorite essential oil, plug into your USB port, and enjoy hours of refreshing aromatherapy on the go.', 24.99, 29.99, (SELECT id FROM categories WHERE slug = 'car-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['USB powered', '50ml capacity', '4-hour runtime', 'Cup holder fit', 'Spill-resistant'], true, 75),

('LuxeDrive Aromatherapy', 'luxedrive-aromatherapy', 'Luxury leather-wrapped car diffuser', 'Elevate your driving experience with the LuxeDrive. Wrapped in premium leather with brushed metal accents, this sophisticated diffuser offers multiple scent intensity levels and complements luxury vehicle interiors perfectly.', 49.99, 64.99, (SELECT id FROM categories WHERE slug = 'car-diffusers'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['Genuine leather wrap', 'Brushed metal finish', '3 intensity levels', 'Magnetic mount', 'Includes 3 scent cartridges'], true, 30),

-- Essential Oils
('Lavender Dreams', 'lavender-dreams', 'Pure lavender essential oil for relaxation', 'Our Lavender Dreams essential oil is steam-distilled from premium French lavender flowers. Known for its calming properties, it''s perfect for promoting restful sleep and reducing stress. 100% pure, therapeutic-grade oil.', 18.99, NULL, (SELECT id FROM categories WHERE slug = 'essential-oils'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['100% pure lavender', '15ml bottle', 'Steam distilled', 'Therapeutic grade', 'Promotes relaxation'], true, 200),

('Citrus Burst Blend', 'citrus-burst-blend', 'Energizing blend of orange, lemon, and grapefruit', 'Wake up your senses with our Citrus Burst Blend. This invigorating combination of sweet orange, zesty lemon, and refreshing grapefruit oils creates an uplifting atmosphere perfect for morning routines or afternoon pick-me-ups.', 21.99, 26.99, (SELECT id FROM categories WHERE slug = 'essential-oils'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['Citrus blend', '15ml bottle', 'Cold pressed', 'Energizing scent', 'Morning boost'], true, 150),

('Eucalyptus Refresh', 'eucalyptus-refresh', 'Pure eucalyptus oil for clarity and freshness', 'Breathe deeply with our Eucalyptus Refresh oil. Sourced from Australian eucalyptus trees, this invigorating oil helps clear the mind and refresh your space. Ideal for diffusing during cold seasons or workout sessions.', 16.99, NULL, (SELECT id FROM categories WHERE slug = 'essential-oils'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['100% pure eucalyptus', '15ml bottle', 'Australian sourced', 'Clears airways', 'Refreshing scent'], true, 180),

('Midnight Calm Collection', 'midnight-calm-collection', 'Relaxing blend set for evening unwinding', 'Our Midnight Calm Collection features three carefully crafted blends designed for evening relaxation: Sleepy Lavender, Chamomile Dreams, and Vanilla Twilight. Perfect gift set for anyone seeking better rest.', 45.99, 54.99, (SELECT id FROM categories WHERE slug = 'essential-oils'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['3-oil collection', '10ml each', 'Gift box included', 'Calming blends', 'Perfect for sleep'], true, 60),

('Peppermint Focus', 'peppermint-focus', 'Invigorating peppermint for mental clarity', 'Sharpen your focus with our pure Peppermint oil. This cooling, refreshing oil is perfect for study sessions, work-from-home days, or any time you need enhanced concentration. Also great for relieving tension.', 14.99, NULL, (SELECT id FROM categories WHERE slug = 'essential-oils'), '/placeholder.svg?height=600&width=600', ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], ARRAY['100% pure peppermint', '15ml bottle', 'Steam distilled', 'Enhances focus', 'Cooling sensation'], true, 160);

-- Insert sample creator codes
INSERT INTO creator_codes (code, creator_name, discount_percent, is_active) VALUES
('WELLNESS10', 'Wellness Influencer', 10, true),
('SCENT15', 'Scent Master', 15, true),
('AROMA20', 'Aroma Expert', 20, true);

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, image_url, published, published_at) VALUES
('The Art of Aromatherapy: A Beginner''s Guide', 'art-of-aromatherapy-beginners-guide', 'Discover the ancient practice of aromatherapy and how it can transform your daily wellness routine.', 'Aromatherapy has been practiced for thousands of years, harnessing the power of plant extracts to promote physical and emotional well-being. In this comprehensive guide, we''ll explore the basics of essential oils, how to choose the right diffuser for your space, and simple ways to incorporate aromatherapy into your daily routine.

## What is Aromatherapy?

Aromatherapy is the practice of using natural plant extracts, primarily essential oils, to promote health and well-being. These concentrated oils capture the plant''s scent and flavor, or "essence," and can be inhaled or applied to the skin.

## Choosing Your First Essential Oils

For beginners, we recommend starting with versatile oils like lavender, peppermint, and eucalyptus. These oils are gentle, widely loved, and offer a range of benefits from relaxation to mental clarity.

## Getting Started with Diffusers

Ultrasonic diffusers are perfect for beginners. They use water and ultrasonic waves to create a fine mist that disperses essential oils throughout your space. Start with 3-5 drops of oil and adjust based on your preference.', '/placeholder.svg?height=800&width=1200', true, NOW() - INTERVAL '5 days'),

('5 Essential Oils for Better Sleep', '5-essential-oils-better-sleep', 'Struggling with sleep? These five essential oils can help you achieve restful, rejuvenating nights.', 'Quality sleep is essential for overall health, yet many of us struggle to get enough rest. Essential oils offer a natural, gentle approach to improving sleep quality. Here are five oils that can transform your bedtime routine.

## 1. Lavender

The gold standard for sleep, lavender oil has been scientifically proven to promote relaxation and improve sleep quality. Diffuse 30 minutes before bedtime.

## 2. Chamomile

Known for its calming properties, chamomile creates a soothing atmosphere perfect for winding down after a long day.

## 3. Bergamot

Unlike other citrus oils that energize, bergamot has calming properties that can reduce anxiety and prepare your mind for rest.

## 4. Cedarwood

This warm, woodsy oil promotes the release of serotonin, which converts to melatonin in the brain.

## 5. Ylang Ylang

With its sweet, floral scent, ylang ylang helps reduce stress and lower blood pressure, setting the stage for peaceful sleep.', '/placeholder.svg?height=800&width=1200', true, NOW() - INTERVAL '3 days'),

('Transform Your Car Commute with Aromatherapy', 'transform-car-commute-aromatherapy', 'Turn stressful traffic into a spa-like experience with the right car diffuser and essential oil combinations.', 'Your daily commute doesn''t have to be stressful. With the right car diffuser and essential oil combinations, you can transform your vehicle into a mobile wellness sanctuary.

## Why Car Aromatherapy?

The average person spends over 200 hours per year commuting. That''s valuable time that can be used for self-care and stress management through aromatherapy.

## Best Oils for Driving

Choose oils that promote alertness without overstimulation. Peppermint and eucalyptus are excellent for maintaining focus, while citrus blends can boost your mood without causing drowsiness.

## Safety First

Always ensure your diffuser is securely mounted and never use oils that make you drowsy while driving. Start with lighter concentrations to avoid overwhelming scents in the enclosed space.', '/placeholder.svg?height=800&width=1200', true, NOW() - INTERVAL '1 day');
