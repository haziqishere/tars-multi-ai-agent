// src/store/slices/outputSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge, Option, SummaryCardData, Email, FlowData, SummaryCardResponse } from '@/types/output';

interface OutputState {
  currentBusinessFlow: FlowData;
  options: Option[];
  selectedOptionId: string | null;
  isVisible: boolean;
  summaryCardVisible: boolean;
  summaryCardData: SummaryCardData | null;
  summaryCardResponse: SummaryCardResponse | null;
  selectedDepartmentId: string | null;
  editedEmails: Record<string, Email>;
  sendingEmails: boolean;
  emailsSent: boolean;
}

const initialState: OutputState = {
  currentBusinessFlow: {
    nodes: [],
    edges: [],
  },
  options: [],
  selectedOptionId: null,
  isVisible: false,
  summaryCardVisible: false,
  summaryCardData: null,
  summaryCardResponse: null,
  selectedDepartmentId: null,
  editedEmails: {},
  sendingEmails: false,
  emailsSent: false,
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
              
              // If we have a summaryCardResponse, update the summaryCardData based on the new selection
              if (state.summaryCardResponse && state.summaryCardResponse.allOptions) {
                // Find the option letter that corresponds to the selected option ID
                // This assumes option IDs are like "option-A", "option-B", etc.
                const optionLetter = action.payload.split('-')[1]; // Gets "A" from "option-A"
                
                if (optionLetter && state.summaryCardResponse.allOptions[optionLetter]) {
                  state.summaryCardData = state.summaryCardResponse.allOptions[optionLetter];
                  
                  // Update edited emails
                  const emailMap: Record<string, Email> = {};
                  state.summaryCardData.departments.forEach(dept => {
                    emailMap[dept.id] = { ...dept.emailTemplate };
                  });
                  state.editedEmails = emailMap;
                  
                  if (state.summaryCardData.departments.length > 0) {
                    state.selectedDepartmentId = state.summaryCardData.departments[0].id;
                  }
                }
              }
            },
    setOutputVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
    resetOutput: (state) => {
      state.currentBusinessFlow = { nodes: [], edges: [] };
      state.options = [];
      state.selectedOptionId = null;
      state.isVisible = false;
      state.summaryCardVisible = false;
      state.summaryCardData = null;
      state.summaryCardResponse = null;
      state.selectedDepartmentId = null;
      state.editedEmails = {};
      state.sendingEmails = false;
      state.emailsSent = false;
    },
    setSummaryCardData: (state, action: PayloadAction<SummaryCardData>) => {
      state.summaryCardData = action.payload;
      
      const emailMap: Record<string, Email> = {};
      action.payload.departments.forEach(dept => {
        emailMap[dept.id] = { ...dept.emailTemplate };
      });
      state.editedEmails = emailMap;
      
      if (action.payload.departments.length > 0) {
        state.selectedDepartmentId = action.payload.departments[0].id;
      }
    },
    setSummaryCardResponse: (state, action: PayloadAction<SummaryCardResponse>) => {
      state.summaryCardResponse = action.payload;
      
      // Set the active option data to summaryCardData
      if (action.payload.activeOption && action.payload.allOptions[action.payload.activeOption]) {
        const activeOptionData = action.payload.allOptions[action.payload.activeOption];
        state.summaryCardData = activeOptionData;
        
        // Update edited emails
        const emailMap: Record<string, Email> = {};
        activeOptionData.departments.forEach(dept => {
          emailMap[dept.id] = { ...dept.emailTemplate };
        });
        state.editedEmails = emailMap;
        
        if (activeOptionData.departments.length > 0) {
          state.selectedDepartmentId = activeOptionData.departments[0].id;
        }
      }
    },
    showSummaryCard: (state) => {
      state.summaryCardVisible = true;
    },
    hideSummaryCard: (state) => {
      state.summaryCardVisible = false;
    },
    setSelectedDepartment: (state, action: PayloadAction<string>) => {
      state.selectedDepartmentId = action.payload;
    },
    updateEditedEmail: (state, action: PayloadAction<{
      departmentId: string;
      field: keyof Email;
      value: string;
    }>) => {
      const { departmentId, field, value } = action.payload;
      if (state.editedEmails && state.editedEmails[departmentId]) {
        state.editedEmails[departmentId] = {
          ...state.editedEmails[departmentId],
          [field]: value
        };
      }
    },
    setSendingEmails: (state, action: PayloadAction<boolean>) => {
      state.sendingEmails = action.payload;
    },
    setEmailsSent: (state, action: PayloadAction<boolean>) => {
      state.emailsSent = action.payload;
          }
      },
});

export const {
  setCurrentBusinessFlow,
  setOptions,
  selectOption,
  setOutputVisible,
  resetOutput,
  setSummaryCardData,
  setSummaryCardResponse,
  showSummaryCard,
  hideSummaryCard,
  setSelectedDepartment,
  updateEditedEmail,
  setSendingEmails,
  setEmailsSent,
  } = outputSlice.actions;

export default outputSlice.reducer;