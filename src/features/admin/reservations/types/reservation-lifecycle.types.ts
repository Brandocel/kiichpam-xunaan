export type LifecycleStepStatus =
  | "COMPLETED"
  | "PENDING"
  | "WARNING"
  | "FAILED"
  | "ERROR"
  | "SKIPPED"
  | string;

export interface ReservationLifecycleStep {
  order: number;
  key: string;
  title: string;
  status: LifecycleStepStatus;
  severity?: string;
  message?: string;
  timestamp?: string | null;
  expected?: string;
  blocker?: boolean;
  metadata?: unknown;
}

export interface ReservationLifecycleProgress {
  totalSteps: number;
  completed: number;
  failed: number;
  warnings: number;
  skipped: number;
  percentage: number;
}

export interface ReservationLifecycleSummary {
  isPaid?: boolean;
  isProcessing?: boolean;
  isFailed?: boolean;
  hasCustomerEmail?: boolean;
  stripeIntentCreated?: boolean;
  stripeSucceeded?: boolean;
  stripeFailed?: boolean;
  calendarSynced?: boolean;
  calendarFailed?: boolean;
  customerEmailSent?: boolean;
  customerEmailFailed?: boolean;
  operationsEmailSent?: boolean;
  operationsEmailFailed?: boolean;
  hasOperationsEmailConfigured?: boolean;
}

export interface ReservationLifecycleResponse {
  success?: boolean;
  message?: string;
  folio?: string;
  reservationStatus?: string;
  flowHealthy?: boolean;
  currentBlocker?: ReservationLifecycleStep | null;
  blockers?: ReservationLifecycleStep[];
  progress?: ReservationLifecycleProgress;
  summary?: ReservationLifecycleSummary;
  steps?: ReservationLifecycleStep[];
  raw?: unknown;
}