export type Employee = {
  id: string;
  name: string;
  sort_order: number;
  is_admin: boolean;
  is_active: boolean;
  can_submit_reports: boolean;
  admin_pin: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkReport = {
  id: string;
  employee_id: string;
  work_date: string;
  slip_no: string;
  work_hours: number;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportEdit = {
  id: string;
  work_report_id: string | null;
  edited_by: string;
  before_data: Record<string, unknown>;
  after_data: Record<string, unknown>;
  created_at: string;
};

export type WorkReportWithEmployee = WorkReport & {
  employees: { id: string; name: string } | null;
};
