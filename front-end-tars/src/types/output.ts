// Output Types
export interface Node {
  id: string;
  label: string;
  type?: string;
  position?: { x: number; y: number };
  status?: {
    type: "critical" | "new" | "warning" | string;  // Status type for visual styling
    label: string;                                  // Status label to display (e.g. "⚠ Critical")
  };
  data?: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  flowType?: "critical" | "optimized" | "standard" | string;  // Updated to match API
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
  additionalMetrics?: Array<{
    label: string;
    value: string;
  }>;
  selected?: boolean;
  nodes?: Node[];  // Made optional to match API
  edges?: Edge[];  // Made optional to match API
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
    steps?: BusinessFlowStep[];
    nodes?: Node[];  // Add optional nodes property
    edges?: Edge[];  // Add optional edges property
  };
  departments: Department[];
}

export interface SummaryCardResponse {
  activeOption: string;  // The currently selected option (e.g., "A", "B", or "C")
  allOptions: {
    // A map of option ID to SummaryCardData, containing info for ALL options
    [key: string]: SummaryCardData
  }
}

export interface OutputState {
  currentBusinessFlow: FlowData;
  options: Option[];
  selectedOptionId: string | null;
  isVisible: boolean;
  // New state properties for Summary Card
  summaryCardVisible: boolean;
  summaryCardData: SummaryCardData | null;
  summaryCardResponse: SummaryCardResponse | null;  // Add new field for the response
  selectedDepartmentId: string | null;
  editedEmails: Record<string, Email>;
  sendingEmails: boolean;
  emailsSent: boolean;
}