# Vercel Environment Variables to Add

Go to: https://vercel.com → lugha-pro project → Settings → Environment Variables

Add ALL of these:
- NEXT_PUBLIC_SUPABASE_URL = (from your Supabase project settings)
- NEXT_PUBLIC_SUPABASE_ANON_KEY = (from your Supabase project settings)  
- SUPABASE_SERVICE_ROLE_KEY = (from your Supabase project settings)
- NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = (from cloud.walletconnect.com)
- NEXT_PUBLIC_CELO_RPC_URL = https://forno.celo.org
- NEXT_PUBLIC_MINIPAY_ENABLED = true
- NEXTAUTH_SECRET = (any long random string)
- NEXTAUTH_URL = https://lugha-pro.vercel.app

After adding all vars, go to Deployments tab and click "Redeploy"
