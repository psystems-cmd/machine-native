Machine Native - Vercel setup

1. Put this folder in a GitHub repo (or use the Vercel CLI: npx vercel).
2. In Vercel: Add New > Project > import the repo. No build settings needed (framework: Other).
3. Project Settings > Environment Variables, add:
   AIRTABLE_TOKEN    = your Airtable personal access token
   AIRTABLE_BASE_ID  = your base ID (starts with "app")
   AIRTABLE_TABLE    = your table name (e.g. Signups)
4. Redeploy. The table needs fields: Email (single line text), Source (single line text),
   Signed_up (single line text, or change the field name in api/signup.js).
