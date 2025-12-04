import time
import subprocess
import json
import os

def run_check(text):
    base = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    script = os.path.join(base, "backend", "main.py")
    p = subprocess.Popen(["python", script], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    req = json.dumps({"id": 1, "action": "check", "text": text}) + "\n"
    p.stdin.write(req)
    p.stdin.flush()
    line = p.stdout.readline()
    return json.loads(line)

def main():
    t0 = time.time()
    res = run_check("teh btnn is visibel")
    t1 = time.time()
    print(json.dumps({"latency_ms": int((t1 - t0)*1000), "result": res}))

if __name__ == "__main__":
    main()
