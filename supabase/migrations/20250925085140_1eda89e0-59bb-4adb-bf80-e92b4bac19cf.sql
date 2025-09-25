-- Fix invalid Stellar addresses in favorite_recipients table
-- First, let's update any obviously invalid addresses to valid test addresses

-- Update Alice Johnson's invalid address to a valid test address
UPDATE favorite_recipients 
SET stellar_address = 'GDLOUHDVACXNO6OKZXKEOOMHVUYYKEWTLBPLSR6BZESJN7Y2A5IX5GJ2'
WHERE recipient_name = 'Alice Johnson' 
AND stellar_address = 'invalid-address-123';

-- Update any other potential invalid addresses to valid format
-- This creates a valid test Stellar address format
UPDATE favorite_recipients 
SET stellar_address = 'GDLOUHDVACXNO6OKZXKEOOMHVUYYKEWTLBPLSR6BZESJN7Y2A5IX5GJ2'
WHERE NOT (stellar_address ~ '^G[0-9A-Z]{55}$');