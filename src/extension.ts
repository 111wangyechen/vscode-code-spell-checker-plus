import * as vscode from "vscode";
import { SpellCheckerClient } from "./core/spellCheckerClient";
import { CodeActionProvider } from "./ui/codeActionProvider";

let client: SpellCheckerClient | undefined;
let diagnostics: vscode.DiagnosticCollection | undefined;

async function analyzeDocument(doc: vscode.TextDocument) {
  if (!client || !diagnostics) return;
  const text = doc.getText();
  const result = await client.checkText(text);
  const ds: vscode.Diagnostic[] = [];
  for (const err of result.errors) {
    const relatedSuggestions = result.suggestions.filter(s => s.original === err.word);
    const r = new vscode.Range(doc.positionAt(err.start), doc.positionAt(err.end));
    const message = `可能的拼写错误：${err.word}`;
    const d = new vscode.Diagnostic(r, message, vscode.DiagnosticSeverity.Warning);
    // suggestions 可能为空，这时只会有黄线，不会有 Quick Fix
    (d as any).suggestions = relatedSuggestions.slice(0, 5);
    ds.push(d);
  }
  diagnostics.set(doc.uri, ds);
}

export async function activate(context: vscode.ExtensionContext) {
  diagnostics = vscode.languages.createDiagnosticCollection("spellChecker");
  client = new SpellCheckerClient(context);
  context.subscriptions.push(diagnostics);
  context.subscriptions.push(vscode.commands.registerCommand("spellChecker.scan", async () => {
    const doc = vscode.window.activeTextEditor?.document;
    if (doc) await analyzeDocument(doc);
  }));
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider({ scheme: "file" }, new CodeActionProvider(), { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }));
  const openListener = vscode.workspace.onDidOpenTextDocument(async d => { await analyzeDocument(d); });
  const changeListener = vscode.workspace.onDidChangeTextDocument(async e => { await analyzeDocument(e.document); });
  context.subscriptions.push(openListener, changeListener);
  const doc = vscode.window.activeTextEditor?.document;
  if (doc) await analyzeDocument(doc);
}

export function deactivate() {
  diagnostics?.dispose();
  client?.dispose();
}
