# Aspiration: Improved Alternative Options Flow Structure

## Overview

Our frontend components expect a rich, detailed flow visualization structure for each alternative option. The current API response is missing this detailed structure in the `summaryCard` options, using only a simple linear step structure instead of the full nodes and edges format available in the main `businessFlow` and in each option itself.

## Current Structure vs. Desired Structure

### Current Summary Card Option Structure

```json
"summaryCard": {
  "activeOption": "B",
  "allOptions": {
    "B": {
      "businessOperationsFlow": {
        "summary": "Implement comprehensive training and development programs...",
        "steps": [
          {"id": "step-B-1", "description": "solving, communication, and product knowledge.", "department": "Customer Service"},
          ...
        ]
      },
      "departments": [...]
    }
  }
}
```

### Desired Summary Card Option Structure

We want each option in the `summaryCard.allOptions` to include a full visualization structure matching the format used in the main `recommendations.options` array:

```json
"summaryCard": {
  "activeOption": "B",
  "allOptions": {
    "B": {
      "businessOperationsFlow": {
        "summary": "Implement comprehensive training and development programs...",
        "nodes": [
          { 
            "id": "node-B-1", 
            "label": "Requirements Analysis", 
            "type": "start", 
            "position": {"x": 50, "y": 100}
          },
          { 
            "id": "node-B-2", 
            "label": "Training Program Development", 
            "type": "process", 
            "position": {"x": 200, "y": 100},
            "status": {"type": "new", "label": "+ New Process"}
          },
          ...
        ],
        "edges": [
          {
            "id": "edge-B-1",
            "source": "node-B-1",
            "target": "node-B-2",
            "label": "Requirements Complete",
            "flowType": "optimized"
          },
          ...
        ]
      },
      "departments": [...]
    }
  }
}
```

## Key Improvement Points

1. **Consistent Structure**: Each option's visualization should follow the same structure as the main `businessFlow` and individual option visualizations.

2. **Rich Flow Type Information**: Include `flowType` attributes (e.g., "optimized", "critical", "standard") in the edges to allow for proper styling and animation in the UI.

3. **Node Status Indicators**: Include `status` objects for nodes that need special highlighting (e.g., new processes, bottlenecks, critical components).

4. **Proper Positioning**: Include `position` coordinates for all nodes to allow for consistent visualization layout.

5. **Complete Graph Structure**: Ensure a proper directed graph structure with nodes and edges rather than a linear step sequence.

## Example of Desired Structure

For a "Balanced Approach" option, the structure should be like this:

```json
"B": {
  "businessOperationsFlow": {
    "summary": "Balanced approach (moderate risk, moderate reward) - Implement customer service optimization gradually, combining moderate technology upgrades, training, and phased process automation.",
    "nodes": [
      {
        "id": "node-B-1",
        "label": "Process Start",
        "type": "start",
        "position": {"x": 50, "y": 100}
      },
      {
        "id": "node-B-2",
        "label": "Requirements Analysis",
        "type": "process",
        "position": {"x": 200, "y": 100}
      },
      {
        "id": "node-B-3",
        "label": "Technology Selection",
        "type": "process",
        "position": {"x": 350, "y": 50}
      },
      {
        "id": "node-B-4",
        "label": "Training Development",
        "type": "process",
        "position": {"x": 350, "y": 150},
        "status": {"type": "new", "label": "+ New Process"}
      },
      {
        "id": "node-B-5",
        "label": "Implementation",
        "type": "process",
        "position": {"x": 500, "y": 100}
      },
      {
        "id": "node-B-6",
        "label": "Performance Monitoring",
        "type": "process",
        "position": {"x": 650, "y": 100}
      },
      {
        "id": "node-B-7",
        "label": "Process End",
        "type": "end",
        "position": {"x": 800, "y": 100}
      }
    ],
    "edges": [
      {
        "id": "edge-B-1",
        "source": "node-B-1",
        "target": "node-B-2",
        "label": "Start",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-2",
        "source": "node-B-2",
        "target": "node-B-3",
        "label": "Tech Path",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-3",
        "source": "node-B-2",
        "target": "node-B-4",
        "label": "Training Path",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-4",
        "source": "node-B-3",
        "target": "node-B-5",
        "label": "Tech Selected",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-5",
        "source": "node-B-4",
        "target": "node-B-5",
        "label": "Training Ready",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-6",
        "source": "node-B-5",
        "target": "node-B-6",
        "label": "Deployed",
        "flowType": "optimized"
      },
      {
        "id": "edge-B-7",
        "source": "node-B-6",
        "target": "node-B-7",
        "label": "Complete",
        "flowType": "optimized"
      }
    ]
  },
  "departments": [...]
}
```

## Implementation Recommendations

1. **Backend Changes**: Modify the API response generator to create full node/edge structures for each option in the `summaryCard` section.

