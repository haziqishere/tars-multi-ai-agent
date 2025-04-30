import subprocess
import time
import os
import sys
from multiprocessing import Process

def run_agent(command, name, port):
    """Run an agent process directly"""
    print(f"Starting {name} on port {port}...")
    try:
        process = subprocess.Popen(
            ["python3", "-X", "utf8", command, "--port", str(port), "--host", "0.0.0.0"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        print(f"{name} started with PID {process.pid} on port {port}")
        
        # Print output from the agent
        def print_output(pipe, prefix):
            for line in iter(pipe.readline, ''):
                print(f"{prefix}: {line.strip()}")
        
        # Start threads to print output
        import threading
        threading.Thread(target=print_output, args=(process.stdout, f"{name} stdout"), daemon=True).start()
        threading.Thread(target=print_output, args=(process.stderr, f"{name} stderr"), daemon=True).start()
        
        return process
    except Exception as e:
        print(f"Error starting {name}: {e}")
        return None

def main():
    commands = [
        ("run_agent1.py",       "Agent 1",       8001),
        ("run_agent2.py",       "Agent 2",       8002),
        ("run_agent3.py",       "Agent 3 (serve)", 8003),
        ("run_agent4.py",       "Agent 4",       8004),
        ("run_agent5.py",       "Agent 5 (serve)", 8005),
    ]

    processes = []
    print("Starting all agents...")
    for cmd, name, port in commands:
        process = run_agent(cmd, name, port)
        if process:
            processes.append(process)
        time.sleep(2)  # Give each agent time to start up

    print("\nAll agents started. Press Ctrl+C to stop all agents.")
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping all agents...")
        for process in processes:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        print("All agents stopped.")

if __name__ == "__main__":
    main() 