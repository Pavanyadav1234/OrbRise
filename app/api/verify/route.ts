import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { world_id, wallet_address } = await req.json();

    // Skip junk entries
    if (!world_id || world_id === 'update' || world_id === 'unknown') {
      return NextResponse.json({ error: 'Invalid world_id' }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0];

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("world_id", world_id)
      .single();

    if (existing) {
      const lastActive = existing.last_active;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = existing.streak;
      if (lastActive === today) {
        // Already logged in today
      } else if (lastActive === yesterdayStr) {
        newStreak = existing.streak + 1;
      } else {
        newStreak = 1;
      }

      const { data: updated } = await supabase
        .from("users")
        .update({
          streak: newStreak,
          last_active: today,
          wallet_address: wallet_address || existing.wallet_address,
        })
        .eq("world_id", world_id)
        .select()
        .single();

      return NextResponse.json({ user: updated });
    } else {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          world_id,
          wallet_address,
          streak: 1,
          xp: 0,
          last_active: today,
        })
        .select()
        .single();

      return NextResponse.json({ user: newUser });
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}