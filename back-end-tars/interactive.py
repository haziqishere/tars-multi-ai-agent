import json
import sys
from agents.agent2_global_intel.search import (
    run_bravesearch,
    run_firecrawl,
    run_search1api,
    run_search_tools
)

PROVIDERS = {
    'a': ('BraveSearch', run_bravesearch),
    'b': ('Firecrawl',   run_firecrawl),
    'd': ('Search1API',  run_search1api),
    'e': ('Sequential',  run_search_tools),
}

def main():
    print("🔍 Agent 2 Interactive CLI")
    print("Select provider:")
    for key, (name, _) in PROVIDERS.items():
        print(f"  {key}) {name}")
    print("Type 'exit' to quit.\n")

    while True:
        choice = input("Provider [a/b/c/d/e]> ").strip().lower()
        if choice == 'exit':
            print("👋 Goodbye!")
            break
        if choice not in PROVIDERS:
            print("⚠️ Invalid choice. Enter a, b, c, d, e or 'exit'.\n")
            continue

        provider_name, func = PROVIDERS[choice]
        print(f"\n--- Testing {provider_name} ---")
        query = input("Query> ").strip()
        if query.lower() == 'exit':
            print("👋 Goodbye!")
            break

        try:
            results = func(query)
            if not results:
                print("⚠️ No results returned.\n")
            else:
                print("\n📊 Results:")
                print(json.dumps(results, indent=2, ensure_ascii=False), "\n")
        except Exception as e:
            print(f"❌ Error running {provider_name}: {e}", file=sys.stderr)
            print()

if __name__ == "__main__":
    main()
