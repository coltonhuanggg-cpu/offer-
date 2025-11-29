export enum OfferStatus {
  NONE = 'None',
  OFFER = 'Offer',
  REJECT = 'Reject',
  WAITLIST = 'Waitlist',
}

export enum OfferType {
  CONDITIONAL = 'Conditional',
  UNCONDITIONAL = 'Unconditional',
  UNKNOWN = 'Unknown',
}

export enum TaskStatus {
  PENDING = 'pending',
  DONE = 'done',
}

// --- Database Schema (Simulated) ---

export interface Student {
  student_id: string;
  name: string;
  contact?: string;
  consultant_name?: string;
  notes?: string;
}

export interface Application {
  application_id: string;
  student_id: string;
  university: string;
  program: string;
  offer_status: OfferStatus;
  offer_type: OfferType;
  offer_date?: string; // ISO Date string
  deposit_amount?: string;
  deposit_deadline?: string; // ISO Date string
  tasks_to_do: string[]; // Simple array of strings for quick reference
  raw_pdf_text?: string;
  last_updated_timestamp: number;
  school_id_ref?: string; // ID in the school system
}

export interface Task {
  task_id: string;
  application_id: string;
  task_description: string;
  deadline?: string; // ISO Date string
  status: TaskStatus;
}

// --- Parsing Types ---

export interface ParsedOfferData {
  studentName: string | null;
  university: string | null;
  program: string | null;
  offerType: 'Conditional' | 'Unconditional' | 'Reject' | 'Waitlist' | null;
  conditions: string[] | null;
  depositAmount: string | null;
  depositDeadline: string | null;
  startTerm: string | null;
  offerDate: string | null;
  schoolId: string | null;
  nextSteps: string[] | null;
  keySentences: string | null; // For verification
}
