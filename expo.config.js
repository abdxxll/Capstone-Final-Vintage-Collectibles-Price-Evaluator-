import 'dotenv/config'

export default {
  expo: {
    name: 'plutus-ai',
    slug: 'plutus-ai',
    version: '1.0.0',
    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      ROBOFLOW_API_KEY: process.env.EXPO_PUBLIC_ROBOFLOW_API_KEY
    }
  }
}
