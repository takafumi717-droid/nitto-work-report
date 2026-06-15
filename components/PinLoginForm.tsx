"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export function PinLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function press(key: string) {
    setError("");
    if (key === "back") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === "") return;
    if (pin.length >= 4) return;
    setPin((p) => p + key);
  }

  async function handleSubmit() {
    if (pin.length !== 4) {
      setError("PINを4桁入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "ログインに失敗しました");
        setPin("");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("ログインに失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-2xl font-bold"
          >
            {pin[i] ? "●" : ""}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-center text-sm font-bold text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) =>
          key === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              className="rounded-2xl bg-white py-4 text-2xl font-bold shadow-sm active:bg-slate-100"
            >
              {key === "back" ? "←" : key}
            </button>
          )
        )}
      </div>

      <Button onClick={handleSubmit} disabled={submitting || pin.length !== 4}>
        {submitting ? "確認中..." : "ログイン"}
      </Button>
    </div>
  );
}
