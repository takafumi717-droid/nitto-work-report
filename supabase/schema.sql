-- ============================================================
-- 株式会社日東工業所 作業日報システム DBスキーマ
-- Supabase (PostgreSQL) 用
-- ============================================================

-- 拡張機能（gen_random_uuid用）
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. employees（従業員マスタ）
-- ============================================================
create table if not exists employees (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sort_order  integer not null,
  is_admin    boolean not null default false,
  is_active   boolean not null default true,
  admin_pin   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_employees_sort_order on employees (sort_order);

-- ============================================================
-- 2. work_reports（作業日報）
-- ============================================================
create table if not exists work_reports (
  id           uuid primary key default gen_random_uuid(),
  employee_id  uuid not null references employees(id),
  work_date    date not null,
  slip_no      text not null,
  work_hours   numeric(4,2) not null,
  remarks      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint chk_slip_no_format check (slip_no ~ '^[0-9]{5}$'),
  constraint chk_work_hours_step check (
    work_hours > 0 and (work_hours * 4) = round(work_hours * 4)
  )
);

create index if not exists idx_work_reports_employee_id on work_reports (employee_id);
create index if not exists idx_work_reports_work_date on work_reports (work_date);

-- ============================================================
-- 3. report_edits（修正履歴）
-- ============================================================
create table if not exists report_edits (
  id              uuid primary key default gen_random_uuid(),
  work_report_id  uuid not null references work_reports(id),
  edited_by       uuid not null references employees(id),
  before_data     jsonb not null,
  after_data      jsonb not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_report_edits_work_report_id on report_edits (work_report_id);

-- ============================================================
-- RLS（すべてサーバー側 Service Role 経由でアクセスするため、
-- クライアントからの直接アクセスは禁止する）
-- ============================================================
alter table employees enable row level security;
alter table work_reports enable row level security;
alter table report_edits enable row level security;
-- ポリシーを定義しないことで anon / authenticated からの全アクセスを拒否する。
-- Service Role キーはRLSをバイパスするため、Next.jsのサーバー側からのみ操作する。

-- ============================================================
-- 初期データ：従業員（一般社員 21名）
-- ============================================================
insert into employees (name, sort_order, is_admin, is_active, admin_pin) values
  ('末武　輝美',       1, false, true, null),
  ('吉田　良行',       2, false, true, null),
  ('秀島　昭博',       3, false, true, null),
  ('後藤　博光',       4, false, true, null),
  ('梶巻　修',         5, false, true, null),
  ('石黒　淳一',       6, false, true, null),
  ('内野　雄介',       7, false, true, null),
  ('久間　比呂司',     8, false, true, null),
  ('佐野　義祐',       9, false, true, null),
  ('川口　龍也',      10, false, true, null),
  ('久保　光正',      11, false, true, null),
  ('DOAN VAN VU',     12, false, true, null),
  ('DINH VAN KIEN',   13, false, true, null),
  ('HANDI WAHYUDIN',  14, false, true, null),
  ('江端　久志',      15, false, true, null),
  ('武藤　武樹',      16, false, true, null),
  ('武藤　颯太',      17, false, true, null),
  ('ROSYID SANTOSO',  18, false, true, null),
  ('大柄根　隆斗',    19, false, true, null),
  ('尾迫　郁哉',      20, false, true, null),
  ('その他',          21, false, true, null);

-- 管理者3名（一般社員選択リストには表示しない。is_admin=trueで判定して除外する）
insert into employees (name, sort_order, is_admin, is_active, admin_pin) values
  ('大久保　喬史', 101, true, true, '0717'),
  ('大久保　圭',   102, true, true, '0717'),
  ('末継　良治',   103, true, true, '0717');
