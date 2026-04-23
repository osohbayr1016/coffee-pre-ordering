-- Seed a Shop Owner User
-- password is 'password123', hashed simplistically or we just skip hashing for local dev to make it easy.
-- Since this is an MVP, we'll store a plain-text password for the test seed and use it directly, 
-- or use a simple hash. Let's just use plain 'password123' for local testing to avoid setting up bcrypt in workers right now.
INSERT INTO users (id, phone, email, role, password_hash, display_name)
VALUES ('user-shop-owner', '99999999', 'owner@gobicoffee.mn', 'shop_owner', 'password123', 'Gobi Admin');

-- Seed the Coffee Shop
INSERT INTO coffee_shops (id, owner_id, name, slug, address, is_open)
VALUES ('shop-1', 'user-shop-owner', 'Gobi Coffee', 'gobi-coffee', 'Seoul Street 12, Ulaanbaatar', 1);

-- Seed some Menu Items
INSERT INTO menu_items (id, shop_id, name, category, price, temp_options, is_available)
VALUES 
('item-1', 'shop-1', 'Americano', 'coffee', 5000, 'both', 1),
('item-2', 'shop-1', 'Latte', 'coffee', 6500, 'both', 1),
('item-3', 'shop-1', 'Matcha', 'tea', 7000, 'cold', 1);
