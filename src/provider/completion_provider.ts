import * as vscode from "vscode";
import * as fs from "fs";

export const elementArgumentCompletionProvider =
  vscode.languages.registerCompletionItemProvider(
    "php",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ): vscode.CompletionItem[] | undefined {
        const textBeforeCursor = document.getText(
          new vscode.Range(new vscode.Position(position.line, 0), position)
        );

        // 連想配列内での補完が発生するかどうかを確認
        const isInsideArray = textBeforeCursor.match(
          /\$this->element\(['"][^'"]+['"],\s*\[\s*$/
        );
        const isAfterComma = textBeforeCursor.match(
          /\$this->element\(['"][^'"]+['"],\s*\[.*?,\s*$/
        ); // カンマの後にスペースを許可

        // 補完が必要な場合のみ提供する
        if (!isInsideArray && !isAfterComma) {
          return;
        }

        const match = textBeforeCursor.match(
          /\$this->element\(['"]([^'"]+)['"]/
        );
        if (!match) {
          return;
        }

        const elementName = match[1].replace(/\//g, "/");
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
          return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const elementFilePath = `${workspaceRoot}/templates/element/${elementName}.php`;

        if (fs.existsSync(elementFilePath)) {
          const content = fs.readFileSync(elementFilePath, "utf8");
          const varMatches = content.match(/@var\s+.*?\s+\$(\w+)/g);
          if (varMatches) {
            // 'params', 'message' などの文字列リテラル形式で補完する
            const completionItems = varMatches.map((match) => {
              const varName = match.split(" ")[2].replace("$", ""); // @var の後の変数名を抽出
              const completionItem = new vscode.CompletionItem(
                `'${varName}'`,
                vscode.CompletionItemKind.Property
              ); // シングルクォートで囲む
              completionItem.insertText = `'${varName}'`; // 補完時にシングルクォート付きで挿入
              return completionItem;
            });
            return completionItems;
          }
        }
        return;
      },
    },
    "[",
    ",",
    " "
  );
