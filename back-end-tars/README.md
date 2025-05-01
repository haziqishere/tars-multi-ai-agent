# TARS Multi-Agent System

A powerful business process optimization system utilizing five specialized AI agents working together through a unified FastAPI application.

## Architecture

TARS uses a pipeline-based approach where specialized agents collaborate:

1. **Enterprise Knowledge Agent**: Retrieves information from internal company documents
2. **Global Intelligence Agent**: Searches for external information using search services
3. **Consultant Agent**: Central coordinator that analyzes and formulates responses
4. **Outcome Predictor Agent**: Generates strategic options with different implementation paths
5. **Task Dispatcher Agent**: Converts decisions into actionable tasks for departments

## Setup

1. Create a Python virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env`:
   ```
   AZURE_CONN_STRING=your_connection_string
   AGENT1_ID=your_agent1_id
   AGENT2_ID=your_agent2_id
   AGENT3_ID=your_agent3_id
   AGENT4_ID=your_agent4_id
   AGENT5_ID=your_agent5_id
   SEARCH1API_KEY=your_search_api_key
   PORT=8000
   DEBUG=true
   ```

## Running the Application

Start the FastAPI server:

```
python run.py
```

The API will be available at http://localhost:8000, with the main endpoint at `/api/optimization` for processing optimization requests.

## API Example

Send a POST request to `/api/optimization` with a JSON body:

```json
{
  "query": "How can we optimize our manufacturing supply chain process?"
}
```

The response will include comprehensive analysis and recommendations. 