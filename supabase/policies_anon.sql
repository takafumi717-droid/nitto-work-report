-- ============================================================
-- anonキー（一般社員向け画面）からのアクセスを許可するRLSポリシー
-- 日報入力画面（氏名選択・日報登録）で使用する。
-- ============================================================

-- employees: 在籍中・一般社員のみ参照可能（管理者・退職者は除外）
create policy "anon can read active non-admin employees"
  on employees for select
  to anon
  using (is_active = true and is_admin = false);

-- work_reports: 在籍中・一般社員の場合のみ新規登録を許可
create policy "anon can insert work reports for active employees"
  on work_reports for insert
  to anon
  with check (
    exists (
      select 1 from employees e
      where e.id = employee_id
        and e.is_active = true
        and e.is_admin = false
    )
  );

-- work_reports: 在籍中・一般社員は自分の日報を参照可能
create policy "anon can read own work reports"
  on work_reports for select
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true and e.is_admin = false
    )
  );

-- work_reports: 在籍中・一般社員は自分の日報を修正可能
create policy "anon can update own work reports"
  on work_reports for update
  to anon
  using (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true and e.is_admin = false
    )
  )
  with check (
    exists (
      select 1 from employees e
      where e.id = employee_id and e.is_active = true and e.is_admin = false
    )
  );

-- report_edits: 在籍中・一般社員は自分の修正履歴を登録可能
create policy "anon can insert own report edits"
  on report_edits for insert
  to anon
  with check (
    exists (
      select 1 from employees e
      where e.id = edited_by and e.is_active = true and e.is_admin = false
    )
  );
