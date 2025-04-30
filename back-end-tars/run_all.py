import subprocess
import time
import os
import sys

def run_command(command, name):
    """Run a command in a new terminal window"""
    if sys.platform.startswith('win'):
        terminal_command = [
            'start',
            'cmd',
            '/K',
            f"title {name} && python -X utf8 {command}"
        ]
        subprocess.Popen(terminal_command, shell=True)
    elif sys.platform == 'darwin':  # macOS
        current_dir = os.getcwd()
        # Escape the path properly for AppleScript
        apple_script = f'''
        tell application "Terminal"
            do script "cd '{current_dir}' && python3 -X utf8 {command} && echo '\n[{name} finished]'"
            set custom title of front window to "{name}"
        end tell
        '''
        subprocess.Popen(['osascript', '-e', apple_script])
    else:  # Linux
        terminal_command = [
            'gnome-terminal',
            '--',
            'python',
            '-X',
            'utf8',
            *command.split()
        ]
        subprocess.Popen(terminal_command)

def main():
    commands = [
        ("run_agent1.py",       "Agent 1"),
        ("run_agent2.py",       "Agent 2"),
        ("run_agent3.py",       "Agent 3 (serve)"),
        ("run_agent3.py chat",  "Agent 3 (chat)"),
        ("run_agent4.py",       "Agent 4"),
        ("run_agent5.py",       "Agent 5 (serve)"),
        # ("run_agent5.py chat",  "Agent 5 (chat)"),
    ]

    print("Starting all agents in separate terminals...")
    for cmd, name in commands:
        try:
            run_command(cmd, name)
            time.sleep(1)  # small delay between launches
        except Exception as e:
            print(f"Error launching {name}: {e}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nLaunch process interrupted by user")
        sys.exit(0)