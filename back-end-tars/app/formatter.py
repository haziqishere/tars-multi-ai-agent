from typing import Dict, Any, List, Optional
import logging
import json
import re
from datetime import datetime

from app.utils.logging import get_logger

logger = get_logger("formatter")

def format_response(context: Dict[str, Any]) -> Dict[str, Any]:
    """Format agent results into the standardized API response"""
    
    # Extract data from agent results
    agent3_data = context.get("results", {}).get("agent3", {})
    agent4_data = context.get("results", {}).get("agent4", {})
    agent5_data = context.get("results", {}).get("agent5", {})
    
    # Check for fallback data
    agent_status = context.get("agent_status", {})
    is_agent3_fallback = agent_status.get("agent3") != "completed" or agent3_data.get("is_fallback", False)
    is_agent4_fallback = agent_status.get("agent4") != "completed" or agent4_data.get("is_fallback", False)
    is_agent5_fallback = agent_status.get("agent5") != "completed" or agent5_data.get("is_fallback", False)
    
    logger.info(f"Formatting response with fallback status: Agent3={is_agent3_fallback}, Agent4={is_agent4_fallback}, Agent5={is_agent5_fallback}")
    
    # Create business flow visualization
    business_flow = create_business_flow(agent3_data, agent4_data)
    
    # Create analytics data
    analytics_data = create_analytics_data(agent3_data, agent4_data)
    
    # Create news and impact data
    news_impact_data = create_news_impact(agent3_data)
    
    # Create recommendation options
    options = create_options(agent4_data, agent5_data)
    
    # Create summary card (if available)
    summary_card = agent5_data.get("summary_card")
    
    # Create chat response
    chat_response = agent3_data.get("enhanced_answer", 
                    "I've analyzed your request and generated optimization options. " +
                    "You can review the detailed analysis and recommendations below.")
    
    # Add fallback indicators for clarity
    if is_agent3_fallback:
        business_flow["fallback_data"] = True
        analytics_data["fallback_data"] = True
        news_impact_data["fallback_data"] = True
        chat_response += " [FALLBACK RESPONSE]"
    
    if is_agent4_fallback:
        options_with_fallback = []
        for option in options:
            option["fallback_data"] = True
            options_with_fallback.append(option)
        options = options_with_fallback
    
    if is_agent5_fallback and summary_card:
        summary_card["fallback_data"] = True
    
    # Return formatted response
    return {
        "analysis": {
            "businessFlow": business_flow,
            "analytics": analytics_data,
            "newsAndImpact": news_impact_data
        },
        "recommendations": {
            "options": options
        },
        "chatResponse": chat_response,
        "summaryCard": summary_card,
        "placeholder_indicators": {
            "agent3_fallback": is_agent3_fallback,
            "agent4_fallback": is_agent4_fallback,
            "agent5_fallback": is_agent5_fallback
        }
    }

