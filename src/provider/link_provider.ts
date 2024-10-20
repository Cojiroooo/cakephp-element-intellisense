import * as vscode from "vscode";

export const linkProvider: vscode.DocumentLinkProvider = {
  provideDocumentLinks(document: vscode.TextDocument): vscode.DocumentLink[] {
    const text = document.getText();
    // 正規表現でelementのパス部分のみを抽出。第2引数があってもマッチするようにする
    const regex =
      /\$this->element\(\s*['"]([^'"]+)['"]\s*(?:,\s*\[.*?\])?\s*\)/g;
    let match;
    const links: vscode.DocumentLink[] = [];

    // ワークスペースのルートパスを取得
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return links;
    }
    const workspaceRoot = workspaceFolders[0].uri.fsPath;

    while ((match = regex.exec(text)) !== null) {
      // match[1]でelementのパス部分を取得
      const startPos = document.positionAt(
        match.index + match[0].indexOf(match[1])
      );
      const endPos = document.positionAt(
        match.index + match[0].indexOf(match[1]) + match[1].length
      );
      const range = new vscode.Range(startPos, endPos);

      // elementのパスを取得し、フルパスに変換
      const filePath = match[1].replace(/\//g, "/");
      const targetPath = `${workspaceRoot}/templates/element/${filePath}.php`;

      const targetUri = vscode.Uri.file(targetPath);
      const link = new vscode.DocumentLink(range, targetUri);

      links.push(link);
    }

    return links;
  },
};
