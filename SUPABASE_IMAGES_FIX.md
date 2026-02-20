# Fix Supabase Images Not Displaying in Production

## Problem
Images from Supabase Storage work locally but don't display when deployed to Docker/VPS.

## Root Cause
**RLS (Row Level Security) policies** are not configured to allow public access to your storage buckets.

## Solution Steps

### 1. Make Buckets Public (Supabase Dashboard - UI Method)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/qjealtvlmkusxeuymdpx)
2. Click **Storage** in the left sidebar
3. For each bucket (`doctors`, `services`, etc.):
   - Click on the bucket name
   - Click the **Settings** icon (gear/cog)
   - Toggle **"Public bucket"** to **ON**
   - Click **Save**

### 2. Add RLS Policies (SQL Method - Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the content from `client/src/lib/supabase-storage-policies.sql`
3. Click **Run**
4. Verify the policies were created successfully

### 3. Verify Image URLs in Database

Your image URLs should be **full URLs**, not relative paths:

✅ **Correct:**
```
https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/avatar-123.jpg
```

❌ **Wrong:**
```
/avatar-123.jpg
avatar-123.jpg
doctors/avatar-123.jpg
```

### 4. Test Direct Access

Open an image URL directly in an **incognito/private browser window**:
```
https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/your-image.jpg
```

If you see the image → RLS is working ✅
If you see 403/404 → RLS policies need adjustment ❌

### 5. Update Images in Database (If Needed)

If your database has relative paths, update them to full URLs:

```sql
-- Update doctors table
UPDATE doctors 
SET avatar_url = 'https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/' || avatar_url
WHERE avatar_url NOT LIKE 'https://%';

-- Update services table
UPDATE services 
SET image_url = 'https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/services/' || image_url
WHERE image_url NOT LIKE 'https://%';
```

### 6. Clear Cache and Rebuild

On your VPS:

```bash
# Pull latest code
git pull origin main

# Rebuild Docker
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f web
```

### 7. Clear Browser Cache

- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open in incognito mode
- Or append `?v=2` to image URLs to bypass cache

## Troubleshooting Checklist

- [ ] Buckets are marked as **Public** in Supabase Storage settings
- [ ] RLS policies exist and allow SELECT for public role
- [ ] Image URLs in database are **full URLs** (not relative paths)
- [ ] Direct image URL works in incognito browser
- [ ] Environment variables are set in docker-compose.yml
- [ ] Docker container rebuilt after changes
- [ ] Browser cache cleared

## Quick Test Commands (Run on VPS)

```bash
# Test if Supabase is accessible
curl -I https://qjealtvlmkusxeuymdpx.supabase.co/storage/v1/object/public/doctors/

# Check environment variables
docker-compose exec web printenv | grep SUPABASE

# Check container logs for errors
docker-compose logs web | grep -i "error\|fail"
```

## Common Issues

### Issue: 403 Forbidden
**Solution:** Bucket RLS policies not set up correctly. Re-run the SQL policies.

### Issue: 404 Not Found
**Solution:** 
- Image doesn't exist in that path
- Bucket name is wrong
- File path in database is incorrect

### Issue: Images load slowly then appear
**Solution:** This is normal for first load. Next.js optimizes images which takes time.

### Issue: Some images work, others don't
**Solution:** Check if all buckets have public RLS policies, not just one.

## Need More Help?

1. Check Supabase logs: Dashboard → Logs → Storage logs
2. Check browser console: F12 → Network tab → Look for failed image requests
3. Verify exact error code (403, 404, 500, etc.)
