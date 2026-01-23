C:\Users\P NITISH\On…\services\api.ts:92 
 
 POST http://localhost:3000/api/auth/sync 429 (Too Many Requests)

 Backend sync failed (running in offline/auth-only mode): Rate limit exceeded. Try again in 728 seconds.
syncWithBackend @ C:\Users\P NITISH\OneDrive\Desktop\aariv\context\AuthContext.tsx:74
await in syncWithBackend
(anonymous) @ C:\Users\P NITISH\OneDrive\Desktop\aariv\context\AuthContext.tsx:50
(anonymous) @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\GoTrueClient.js:2008
_notifyAllSubscribers @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\GoTrueClient.js:2006
_recoverAndRefresh @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\GoTrueClient.js:1944
await in _recoverAndRefresh
(anonymous) @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\GoTrueClient.js:2286
(anonymous) @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\GoTrueClient.js:1123
(anonymous) @ C:\Users\P NITISH\OneDrive\Desktop\aariv\node_modules\@supabase\auth-js\dist\module\lib\locks.js:126
C:\Users\P NITISH\OneDrive\Desktop\aariv\services\api.ts:92   POST http://localhost:3000/api/auth/sync 429 (Too Many Requests)