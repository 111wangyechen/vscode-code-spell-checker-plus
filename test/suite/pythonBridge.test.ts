import { expect } from "chai";
import { PythonBridge } from "../../src/bridge/pythonBridge";

describe("PythonBridge", () => {
  it("responds to ping", async () => {
    const bridge = new PythonBridge("python", process.cwd());
    const res = await bridge.request({ action: "ping" });
    expect(res.ok).to.equal(true);
  });
  it("checks text and returns errors", async () => {
    const bridge = new PythonBridge("python", process.cwd());
    const res = await bridge.request({ action: "check", text: "teh btnn" });
    expect(res.errors.length).to.be.greaterThan(0);
    expect(res.suggestions.length).to.be.greaterThan(0);
  });
});
