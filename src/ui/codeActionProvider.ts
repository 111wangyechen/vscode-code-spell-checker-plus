import * as vscode from "vscode";

export class CodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    for (const d of context.diagnostics) {
      const suggestions = (d as any).suggestions as { original: string; replacement: string; score: number }[] | undefined;
      if (!suggestions || suggestions.length === 0) continue;
      for (const s of suggestions.slice(0, 3)) {
        const a = new vscode.CodeAction(`Replace with ${s.replacement}`, vscode.CodeActionKind.QuickFix);
        a.edit = new vscode.WorkspaceEdit();
        a.edit.replace(document.uri, d.range, s.replacement);
        actions.push(a);
      }
    }
    return actions;
  }
}
