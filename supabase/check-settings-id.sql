-- Check what ID exists in settings table
SELECT id, gifts_deadline, extraction_available_date, draw_enabled
FROM settings
ORDER BY id;
