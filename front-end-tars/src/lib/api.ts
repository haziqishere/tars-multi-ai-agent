// src/lib/api.ts
import { Option } from '@/types/output';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Process a user prompt through the agent workflow
 */
export async function processPrompt(prompt: string): Promise<{
  options: Option[];
  currentFlow: {
    nodes: any[];
    edges: any[];
  };
}> {
  try {
    // In a real implementation, this would call an actual API
    // For now, we'll simulate a response
    
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response data
    return {
      currentFlow: {
        nodes: [
          { id: 'A', label: 'Process A', position: { x: 50, y: 75 } },
          { id: 'B', label: 'Process B', position: { x: 200, y: 25 } },
          { id: 'C', label: 'Process C', position: { x: 350, y: 75 } }
        ],
        edges: [
          { id: 'A-B', source: 'A', target: 'B' },
          { id: 'B-C', source: 'B', target: 'C' }
        ]
      },
      options: [
        {
          id: 'option-1',
          title: 'Option A',
          description: 'Optimize through process D',
          timeToImplement: '2 Months',
          costReduction: '-30% in cost',
          nodes: [
            { id: 'A', label: 'Process A', position: { x: 50, y: 75 } },
            { id: 'D', label: 'Process D', position: { x: 200, y: 25 } },
            { id: 'C', label: 'Process C', position: { x: 350, y: 75 } }
          ],
          edges: [
            { id: 'A-D', source: 'A', target: 'D' },
            { id: 'D-C', source: 'D', target: 'C' }
          ]
        },
        {
          id: 'option-2',
          title: 'Option B',
          description: 'Optimize through processes E and F',
          timeToImplement: '3 Months',
          costReduction: '-25% in cost',
          nodes: [
            { id: 'A', label: 'Process A', position: { x: 50, y: 75 } },
            { id: 'E', label: 'Process E', position: { x: 175, y: 25 } },
            { id: 'F', label: 'Process F', position: { x: 250, y: 25 } },
            { id: 'C', label: 'Process C', position: { x: 350, y: 75 } }
          ],
          edges: [
            { id: 'A-E', source: 'A', target: 'E' },
            { id: 'E-F', source: 'E', target: 'F' },
            { id: 'F-C', source: 'F', target: 'C' }
          ]
        }
      ]
    };
  } catch (error) {
    console.error('Error processing prompt:', error);
    throw error;
  }
}

/**
 * Save the selected option
 */
export async function saveSelectedOption(optionId: string): Promise<{ success: boolean }> {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return { success: true };
  } catch (error) {
    console.error('Error saving selected option:', error);
    throw error;
  }
}