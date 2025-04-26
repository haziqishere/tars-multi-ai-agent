import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our agent state
export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  progress: number; // 0-100
  message?: string;
}

export interface AgentState {
  agents: Agent[];
  currentAgentId: string | null;
  isWorkflowActive: boolean;
}

// Initial state with 5 agents as described in the documentation
const initialState: AgentState = {
  agents: [
    {
      id: 'agent1',
      name: 'Data Collector',
      role: 'Retrieves business process information',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'agent2',
      name: 'Process Analyzer',
      role: 'Analyzes business flow',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'agent3',
      name: 'Optimization Generator',
      role: 'Generates optimization options',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'agent4',
      name: 'Cost Estimator',
      role: 'Calculates costs and timelines',
      status: 'idle',
      progress: 0,
    },
    {
      id: 'agent5',
      name: 'Report Generator',
      role: 'Creates visual reports',
      status: 'idle',
      progress: 0,
    },
  ],
  currentAgentId: null,
  isWorkflowActive: false,
};

export const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    startWorkflow: (state) => {
      state.isWorkflowActive = true;
      state.agents.forEach(agent => {
        agent.status = 'idle';
        agent.progress = 0;
      });
      state.currentAgentId = 'agent1'; // Start with the first agent
      state.agents[0].status = 'working';
    },
    updateAgentStatus: (state, action: PayloadAction<{ agentId: string, status: AgentStatus, message?: string }>) => {
      const { agentId, status, message } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (agent) {
        agent.status = status;
        if (message) agent.message = message;
      }
    },
    updateAgentProgress: (state, action: PayloadAction<{ agentId: string, progress: number }>) => {
      const { agentId, progress } = action.payload;
      const agent = state.agents.find(a => a.id === agentId);
      if (agent) {
        agent.progress = progress;
      }
    },
    advanceToNextAgent: (state) => {
      const currentIndex = state.agents.findIndex(a => a.id === state.currentAgentId);
      if (currentIndex >= 0 && currentIndex < state.agents.length - 1) {
        // Mark current agent as completed
        state.agents[currentIndex].status = 'completed';
        state.agents[currentIndex].progress = 100;
        
        // Advance to next agent
        const nextIndex = currentIndex + 1;
        state.currentAgentId = state.agents[nextIndex].id;
        state.agents[nextIndex].status = 'working';
      } else if (currentIndex === state.agents.length - 1) {
        // Complete the workflow
        state.agents[currentIndex].status = 'completed';
        state.agents[currentIndex].progress = 100;
        state.currentAgentId = null;
        state.isWorkflowActive = false;
      }
    },
    resetWorkflow: (state) => {
      return initialState;
    }
  },
});

export const { 
  startWorkflow, 
  updateAgentStatus, 
  updateAgentProgress, 
  advanceToNextAgent,
  resetWorkflow 
} = agentSlice.actions;

export default agentSlice.reducer;

// Cursor Instructions:
// This slice manages the state of the 5 agents in the workflow.
// It includes actions to update agent status, progress, and the currently active agent.
// The agents array matches the 5 agents shown in your diagram (Image 4).