def create_business_flow(agent3_data: Dict[str, Any], agent4_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create business flow visualization data"""
    # Extract from contexts to find business processes
    internal_context = agent3_data.get("internal_context", "")
    external_context = agent3_data.get("external_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    # Try to find process steps or workflow in the text
    processes = extract_processes(internal_context + "\n" + external_context + "\n" + enhanced_answer)
    
    # If no processes found, create a basic flow
    if not processes:
        processes = ["Input/Start", "Assessment", "Processing", "Quality Control", "Output/End"]
    
    # Create nodes and edges
    nodes = []
    edges = []
    
    # Generate positions (simple left-to-right layout)
    width = 800
    height = 200
    step_width = width / (len(processes) + 1)
    
    for i, process in enumerate(processes):
        # Add node
        node_id = f"node-{i+1}"
        node_type = "start" if i == 0 else "end" if i == len(processes) - 1 else "process"
        
        nodes.append({
            "id": node_id,
            "label": process,
            "type": node_type,
            "position": {
                "x": (i + 1) * step_width,
                "y": height / 2
            }
        })
        
        # Add edge if not the first node
        if i > 0:
            edge_id = f"edge-{i}"
            source_id = f"node-{i}"
            target_id = node_id
            
            edges.append({
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "label": f"Step {i}"
            })
    
    return {
        "nodes": nodes,
        "edges": edges
    }

def extract_processes(text: str) -> List[str]:
    """Extract process steps from text"""
    # Try to find lines with "process", "step", "workflow" etc.
    processes = []
    
    # Look for numbered or bulleted lists
    lines = text.split("\n")
    
    # Pattern for numbered/bulleted items that might be process steps
    step_pattern = r"^(?:\d+\.\s+|\*\s+|-\s+)(.+)$"
    
    for line in lines:
        line = line.strip()
        match = re.match(step_pattern, line)
        if match and len(processes) < 10:  # Limit to 10 steps
            step_text = match.group(1)
            # Only include if reasonably short
            if 3 <= len(step_text) <= 30 and step_text not in processes:
                processes.append(step_text)
    
    # If we still don't have enough processes, look for likely process steps in the text
    if len(processes) < 3:
        process_indicators = ["process", "workflow", "step", "stage", "phase"]
        for indicator in process_indicators:
            pattern = rf"{indicator}[:\s]+([^\.]+)"
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if 3 <= len(match) <= 30 and match not in processes:
                    processes.append(match.strip())
                    if len(processes) >= 10:
                        break
            if len(processes) >= 10:
                break
    
    return processes

def create_analytics_data(agent3_data: Dict[str, Any], agent4_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create analytics data"""
    # Extract from contexts to find metrics
    internal_context = agent3_data.get("internal_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    # Try to extract financial metrics
    cost_match = re.search(r"(?:cost|expense|budget)[:\s]+\$?(\d[\d,\.]*\d)(?:k|m)?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    
    current_annual_cost = 0
    if cost_match:
        cost_str = cost_match.group(1).replace(",", "")
        try:
            current_annual_cost = float(cost_str)
            # Adjust for k/m notation
            if "k" in cost_match.group(0).lower():
                current_annual_cost *= 1000
            elif "m" in cost_match.group(0).lower():
                current_annual_cost *= 1000000
        except ValueError:
            current_annual_cost = 5000000  # Fallback
    else:
        current_annual_cost = 5000000  # Fallback
    
    # Try to extract efficiency rating
    efficiency_match = re.search(r"(?:efficiency|productive|performance)[:\s]+(\d+)%?", 
                               internal_context + enhanced_answer, re.IGNORECASE)
    efficiency_rating = int(efficiency_match.group(1)) if efficiency_match else 65
    
    # Try to extract process time
    time_match = re.search(r"(?:time|duration|cycle)[:\s]+(\d+\.?\d*)(?:\s+(?:days|hours|weeks))?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    avg_process_time = float(time_match.group(1)) if time_match else 12.5
    
    # Try to extract risk assessment
    risk_match = re.search(r"(?:risk|vulnerability|exposure)[:\s]+(\d+)%?", 
                          internal_context + enhanced_answer, re.IGNORECASE)
    risk_assessment = int(risk_match.group(1)) if risk_match else 45
    
    # Determine trends based on context
    cost_trend = "increasing"
    if "reduce cost" in enhanced_answer.lower() or "cost reduction" in enhanced_answer.lower():
        cost_trend = "decreasing"
    
    efficiency_trend = "stable"
    if "improve efficiency" in enhanced_answer.lower() or "efficiency gain" in enhanced_answer.lower():
        efficiency_trend = "improving"
    
    time_trend = "stable"
    if "faster" in enhanced_answer.lower() or "reduce time" in enhanced_answer.lower():
        time_trend = "decreasing"
    
    risk_trend = "stable"
    if "mitigate risk" in enhanced_answer.lower() or "reduce risk" in enhanced_answer.lower():
        risk_trend = "improving"
    
    return {
        "currentAnnualCost": current_annual_cost,
        "efficiencyRating": efficiency_rating,
        "averageProcessTime": avg_process_time,
        "riskAssessment": risk_assessment,
        "trends": {
            "costTrend": cost_trend,
            "efficiencyTrend": efficiency_trend,
            "timeTrend": time_trend,
            "riskTrend": risk_trend
        }
    }

def create_news_impact(agent3_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create news and impact data"""
    external_context = agent3_data.get("external_context", "")
    enhanced_answer = agent3_data.get("enhanced_answer", "")
    
    news_items = []
    impact_items = []
    
    # Extract news items from external context
    news_sections = re.split(r'\n\d+\.', external_context)
    
    for i, section in enumerate(news_sections[1:], 1):  # Skip the first split which is before any numbers
        if not section.strip():
            continue
            
        # Extract title and description
        lines = section.strip().split("\n")
        title = lines[0].strip() if lines else f"Industry Update {i}"
        description = " ".join(lines[1:]).strip() if len(lines) > 1 else section.strip()
        
        # Determine impact
        impact = "neutral"
        if any(word in section.lower() for word in ["positive", "increase", "growth", "opportunity", "improvement"]):
            impact = "positive"
        elif any(word in section.lower() for word in ["negative", "decrease", "decline", "risk", "threat", "problem"]):
            impact = "negative"
        
        # Generate a date (recent)
        month = datetime.now().strftime("%B")
        day = min(28, (i * 3) % 28)
        year = datetime.now().year
        date = f"{month} {day}, {year}"
        
        news_items.append({
            "id": f"news-{i}",
            "title": title,
            "date": date,
            "impact": impact,
            "description": description[:200]  # Limit length
        })
        
        # Only include up to 3 news items
        if len(news_items) >= 3:
            break
    
    # If no news items found, create fallback
    if not news_items:
        news_items = [
            {
                "id": "news-1",
                "title": "Industry Trends Report Released",
                "date": datetime.now().strftime("%B %d, %Y"),
                "impact": "neutral",
                "description": "New industry report highlights changing market dynamics and opportunities for optimization."
            }
        ]
    
    # Extract impact items from the enhanced answer
    # Look for sections about implications, impacts, risks, etc.
    impact_sections = []
    
    # Look for potential impact statements
    lines = enhanced_answer.split("\n")
    in_impact_section = False
    current_section = ""
    
    for line in lines:
        # Check if this is a heading for impacts, risks, etc.
        if re.match(r"^#+\s+(?:impact|risk|implication|consideration)", line, re.IGNORECASE):
            if current_section:
                impact_sections.append(current_section)
            current_section = line
            in_impact_section = True
        elif in_impact_section:
            # Check if this is a new heading (but not an impact heading)
            if re.match(r"^#+\s+", line) and not re.match(r"^#+\s+(?:impact|risk|implication|consideration)", line, re.IGNORECASE):
                in_impact_section = False
                if current_section:
                    impact_sections.append(current_section)
                current_section = ""
            else:
                current_section += "\n" + line
    
    # Add the last section if it exists
    if current_section and in_impact_section:
        impact_sections.append(current_section)
    
    # If no specific sections found, look for bullet points that might be impacts
    if not impact_sections:
        for line in lines:
            if re.match(r"^[-*]\s+", line) and len(line) > 10:
                impact_sections.append(line)
    
    # Create impact items from the sections
    for i, section in enumerate(impact_sections, 1):
        if len(impact_items) >= 3:  # Limit to 3 items
            break
            
        # Extract title and description
        section_lines = section.strip().split("\n")
        title = section_lines[0].strip()
        # Remove markdown heading symbols
        title = re.sub(r"^#+\s+", "", title)
        # Remove bullet point symbols
        title = re.sub(r"^[-*]\s+", "", title)
        
        description = " ".join(section_lines[1:]).strip() if len(section_lines) > 1 else ""
        if not description:
            description = title
            title = f"Impact Factor {i}"
        
        # Generate probability and impact scores
        probability = 50 + (i * 10) % 40  # Range from 50-90
        impact_score = 60 + (i * 15) % 35  # Range from 60-95
        
        impact_items.append({
            "id": f"impact-{i}",
            "title": title,
            "description": description[:200],  # Limit length
            "probability": probability,
            "impact": impact_score
        })
    
    # If no impact items found, create fallback
    if not impact_items:
        impact_items = [
            {
                "id": "impact-1",
                "title": "Process Efficiency Improvement",
                "description": "Implementing the recommended changes could lead to significant process efficiency improvements.",
                "probability": 75,
                "impact": 80
            },
            {
                "id": "impact-2",
                "title": "Cost Reduction",
                "description": "Potential for 15-20% cost reduction through optimization of resource allocation.",
                "probability": 70,
                "impact": 85
            }
        ]
    
    return {
        "newsItems": news_items,
        "impactItems": impact_items
    }

def create_options(agent4_data: Dict[str, Any], agent5_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Create recommendation options"""
    branches = agent4_data.get("branches", {})
    selected_branch = agent4_data.get("selected_branch", "B")
    
    options = []
    
    # Process each branch (A, B, C) into an option
    for branch_id in ["A", "B", "C"]:
        branch_data = branches.get(branch_id, {})
        if not branch_data:
            continue
            
        # Determine if this is the selected/recommended branch
        is_selected = branch_id == selected_branch
        
        # Create nodes and edges for this option (simplified flow)
        option_nodes = []
        option_edges = []
        
        # Generate sample process flow based on action items
        action_items = branch_data.get("action_items", [])
        
        # Ensure we have at least some action items
        if not action_items:
            action_items = [
                "Analyze current process",
                "Implement improvements",
                "Monitor results"
            ]
        
        # Create a simple flow from start to end with these items as nodes
        width = 800
        height = 200
        step_width = width / (len(action_items) + 2)  # +2 for start/end
        
        # Add start node
        option_nodes.append({
            "id": "node-1",
            "label": "Start",
            "type": "start",
            "position": {"x": step_width, "y": height / 2}
        })
        
        # Add action item nodes
        for i, item in enumerate(action_items, 2):
            option_nodes.append({
                "id": f"node-{i}",
                "label": item,
                "type": "process",
                "position": {"x": i * step_width, "y": height / 2}
            })
        
        # Add end node
        option_nodes.append({
            "id": f"node-{len(action_items) + 2}",
            "label": "End",
            "type": "end",
            "position": {"x": (len(action_items) + 2) * step_width, "y": height / 2}
        })
        
        # Create edges connecting all nodes in sequence
        for i in range(1, len(option_nodes)):
            option_edges.append({
                "id": f"edge-{i}",
                "source": f"node-{i}",
                "target": f"node-{i + 1}",
                "label": f"Step {i}",
                "flowType": "optimized" if is_selected else "standard"
            })
        
        # Create financial impact metrics
        cost = branch_data.get("cost", 100000 * (1 + int(branch_id.replace("A", "1").replace("B", "2").replace("C", "3"))))
        time = branch_data.get("time", 3 * int(branch_id.replace("A", "1").replace("B", "2").replace("C", "3")))
        
        # Calculate projected costs and metrics based on branch data
        current_annual_cost = 5000000  # Default
        cost_reduction_pct = 0
        
        if branch_id == "A":
            cost_reduction_pct = 10  # Conservative
        elif branch_id == "B":
            cost_reduction_pct = 20  # Balanced
        elif branch_id == "C":
            cost_reduction_pct = 30  # Aggressive
        
        projected_cost = current_annual_cost * (1 - cost_reduction_pct / 100)
        
        financial_impact = [
            {
                "metricName": "Annual Operating Costs",
                "current": current_annual_cost,
                "projected": projected_cost,
                "change": -cost_reduction_pct,
                "unit": "$"
            },
            {
                "metricName": "Process Time",
                "current": 14.5,
                "projected": 14.5 * (1 - cost_reduction_pct / 100),
                "change": -cost_reduction_pct,
                "unit": "days"
            }
        ]
        
        # Create implementation plan
        implementation_plan = []
        departments = ["IT", "Operations", "Finance", "HR"]
        
        for i, item in enumerate(action_items, 1):
            dept = departments[i % len(departments)]
            implementation_plan.append({
                "id": f"task-{branch_id}-{i}",
                "department": dept,
                "task": item,
                "duration": f"{(i + 1) * 2} weeks",
                "status": "pending"
            })
        
        # Create the option
        summary = branch_data.get("summary", f"Option {branch_id}")
        if len(summary) < 10:
            summary = f"Option {branch_id}: {summary}"
            
        # Use first pros as part of description if summary is too short
        description = summary
        if len(description) < 30 and branch_data.get("pros"):
            description += f" - {branch_data.get('pros')[0]}"
        
        options.append({
            "id": f"option-{branch_id}",
            "title": summary,
            "description": description,
            "timeToImplement": f"{time} months",
            "costReduction": f"{cost_reduction_pct}% cost reduction",
            "additionalMetrics": [
                {
                    "label": "Implementation Cost",
                    "value": f"${cost:,}"
                },
                {
                    "label": "ROI",
                    "value": f"{int(200 - cost / (cost_reduction_pct * current_annual_cost / 100) * 100)}% in 12 months"
                }
            ],
            "nodes": option_nodes,
            "edges": option_edges,
            "financialImpact": financial_impact,
            "implementationPlan": implementation_plan
        })
    
    # If no options were created, provide a fallback
    if not options:
        options = [
            {
                "id": "option-1",
                "title": "Process Optimization Strategy",
                "description": "Implement process improvements to reduce costs and improve efficiency",
                "timeToImplement": "3-6 months",
                "costReduction": "15% cost reduction",
                "additionalMetrics": [
                    {
                        "label": "ROI",
                        "value": "125% in 12 months"
                    },
                    {
                        "label": "Risk Reduction",
                        "value": "30%"
                    }
                ],
                "nodes": [
                    {"id": "node-1", "label": "Start", "type": "start", "position": {"x": 100, "y": 100}},
                    {"id": "node-2", "label": "Process Analysis", "type": "process", "position": {"x": 250, "y": 100}},
                    {"id": "node-3", "label": "Implement Changes", "type": "process", "position": {"x": 400, "y": 100}},
                    {"id": "node-4", "label": "Monitor Results", "type": "process", "position": {"x": 550, "y": 100}},
                    {"id": "node-5", "label": "End", "type": "end", "position": {"x": 700, "y": 100}}
                ],
                "edges": [
                    {"id": "edge-1", "source": "node-1", "target": "node-2", "label": "Step 1"},
                    {"id": "edge-2", "source": "node-2", "target": "node-3", "label": "Step 2"},
                    {"id": "edge-3", "source": "node-3", "target": "node-4", "label": "Step 3"},
                    {"id": "edge-4", "source": "node-4", "target": "node-5", "label": "Step 4"}
                ],
                "financialImpact": [
                    {
                        "metricName": "Annual Operating Costs",
                        "current": 5000000,
                        "projected": 4250000,
                        "change": -15,
                        "unit": "$"
                    },
                    {
                        "metricName": "Process Time",
                        "current": 14.5,
                        "projected": 10.2,
                        "change": -30,
                        "unit": "days"
                    }
                ],
                "implementationPlan": [
                    {
                        "id": "task-1",
                        "department": "IT",
                        "task": "Implement system updates",
                        "duration": "4 weeks",
                        "status": "pending"
                    },
                    {
                        "id": "task-2",
                        "department": "Operations",
                        "task": "Process restructuring",
                        "duration": "6 weeks",
                        "status": "pending"
                    },
                    {
                        "id": "task-3",
                        "department": "HR",
                        "task": "Staff training",
                        "duration": "3 weeks",
                        "status": "pending"
                    }
                ]
            }
        ]
    
    return options 