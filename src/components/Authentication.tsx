"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Authentication() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Attempt sign in using NextAuth Credentials provider. We use redirect:false
    // so we can surface errors and then manually navigate on success.
    (async () => {
      try {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        } as any);

        // Some next-auth builds return undefined when redirect:false isn't supported;
        // treat lack of an error redirect as success if we can fetch a session.
        if ((res as any)?.error) {
          // Show a simple alert for now; UI can be improved later.
          alert("Sign in failed: " + (res as any).error);
          return;
        }

        // Fetch server session to obtain the id saved by NextAuth callbacks.
        const sessRes = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (!sessRes.ok) {
          alert("Sign in succeeded but could not fetch session");
          router.push("/dashboard");
          return;
        }

        const sess = await sessRes.json();
        const sessionId = sess?.user?.id || sess?.id || sess?.sub || null;
        if (sessionId) {
          localStorage.setItem("easysched:sessionId", sessionId);
        } else {
          // If no id is present, still store an identifier fallback (email)
          if (sess?.user?.email) {
            localStorage.setItem("easysched:sessionId", sess.user.email);
          }
        }

        router.push("/dashboard");
      } catch (err: any) {
        console.error("Sign in failed", err);
        alert("Sign in failed: " + (err?.message || String(err)));
      }
    })();
  };

  // Clear any stale sessionId on mount to avoid showing wrong user after sign-out
  useEffect(() => {
    try {
      localStorage.removeItem("easysched:sessionId");
    } catch (e) {
      /* ignore */
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <div
          className="w-4/5 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80')",
          }}
        ></div>

        <div className="w-1/5 flex flex-col justify-center items-center bg-white shadow-lg p-8">
          <div className="w-full max-w-sm">
            {process.env.NEXT_PUBLIC_PREVIEW === "true" ? (
              <div className="mb-4">
                <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 px-4 py-2 rounded">
                  <strong className="block">PREVIEW DEPLOYMENT</strong>
                  <span className="text-sm">
                    This is a preview build. Do not use for production.
                  </span>
                </div>
              </div>
            ) : null}

            <h1 className="text-2xl font-semibold mb-6 text-black">Sign In</h1>

            <form className="space-y-4 text-black" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg p-2"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 text-center py-3 text-sm">
        © {new Date().getFullYear()} EasySched. All rights reserved.
      </footer>
    </div>
  );
}
