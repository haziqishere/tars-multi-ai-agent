# === File: search.py ===
# Combines config and search functions (Search1API, Brave, Firecrawl)
import os
import re
import json
import requests
import asyncio
import warnings
import random

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

# Disable TLS verification for local/dev; remove or adjust in production
os.environ["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
warnings.filterwarnings("ignore", category=ResourceWarning)

# Load environment variables (API keys, etc.)
load_dotenv()
# print("[DEBUG] FIRECRAWL_API_KEY =", os.getenv("FIRECRAWL_API_KEY"), flush=True)

# Load MCP config for stdio-based servers
with open("MCP.json", "r") as f:
    mcp_config = json.load(f)

# Extract clean query from user message
def extract_search_query(message: str) -> str:
    m = re.match(r'^(search(?: for)?\s+)(.*)$', message, re.IGNORECASE)
    q = m.group(2).strip() if m else message.strip()
    return re.sub(r'\s+', ' ', q)

# 0) REST-based Search1API fallback
def run_search1api(query: str, max_results: int = 3) -> list:
    print("🔎 [Agent 2] Invoking run_search1api() (fallback)", flush=True)
    api_key = os.getenv('SEARCH1API_KEY')
    if not api_key:
        raise RuntimeError('SEARCH1API_KEY not set')
    url = 'https://api.search1api.com/search'
    headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
    payload = {'query': query, 'search_service': 'google', 'max_results': max_results}
    # disable verify in dev environment; set verify to True or specify CA bundle in prod
    resp = requests.post(url, json=payload, headers=headers, timeout=30, verify=False)
    resp.raise_for_status()
    data = resp.json()
    # assume results list in data['results'] or return full body
    return data.get('results', data)

# 1) BRAVESEARCH
async def _brave_call(query: str, count: int) -> list[dict]:
    cfg = mcp_config['mcpServers']['brave-search']
    sp = StdioServerParameters(
        command=cfg['command'],
        args=cfg['args'],
        env={**cfg.get('env', {}), **os.environ},
    )

    async with stdio_client(sp) as (r, w):
        async with ClientSession(r, w) as session:
            await session.initialize()
            resp = await session.call_tool(
                'brave_web_search',
                arguments={'query': query, 'count': count}
            )

    # 1) Gather all text frames into one string
    pieces = []
    for frame in resp.content or []:
        if hasattr(frame, 'text'):
            pieces.append(getattr(frame.text, "value", frame.text))
    raw   = "\n".join(pieces).strip()
    if not raw:
        return []

    # 2) Split on blank lines to isolate each result
    blocks = re.split(r"\n\s*\n", raw)
    results = []
    for block in blocks:
        title = ""
        desc  = ""
        url   = ""
        for line in block.splitlines():
            if line.startswith("Title:"):
                title = line[len("Title:"):].strip()
            elif line.startswith("Description:"):
                desc = line[len("Description:"):].strip()
            elif line.startswith("URL:"):
                url  = line[len("URL:"):].strip()
        # only include if any field is non‐empty
        if title or desc or url:
            results.append({
                "title": title,
                "description": desc,
                "url": url,
            })

    return results

def run_bravesearch(query: str) -> list[dict]:
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        out = loop.run_until_complete(_brave_call(query, count=3))
        return out or []
    except Exception as e:
        print(f"❌ Error in run_bravesearch: {e}", flush=True)
        return []
    finally:
        loop.close()
        asyncio.set_event_loop(None)

# 2) FIRECRAWL
async def _firecrawl_call(query: str, limit=3, lang='en', country='us') -> list[dict]:
    cfg = mcp_config['mcpServers']['firecrawl-mcp']
    sp  = StdioServerParameters(
        command=cfg['command'],
        args=cfg['args'],
        env={**cfg.get('env', {}), **os.environ},
    )

    async with stdio_client(sp) as (r, w):
        async with ClientSession(r, w) as session:
            await session.initialize()
            print("[DEBUG] spawning Firecrawl sidecar:", sp.command, sp.args, flush=True)
            resp = await session.call_tool(
                'firecrawl_search',
                arguments={'query': query, 'limit': limit, 'lang': lang, 'country': country}
            )
            print("[DEBUG] Firecrawl raw frames:", resp.content, flush=True)

    # 1) Gather all text frames
    pieces = []
    for frame in resp.content or []:
        if hasattr(frame, 'text'):
            pieces.append(getattr(frame.text, "value", frame.text))
    raw = "\n".join(pieces).strip()
    if not raw:
        return []

    # 2) Split into blocks
    blocks = re.split(r"\n\s*\n", raw)
    results = []

    for block in blocks:
        title = ""
        snippet = ""
        url = ""
        for line in block.splitlines():
            if line.startswith("Title:"):
                title = line[len("Title:"):].strip()
            elif line.startswith("Description:"):
                snippet = line[len("Description:"):].strip()
            elif line.startswith("URL:"):
                url = line[len("URL:"):].strip()
        # only include if we got anything
        if title or snippet or url:
            results.append({
                "title": title,
                "snippet": snippet,
                "url": url,
                # optional: pull a date field if Firecrawl gives one
                "published_date": ""
            })

    return results

def run_firecrawl(query: str, limit: int = 3, lang: str = 'en', country: str = 'us') -> list:
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        out = loop.run_until_complete(_firecrawl_call(query, limit, lang, country))
        return out or []
    except Exception as e:
        print(f"❌ Error in run_firecrawl: {e}", flush=True)
        return []
    finally:
        loop.close()
        asyncio.set_event_loop(None)

# # Dispatcher: sequential failover before REST fallback
# def run_search_tools(user_query: str) -> list:
#     q = extract_search_query(user_query)

#     # primary providers
#     providers = [
#         ('brave', run_bravesearch),
#         ('firecrawl', run_firecrawl),
#     ]

#     # pick one provider at random
#     name, func = random.choice(providers)
#     print(f"🔍 [Agent 2] randomly selected {name}…", flush=True)
#     #debug
#     print(f"[DEBUG] provider order: {[p[0] for p in providers]}, selected: {name}")

#     # try it
#     try:
#         results = func(q)
#         if results:
#             print(f"✅ [Agent 2] {name} returned {len(results)} items", flush=True)
#             return results
#         else:
#             print(f"⚠️ [Agent 2] {name} returned no results", flush=True)
#     except Exception as e:
#         print(f"❌ [Agent 2] {name} error: {e}", flush=True)

#     # if that one failed or was empty, try the other once
#     other_name, other_func = next(p for p in providers if p[0] != name)
#     print(f"🔍 [Agent 2] trying fallback provider {other_name}…", flush=True)
#     try:
#         results = other_func(q)
#         if results:
#             print(f"✅ [Agent 2] {other_name} returned {len(results)} items", flush=True)
#             return results
#         else:
#             print(f"⚠️ [Agent 2] {other_name} returned no results", flush=True)
#     except Exception as e:
#         print(f"❌ [Agent 2] {other_name} error: {e}", flush=True)

#     # last resort
#     print("🔍 [Agent 2] all primary providers failed, falling back to Search1API", flush=True)
#     return run_search1api(q)

# Dispatcher: firecrawl only for now
def run_search_tools(user_query: str) -> list:
    q = extract_search_query(user_query)
    
    print("🔍 [Agent 2] forcing Firecrawl…", flush=True)
    # Directly call Firecrawl
    try:
        results = run_firecrawl(q)
        print(f"✅ [Agent 2] firecrawl returned {len(results)} items", flush=True)
        if results:
            return results
        else:
            print("⚠️ [Agent 2] firecrawl returned no results", flush=True)
    except Exception as e:
        print(f"❌ [Agent 2] firecrawl error: {e}", flush=True)
    
    # Fallback to Search1API
    print("🔍 [Agent 2] falling back to Search1API", flush=True)
    return run_search1api(q)
