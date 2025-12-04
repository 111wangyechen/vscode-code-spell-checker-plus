import { spawn } from "child_process";
import * as path from "path";

type Req = { action: string; [k: string]: any };
type Pending = { resolve: (value: any) => void; reject: (reason: Error) => void };

export class PythonBridge {
  private proc: ReturnType<typeof spawn> | undefined;
  private nextId = 1;
  private pending = new Map<number, Pending>();
  private buffer = "";
  constructor(private pythonPath: string, private basePath: string) {
    const script = path.join(this.basePath, "backend", "main.py");
    this.proc = spawn(this.pythonPath, [script]);
    if (this.proc.stdout) {
      this.proc.stdout.setEncoding("utf8");
      this.proc.stdout.on("data", (d: string | Buffer) => this.onData(d.toString()));
    }
    this.proc.stderr?.setEncoding("utf8");
    this.proc.stderr?.on("data", (data: string | Buffer) => this.rejectAll(new Error(data.toString())));
    this.proc.on("error", (err: Error) => this.rejectAll(err));
    this.proc.on("close", (code: number | null) => this.rejectAll(new Error(`Python process exited with code ${code}`)));
  }
  private onData(chunk: string) {
    this.buffer += chunk;
    let idx;
    while ((idx = this.buffer.indexOf("\n")) >= 0) {
      let line = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 1);
      try {
        line = line.trim();
        if (!line) continue;
        const msg = JSON.parse(line);
        const pending = this.pending.get(msg.id);
        if (pending) {
          this.pending.delete(msg.id);
          pending.resolve(msg.result);
        }
      } catch (err) {
        this.rejectAll(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }
  request(payload: Req): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      if (!this.proc || this.proc.killed) {
        reject(new Error("Python process is not running"));
        return;
      }
      this.pending.set(id, { resolve, reject });
      this.proc.stdin?.write(JSON.stringify({ id, ...payload }) + "\n");
    });
  }
  dispose() {
    this.rejectAll(new Error("Bridge disposed"));
    if (this.proc && !this.proc.killed) {
      this.proc.kill();
    }
    this.proc = undefined;
  }
  private rejectAll(err: Error) {
    for (const [id, pending] of this.pending.entries()) {
      pending.reject(err);
      this.pending.delete(id);
    }
  }
}
