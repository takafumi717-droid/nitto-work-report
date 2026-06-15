import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * anonキー（公開キー）を使ったクライアント。
 * RLSポリシーで許可された範囲のみアクセス可能。
 * 一般社員向け画面（氏名選択・日報入力）で使用する。
 */
export function createSupabaseAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}
