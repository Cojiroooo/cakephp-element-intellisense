import * as vscode from "vscode";
import * as fs from "fs";

export const hoverProvider: vscode.HoverProvider = {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(
      position,
      /\$this->element\(['"]([^'"]+)['"]/
    );
    if (!range) {
      return;
    }

    const elementPath = document
      .getText(range)
      .match(/\$this->element\(['"]([^'"]+)['"]/);
    if (!elementPath) {
      return;
    }

    const elementName = elementPath[1].replace(/\//g, "/");
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    const elementFilePath = `${workspaceRoot}/templates/element/${elementName}.php`;

    if (fs.existsSync(elementFilePath)) {
      const content = fs.readFileSync(elementFilePath, "utf8");
      // 正規表現で@varの行をすべて抽出して、それぞれの行を分ける
      const matches = content.match(/@var\s+.*?\s+\$(\w+)/g);
      if (matches) {
        // 各マッチを改行で分割し、行末にスペース2つを追加してMarkdownの改行に対応
        const hoverText = matches.map((line) => `${line}  `).join("\n");
        return new vscode.Hover(new vscode.MarkdownString(hoverText));
      }
    }
    return;
  },
};
