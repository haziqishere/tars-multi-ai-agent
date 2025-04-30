// Output Types
export interface Node {
  id: string;
  label: string;
  type?: string;
  position?: { x: number; y: number };
  data?: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  data?: any;
}

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface Option {
  id: string;
  title: string;
  description: string;
  timeToImplement: string;
  costReduction: string;
  nodes: Node[];
  edges: Edge[];
}

// New types for Summary Card feature
export interface BusinessFlowStep {
  id: string;
  description: string;
  department: string;
}

export interface DepartmentTask {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
}

export interface Email {
  to: string;
  recipient: string;
  department: string;
  subject: string;
  body: string;
}

export interface Department {
  id: string;
  department: string;
  manager: string;
  email: string;
  tasks: DepartmentTask[];
  emailTemplate: Email;
}

export interface SummaryCardData {
  businessOperationsFlow: {
    summary: string;
    steps: BusinessFlowStep[];
  };
  departments: Department[];
}

export interface OutputState {
  currentBusinessFlow: FlowData;
  options: Option[];
  selectedOptionId: string | null;
  isVisible: boolean;
  // New state properties for Summary Card
  summaryCardVisible: boolean;
  summaryCardData: SummaryCardData | null;
  selectedDepartmentId: string | null;
  editedEmails: Record<string, Email>;
  sendingEmails: boolean;
  emailsSent: boolean;
}