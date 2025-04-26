// Agent Types
export interface Agent {
    id: number;
    name: string;
    status: AgentStatus;
    currentTask: string;
    progress: number; // 0-100
  }
  
  export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';
  
  export interface AgentWorkflow {
    agents: Agent[];
    currentAgentId: number | null;
    isProcessing: boolean;
  }
  
  // Agent workflow step
  export interface WorkflowStep {
    agentId: number;
    task: string;
    duration: number; // in milliseconds
    dependsOn?: number[]; // IDs of agents that must complete before this step
  }