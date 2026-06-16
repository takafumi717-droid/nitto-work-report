"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WORK_HOURS_OPTIONS } from "@/lib/constants";

type Employee = { id: string; name: string };

function todayString() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export function ReportForm({
  employees,
  defaultEmployeeId,
}: {
  employees: Employee[];
  defaultEmployeeId: string;
}) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId);
  const [workDate, setWorkDate] = useState(todayString());
  const [slipNo, setSlipNo] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!employeeId) {
      setError("氏名を選択してください");
      return;
    }
    if (!workDate) {
      setError("作業日を入力してください");
      return;
    }
    if (!/^\d{5}$/.test(slipNo)) {
      setError("作業伝票番号は数字5桁で入力してください");
      return;
    }
    if (!workHours) {
      setError("作業時間を選択してください");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          work_date: workDate,
          slip_no: slipNo,
          work_hours: Number(workHours),
          remarks,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "登録に失敗しました");
        setSubmitting(false);
        return;
      }

      router.push(`/report/done?employee=${employeeId}`);
    } catch {
      setError("登録に失敗しました。通信状況を確認してください");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">氏名</label>
        <select
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">選択してください</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">作業日</label>
        <input
          type="date"
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          value={workDate}
          onChange={(e) => setWorkDate(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">作業伝票番号（5桁）</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="例：12345"
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg tracking-widest"
          value={slipNo}
          onChange={(e) => setSlipNo(e.target.value.replace(/\D/g, "").slice(0, 5))}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">作業時間</label>
        <select
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          value={workHours}
          onChange={(e) => setWorkHours(e.target.value)}
        >
          <option value="">選択してください</option>
          {WORK_HOURS_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h.toFixed(2)} 時間
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">備考（任意）</label>
        <textarea
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-3 text-lg"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">{error}</p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? "登録中..." : "登録する"}
      </Button>
    </form>
  );
}
