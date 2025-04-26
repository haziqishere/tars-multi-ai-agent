// src/store/slices/outputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface Option {
  id: string;
  title: string;
  description: string;
  timeToImplement: string;
  costReduction: string;
  nodes: Node[];
  edges: Edge[];
}

interface OutputState {
  currentBusinessFlow: {
    nodes: Node[];
    edges: Edge[];
  };
  options: Option[];
  selectedOptionId: string | null;
  isVisible: boolean;
}

const initialState: OutputState = {
  currentBusinessFlow: {
    nodes: [],
    edges: [],
  },
  options: [],
  selectedOptionId: null,
  isVisible: false,
};

export const outputSlice = createSlice({
  name: 'output',
  initialState,
  reducers: {
    setCurrentBusinessFlow: (
      state,
      action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
    ) => {
      state.currentBusinessFlow = action.payload;
    },
    setOptions: (state, action: PayloadAction<Option[]>) => {
      state.options = action.payload;
    },
    selectOption: (state, action: PayloadAction<string>) => {
      state.selectedOptionId = action.payload;
    },
    setOutputVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
    resetOutput: (state) => {
      state.currentBusinessFlow = { nodes: [], edges: [] };
      state.options = [];
      state.selectedOptionId = null;
      state.isVisible = false;
    },
  },
});

export const {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
  setOutputVisible,
  resetOutput,
} = outputSlice.actions;

export default outputSlice.reducer;