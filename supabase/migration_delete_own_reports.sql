-- ============================================================
-- 一般社員が自分の日報を削除できるようにするための変更
-- (既存のSupabaseプロジェクトに対してSQL Editorで実行してください)
-- ============================================================

-- report_edits.work_report_id を null許容にし、
-- 参照先の work_reports が削除されても履歴(report_edits)は残るようにする
alter table report_edits alter column work_report_id drop not null;

alter table report_edits drop constraint if exists report_edits_work_report_id_fkey;

alter table report_edits
  add constraint report_edits_work_report_id_fkey
  foreign key (work_report_id) references work_reports(id) on delete set null;

-- work_reports: 在籍中・一般社員は自分の日報を削除可能
create policy "anon can delete own work reports"
  on work_reports for delete
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true and e.is_admin = false
    )
  );
