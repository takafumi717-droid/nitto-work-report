"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WORK_HOURS_OPTIONS } from "@/lib/constants";
import type { WorkReport } from "@/lib/types";

export function MyReportEditForm({
  report,
  employeeName,
  month,
}: {
  report: WorkReport;
  employeeName: string;
  month: string;
}) {
  const router = useRouter();
  const [workDate, setWorkDate] = useState(report.work_date);
  const [slipNo, setSlipNo] = useState(report.slip_no);
  const [workHours, setWorkHours] = useState(String(report.work_hours));
  const [remarks, setRemarks] = useState(report.remarks ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^\d{5}$/.test(slipNo)) {
      setError("作業伝票番号は数字5桁で入力してください");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: report.employee_id,
          work_date: workDate,
          slip_no: slipNo,
          work_hours: Number(workHours),
          remarks,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "更新に失敗しました");
        setSubmitting(false);
        return;
      }

      router.push(`/report/mine?employee=${report.employee_id}&month=${month}`);
      router.refresh();
    } catch {
      setError("更新に失敗しました");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">氏名</label>
        <p className="w-full rounded-xl border-2 border-slate-200 bg-slate-100 px-3 py-3 text-lg">
          {employeeName}
        </p>
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
          {WORK_HOURS_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h.toFixed(2)} 時間
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-slate-600">備考</label>
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
        {submitting ? "保存中..." : "保存する"}
      </Button>
    </form>
  );
}
