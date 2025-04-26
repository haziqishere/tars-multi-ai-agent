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
  
  export interface OutputState {
    currentBusinessFlow: FlowData;
    options: Option[];
    selectedOptionId: string | null;
    isVisible: boolean;
  }