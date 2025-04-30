import warnings
import sys
import io
import os
from contextlib import redirect_stderr

# Add parent directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from agents.agent2_global_intel.search import run_bravesearch

def test_search(query="latest tech news", limit=3):
    """
    Test the BraveSearch functionality with given parameters
    Returns True if test passes, False otherwise
    """
    print("\n🔍 Starting BraveSearch test...", flush=True)
    print(f"Query: {query}", flush=True)
    print(f"Limit: {limit}", flush=True)
    
    # Suppress resource warnings
    warnings.filterwarnings("ignore", category=ResourceWarning)
    
    # Redirect stderr to suppress pipe errors
    with io.StringIO() as buf, redirect_stderr(buf):
        try:
            print("\n📡 Calling run_bravesearch...", flush=True)
            results = run_bravesearch(query)
            
            if results is None:
                print("❌ Test failed: No results found", flush=True)
                return False
                
            if not isinstance(results, list):
                print(f"❌ Test failed: Expected list but got {type(results)}", flush=True)
                return False

            print(f"✅ Found {len(results)} results", flush=True)
            
            for i, result in enumerate(results, 1):
                if not all(key in result for key in ['title', 'description', 'url']):
                    print(f"❌ Result {i} missing required fields. Got keys: {list(result.keys())}", flush=True)
                    return False
                    
                print(f"\nResult {i}:", flush=True)
                print(f"Title: {result['title']}", flush=True)
                print(f"Description: {result['description']}", flush=True)
                print(f"URL: {result['url']}", flush=True)
            
            print("\n✅ All results contain required fields", flush=True)
            return True
                
        except Exception as e:
            print(f"❌ Error occurred: {str(e)}", flush=True)
            import traceback
            print("\nFull traceback:", flush=True)
            traceback.print_exc()
            return False

def main():
    print("🧪 Running BraveSearch test suite...\n", flush=True)
    success = test_search()
    if success:
        print("\n✅ Test completed successfully", flush=True)
        sys.exit(0)
    else:
        print("\n❌ Test failed", flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
