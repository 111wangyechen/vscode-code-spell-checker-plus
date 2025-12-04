import * as vscode from "vscode";
import { PythonBridge } from "../bridge/pythonBridge";

type ErrorItem = { start: number; end: number; word: string };
type SuggestionItem = { original: string; replacement: string; score: number };

export class SpellCheckerClient {
  private bridge: PythonBridge;
  constructor(context?: vscode.ExtensionContext) {
    const pythonPath = vscode.workspace.getConfiguration("spellChecker").get<string>("pythonPath") || "python";
    const base = context?.extensionPath || process.cwd();
    this.bridge = new PythonBridge(pythonPath, base);
  }
  async checkText(text: string): Promise<{ errors: ErrorItem[]; suggestions: SuggestionItem[] }> {
    const languages = vscode.workspace.getConfiguration("spellChecker").get<string[]>("enabledLanguages") || ["en", "zh", "ja"];
    try {
      const res = await this.bridge.request({ action: "check", text, languages });
      return { errors: res.errors || [], suggestions: res.suggestions || [] };
    } catch {
      return { errors: [], suggestions: [] };
    }
  }
  async suggest(word: string): Promise<SuggestionItem[]> {
    try {
      const res = await this.bridge.request({ action: "suggest", word });
      return res.suggestions || [];
    } catch {
      return [];
    }
  }
  dispose() {
    this.bridge.dispose();
  }
}
