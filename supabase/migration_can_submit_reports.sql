-- ============================================================
-- 管理者であっても日報入力・確認画面に表示したい従業員を
-- 個別に指定できるようにするための変更
-- (既存のSupabaseプロジェクトに対してSQL Editorで実行してください)
-- ============================================================

alter table employees
  add column if not exists can_submit_reports boolean not null default false;

-- 大久保　圭 を日報入力・確認画面の氏名選択リストに表示する
update employees set can_submit_reports = true where name = '大久保　圭';

-- ------------------------------------------------------------
-- RLSポリシーの再作成
-- 「is_admin = false」の条件を
-- 「is_admin = false または can_submit_reports = true」に変更する
-- ------------------------------------------------------------

drop policy if exists "anon can read active non-admin employees" on employees;
create policy "anon can read active non-admin employees"
  on employees for select
  to anon
  using (is_active = true and (is_admin = false or can_submit_reports = true));

drop policy if exists "anon can insert work reports for active employees" on work_reports;
create policy "anon can insert work reports for active employees"
  on work_reports for insert
  to anon
  with check (
    exists (
      select 1 from employees e
      where e.id = employee_id
        and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  );

drop policy if exists "anon can read own work reports" on work_reports;
create policy "anon can read own work reports"
  on work_reports for select
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  );

drop policy if exists "anon can update own work reports" on work_reports;
create policy "anon can update own work reports"
  on work_reports for update
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  )
  with check (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  );

drop policy if exists "anon can delete own work reports" on work_reports;
create policy "anon can delete own work reports"
  on work_reports for delete
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  );

drop policy if exists "anon can insert own report edits" on report_edits;
create policy "anon can insert own report edits"
  on report_edits for insert
  to anon
  with check (
    exists (
      select 1 from employees e
      where e.id = edited_by and e.is_active = true
        and (e.is_admin = false or e.can_submit_reports = true)
    )
  );
