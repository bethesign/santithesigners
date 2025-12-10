# Testing the Secret Santa Application

## Important: Avoiding Email Bounce Issues

This application uses Supabase Auth for user management. To prevent email bounce issues that could restrict your Supabase project's email privileges:

**⚠️ DO NOT use fake or non-existent email addresses for testing**

## Local Development Testing

### Testing the Signup Flow

When testing the FirstAccess/signup functionality:

1. **Use your own valid email address** (e.g., your Gmail, work email, etc.)
2. **Email confirmation is DISABLED** - accounts are created and activated immediately
3. **No confirmation email will be sent** - you can login right away after setting password

### Example Test Flow

```
1. Add your email to seed.sql:
   INSERT INTO users (email, full_name, city) VALUES
   ('your-real-email@gmail.com', 'Your Name', 'Milano');

2. Run the seed script in Supabase Dashboard

3. Visit /login and enter your email

4. You'll be redirected to /first-access

5. Set your password and complete signup

6. Login immediately - no email confirmation needed
```

## Adding Test Users

If you need multiple test users in the database:

### Option 1: Use Real Email Addresses (Recommended)

```sql
-- In supabase/seed.sql
INSERT INTO users (email, full_name, city) VALUES
('teammate1@company.com', 'Team Member 1', 'Milano'),
('teammate2@company.com', 'Team Member 2', 'Roma'),
('your-personal@gmail.com', 'Your Test Account', 'Torino');
```

### Option 2: Use Plus Addressing (Gmail Trick)

If you have a Gmail account, you can create multiple test addresses:

```sql
INSERT INTO users (email, full_name, city) VALUES
('youremail+test1@gmail.com', 'Test User 1', 'Milano'),
('youremail+test2@gmail.com', 'Test User 2', 'Roma'),
('youremail+test3@gmail.com', 'Test User 3', 'Torino');
```

All emails will arrive in `youremail@gmail.com` inbox, but Supabase treats them as separate accounts.

## Supabase Configuration

### Current Email Settings

- **Email Confirmation**: DISABLED
- **Effect**: Users are activated immediately on signup
- **No confirmation emails sent**: Reduces bounce risk
- **Secure**: Users are still pre-authorized via the `users` table

### Why Email Confirmation is Disabled

1. **Prevents bounces**: No emails = no bounce rate issues
2. **Pre-authorized users**: Only people added to `users` table can signup
3. **Secret Santa context**: All participants are known in advance
4. **Simpler UX**: Users don't need to check email during signup

## Running the Cleanup Script

If you previously created test accounts with fake emails (e.g., `@thesigners.it`), run the cleanup script:

```sql
-- In Supabase Dashboard → SQL Editor
-- Run: supabase/cleanup-test-emails.sql
```

This will:
- Delete all `@thesigners.it` email accounts from `public.users`
- Delete matching accounts from `auth.users`
- Verify cleanup was successful

## Testing Different Flows

### Testing as Admin

```sql
INSERT INTO users (email, full_name, city, role) VALUES
('your-admin@gmail.com', 'Admin Test', 'Milano', 'admin');
```

### Testing Multiple Participants

1. Add 3-5 real email addresses (use plus addressing if needed)
2. Go through signup flow for each
3. Upload gifts as different users
4. Complete quiz as different users
5. Test extraction flow

### Testing Edge Cases

- **Unauthorized email**: Try logging in with email not in `users` table
  - Expected: "Email non autorizzata" error

- **Existing account**: Try signup with email that already has auth account
  - Expected: Redirected to login, password field shown

- **New user**: Enter email in `users` table but no auth account yet
  - Expected: Redirected to FirstAccess for password setup

## Development Best Practices

### ✅ DO

- Use real, valid email addresses for testing
- Use Gmail plus addressing for multiple test accounts
- Add emails to seed.sql before testing signup
- Document which test emails you're using
- Clean up test accounts when done

### ❌ DON'T

- Use fake domains like `@test.com`, `@example.com`
- Use made-up emails like `mario.rossi@fakeco.it`
- Create accounts without valid email addresses
- Leave test accounts with fake emails in production database

## Troubleshooting

### "Email non autorizzata" Error

**Cause**: Email not in `users` table
**Fix**: Add email to seed.sql and run the script in Supabase

### Can't Login After Signup

**Cause**: May need to clear browser cache/cookies
**Fix**:
1. Clear browser data for localhost:5173
2. Try incognito/private window
3. Check Supabase Dashboard → Authentication → Users to verify account exists

### Supabase Email Warning

**Cause**: Too many emails sent to invalid addresses
**Fix**:
1. Run cleanup script to remove fake accounts
2. Verify email confirmation is disabled
3. Only use real emails going forward

## Questions?

If you encounter issues with testing or email configuration, check:

1. **Supabase Dashboard** → Authentication → Email Provider settings
2. **Browser Console** for error messages during signup
3. **Supabase Logs** in Dashboard for detailed error info

## Production Deployment

Before deploying to production:

1. ✅ Replace all test emails in seed.sql with real team members
2. ✅ Run cleanup script to remove any test accounts
3. ✅ Verify email confirmation setting (disabled is OK for Secret Santa)
4. ✅ Consider enabling custom SMTP provider for better deliverability (optional)
5. ✅ Test with at least 2-3 real team member emails

---

**Last Updated**: December 2024
**Supabase Project**: iqsghoezjqoqsnggtkgx
