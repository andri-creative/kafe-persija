-- Migrate category image paths to filename-only format
-- Change from '/images/category/filename.webp' or '/images/categories/filename.webp' to just 'filename.webp'
UPDATE product_category 
SET image = SUBSTRING(image, LENGTH(image) - CHARINDEX('/', REVERSE(image)) + 2)
WHERE image LIKE '/images/%';

-- Alternative simpler approach using REPLACE
UPDATE product_category
SET image = REPLACE(REPLACE(image, '/images/categories/', ''), '/images/category/', '')
WHERE image LIKE '/images/%';
