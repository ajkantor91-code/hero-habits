"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) alert(error.message);
    else alert("Check your email for the sign-in link.");
  }

  if (!ready) return <div className="p-6">Loading…</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-black/20 bg-amber-50 shadow-sm p-5">
          <div className="text-xl font-semibold">Sign in</div>
          <div className="text-sm opacity-80 mt-1">Magic link to play on any device.</div>

          <input
            className="mt-4 w-full rounded-xl border border-black/20 bg-white p-3"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
          />
          <button className="mt-3 w-full rounded-xl bg-black text-white p-3" onClick={sendMagicLink}>
            Send magic link
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