2. **Transform Existing Data**: For the immediate term, consider implementing a transformation layer in the API or frontend that converts the current linear step structure into a proper node/edge format.

3. **One Source of Truth**: Ideally, the visualization data in `summaryCard.allOptions[x].businessOperationsFlow` should be derived from or equivalent to the visualization in the corresponding `recommendations.options[x]` object.

4. **Parameterize Status Types**: Standardize the status types (`"critical"`, `"new"`, `"warning"`) and flow types (`"optimized"`, `"critical"`, `"standard"`) to ensure consistent UI rendering.

## Benefits

1. **Consistent UI**: All visualizations (main flow and alternative options) will have the same structure and rendering capabilities.

2. **Feature Parity**: Each alternative visualization will support all the same features as the main visualization.

3. **Clearer Comparison**: Users can more easily compare different options with rich, visually consistent diagrams.

4. **Reduced Frontend Complexity**: Frontend code can handle all visualizations with the same component, rather than needing separate implementations for the main flow and summaryCard options.

## Implementation Priority

This should be considered a high-priority backend change as it directly impacts feature parity between the main visualization and the options visualiz

example of Json output:

{
  "summaryCard": {
    "activeOption": "B",
    "allOptions": {
      "A": {
        "businessOperationsFlow": {
          "summary": "Conservative approach (lower risk, lower reward) - Gradual implementation of technology integration with minimal system changes to maintain stability.",
          "nodes": [
            {
              "id": "node-A-1",
              "label": "Process Start",
              "type": "start",
              "position": {"x": 50, "y": 100}
            },
            {
              "id": "node-A-2",
              "label": "Requirements Analysis",
              "type": "process",
              "position": {"x": 200, "y": 100}
            },
            {
              "id": "node-A-3",
              "label": "Limited CRM Upgrade",
              "type": "process",
              "position": {"x": 350, "y": 100},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-A-4",
              "label": "Basic Training",
              "type": "process",
              "position": {"x": 500, "y": 100}
            },
            {
              "id": "node-A-5",
              "label": "Process End",
              "type": "end",
              "position": {"x": 650, "y": 100}
            }
          ],
          "edges": [
            {
              "id": "edge-A-1",
              "source": "node-A-1",
              "target": "node-A-2",
              "label": "Start Analysis",
              "flowType": "standard"
            },
            {
              "id": "edge-A-2",
              "source": "node-A-2",
              "target": "node-A-3",
              "label": "Requirements Complete",
              "flowType": "standard"
            },
            {
              "id": "edge-A-3",
              "source": "node-A-3",
              "target": "node-A-4",
              "label": "System Ready",
              "flowType": "standard"
            },
            {
              "id": "edge-A-4",
              "source": "node-A-4",
              "target": "node-A-5",
              "label": "Implementation Complete",
              "flowType": "standard"
            }
          ]
        },
        "departments": [
          {
            "id": "dept-A-1",
            "department": "IT",
            "manager": "Sarah Miller",
            "email": "sarah.miller@company.com",
            "tasks": [
              {
                "id": "task-A-1",
                "description": "Implement foundational CRM software with limited features",
                "priority": "high",
                "deadline": "2025-05-15"
              },
              {
                "id": "task-A-2",
                "description": "Setup basic monitoring systems",
                "priority": "medium",
                "deadline": "2025-05-29"
              }
            ],
            "emailTemplate": {
              "to": "sarah.miller@company.com",
              "recipient": "Sarah Miller",
              "department": "IT",
              "subject": "Action Required: Conservative Approach Implementation for IT Department",
              "body": "Dear Sarah Miller,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option A: Conservative Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Implement foundational CRM software with limited features (High Priority, Due: May 15, 2025)\n2. Setup basic monitoring systems (Medium Priority, Due: May 29, 2025)\n\nThis optimization is expected to result in a 10-15% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          },
          {
            "id": "dept-A-2",
            "department": "Training",
            "manager": "David Chen",
            "email": "david.chen@company.com",
            "tasks": [
              {
                "id": "task-A-3",
                "description": "Conduct entry-level staff training on basic service improvements",
                "priority": "high",
                "deadline": "2025-06-10"
              }
            ],
            "emailTemplate": {
              "to": "david.chen@company.com",
              "recipient": "David Chen",
              "department": "Training",
              "subject": "Action Required: Conservative Approach Implementation for Training Department",
              "body": "Dear David Chen,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option A: Conservative Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Conduct entry-level staff training on basic service improvements (High Priority, Due: June 10, 2025)\n\nThis optimization is expected to result in a 10-15% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          }
        ]
      },
      "B": {
        "businessOperationsFlow": {
          "summary": "Balanced approach (moderate risk, moderate reward) - Implement customer service optimization gradually, combining moderate technology upgrades, training, and phased process automation.",
          "nodes": [
            {
              "id": "node-B-1",
              "label": "Process Start",
              "type": "start",
              "position": {"x": 50, "y": 100}
            },
            {
              "id": "node-B-2",
              "label": "Requirements Analysis",
              "type": "process",
              "position": {"x": 200, "y": 100}
            },
            {
              "id": "node-B-3",
              "label": "Cloud CRM Deployment",
              "type": "process",
              "position": {"x": 350, "y": 50},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-B-4",
              "label": "Comprehensive Training",
              "type": "process",
              "position": {"x": 350, "y": 150},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-B-5",
              "label": "Process Automation",
              "type": "process",
              "position": {"x": 500, "y": 100},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-B-6",
              "label": "Performance Monitoring",
              "type": "process",
              "position": {"x": 650, "y": 100}
            },
            {
              "id": "node-B-7",
              "label": "Process End",
              "type": "end",
              "position": {"x": 800, "y": 100}
            }
          ],
          "edges": [
            {
              "id": "edge-B-1",
              "source": "node-B-1",
              "target": "node-B-2",
              "label": "Start",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-2",
              "source": "node-B-2",
              "target": "node-B-3",
              "label": "Tech Path",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-3",
              "source": "node-B-2",
              "target": "node-B-4",
              "label": "Training Path",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-4",
              "source": "node-B-3",
              "target": "node-B-5",
              "label": "Tech Ready",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-5",
              "source": "node-B-4",
              "target": "node-B-5",
              "label": "Staff Ready",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-6",
              "source": "node-B-5",
              "target": "node-B-6",
              "label": "Implementation Complete",
              "flowType": "optimized"
            },
            {
              "id": "edge-B-7",
              "source": "node-B-6",
              "target": "node-B-7",
              "label": "Optimization Complete",
              "flowType": "optimized"
            }
          ]
        },
        "departments": [
          {
            "id": "dept-B-1",
            "department": "IT",
            "manager": "Sarah Miller",
            "email": "sarah.miller@company.com",
            "tasks": [
              {
                "id": "task-B-1",
                "description": "Deploy cloud-based CRM software with advanced analytics",
                "priority": "high",
                "deadline": "2025-05-30"
              },
              {
                "id": "task-B-2",
                "description": "Automate key repetitive processes such as ticketing workflows",
                "priority": "high",
                "deadline": "2025-06-15"
              },
              {
                "id": "task-B-3",
                "description": "Implement performance metrics monitoring system",
                "priority": "medium",
                "deadline": "2025-07-01"
              }
            ],
            "emailTemplate": {
              "to": "sarah.miller@company.com",
              "recipient": "Sarah Miller",
              "department": "IT",
              "subject": "Action Required: Balanced Approach Implementation for IT Department",
              "body": "Dear Sarah Miller,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option B: Balanced Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Deploy cloud-based CRM software with advanced analytics (High Priority, Due: May 30, 2025)\n2. Automate key repetitive processes such as ticketing workflows (High Priority, Due: June 15, 2025)\n3. Implement performance metrics monitoring system (Medium Priority, Due: July 1, 2025)\n\nThis optimization is expected to result in a 15-25% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          },
          {
            "id": "dept-B-2",
            "department": "Training",
            "manager": "David Chen",
            "email": "david.chen@company.com",
            "tasks": [
              {
                "id": "task-B-4",
                "description": "Conduct comprehensive customer service training sessions",
                "priority": "high",
                "deadline": "2025-06-15"
              },
              {
                "id": "task-B-5",
                "description": "Develop technology fluency training modules",
                "priority": "medium",
                "deadline": "2025-06-30"
              }
            ],
            "emailTemplate": {
              "to": "david.chen@company.com",
              "recipient": "David Chen",
              "department": "Training",
              "subject": "Action Required: Balanced Approach Implementation for Training Department",
              "body": "Dear David Chen,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option B: Balanced Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Conduct comprehensive customer service training sessions (High Priority, Due: June 15, 2025)\n2. Develop technology fluency training modules (Medium Priority, Due: June 30, 2025)\n\nThis optimization is expected to result in a 15-25% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          }
        ]
      },
      "C": {
        "businessOperationsFlow": {
          "summary": "Aggressive approach (higher risk, higher reward) - Rapid, company-wide implementation of advanced technologies, comprehensive training, and end-to-end process automation.",
          "nodes": [
            {
              "id": "node-C-1",
              "label": "Process Start",
              "type": "start",
              "position": {"x": 50, "y": 100}
            },
            {
              "id": "node-C-2",
              "label": "Requirements Analysis",
              "type": "process",
              "position": {"x": 150, "y": 100}
            },
            {
              "id": "node-C-3",
              "label": "Enterprise CRM + AI",
              "type": "process",
              "position": {"x": 300, "y": 50},
              "status": {"type": "new", "label": "+ New System"}
            },
            {
              "id": "node-C-4",
              "label": "Advanced Automation",
              "type": "process",
              "position": {"x": 300, "y": 150},
              "status": {"type": "new", "label": "+ New System"}
            },
            {
              "id": "node-C-5",
              "label": "Intensive Training",
              "type": "process",
              "position": {"x": 450, "y": 50},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-C-6",
              "label": "Change Management",
              "type": "process",
              "position": {"x": 450, "y": 150},
              "status": {"type": "warning", "label": "⚠ Critical"}
            },
            {
              "id": "node-C-7",
              "label": "Full Integration",
              "type": "process",
              "position": {"x": 600, "y": 100}
            },
            {
              "id": "node-C-8",
              "label": "Real-time Analytics",
              "type": "process",
              "position": {"x": 750, "y": 100},
              "status": {"type": "new", "label": "+ New Process"}
            },
            {
              "id": "node-C-9",
              "label": "Process End",
              "type": "end",
              "position": {"x": 900, "y": 100}
            }
          ],
          "edges": [
            {
              "id": "edge-C-1",
              "source": "node-C-1",
              "target": "node-C-2",
              "label": "Start",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-2",
              "source": "node-C-2",
              "target": "node-C-3",
              "label": "Technology Path",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-3",
              "source": "node-C-2",
              "target": "node-C-4",
              "label": "Automation Path",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-4",
              "source": "node-C-3",
              "target": "node-C-5",
              "label": "Systems Ready",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-5",
              "source": "node-C-4",
              "target": "node-C-6",
              "label": "Automation Ready",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-6",
              "source": "node-C-5",
              "target": "node-C-7",
              "label": "Training Complete",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-7",
              "source": "node-C-6",
              "target": "node-C-7",
              "label": "Change Managed",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-8",
              "source": "node-C-7",
              "target": "node-C-8",
              "label": "System Live",
              "flowType": "optimized"
            },
            {
              "id": "edge-C-9",
              "source": "node-C-8",
              "target": "node-C-9",
              "label": "Optimization Complete",
              "flowType": "optimized"
            }
          ]
        },
        "departments": [
          {
            "id": "dept-C-1",
            "department": "IT",
            "manager": "Sarah Miller",
            "email": "sarah.miller@company.com",
            "tasks": [
              {
                "id": "task-C-1",
                "description": "Implement enterprise-level CRM with AI-driven analytics",
                "priority": "high",
                "deadline": "2025-06-01"
              },
              {
                "id": "task-C-2",
                "description": "Automate key service areas including query resolution",
                "priority": "high",
                "deadline": "2025-06-15"
              },
              {
                "id": "task-C-3",
                "description": "Deploy advanced data-driven decision-making processes",
                "priority": "medium",
                "deadline": "2025-07-01"
              }
            ],
            "emailTemplate": {
              "to": "sarah.miller@company.com",
              "recipient": "Sarah Miller",
              "department": "IT",
              "subject": "Action Required: Aggressive Approach Implementation for IT Department",
              "body": "Dear Sarah Miller,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option C: Aggressive Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Implement enterprise-level CRM with AI-driven analytics (High Priority, Due: June 1, 2025)\n2. Automate key service areas including query resolution (High Priority, Due: June 15, 2025)\n3. Deploy advanced data-driven decision-making processes (Medium Priority, Due: July 1, 2025)\n\nThis optimization is expected to result in a 25-40% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          },
          {
            "id": "dept-C-2",
            "department": "Training",
            "manager": "David Chen",
            "email": "david.chen@company.com",
            "tasks": [
              {
                "id": "task-C-4",
                "description": "Conduct intensive staff training with specialized certifications",
                "priority": "high",
                "deadline": "2025-06-15"
              },
              {
                "id": "task-C-5",
                "description": "Develop change management workshops",
                "priority": "high",
                "deadline": "2025-06-30"
              }
            ],
            "emailTemplate": {
              "to": "david.chen@company.com",
              "recipient": "David Chen",
              "department": "Training",
              "subject": "Action Required: Aggressive Approach Implementation for Training Department",
              "body": "Dear David Chen,\n\nI'm writing regarding our recently approved customer service optimization initiative. We're moving forward with Option C: Aggressive Approach.\n\nThe analysis has identified key areas where your department will play a critical role in implementation:\n\n1. Conduct intensive staff training with specialized certifications (High Priority, Due: June 15, 2025)\n2. Develop change management workshops (High Priority, Due: June 30, 2025)\n\nThis optimization is expected to result in a 25-40% cost reduction. Your team's contribution is essential to our success.\n\nPlease review these tasks and confirm your department's availability for a kickoff meeting next week.\n\nBest regards,\nTARS System\nCustomer Service Optimization Team"
            }
          }
        ]
      }
    }
  }
}