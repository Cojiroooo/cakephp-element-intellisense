import * as vscode from "vscode";
import { elementArgumentCompletionProvider } from "./provider/completion_provider";
import { hoverProvider } from "./provider/hover_provider";
import { linkProvider } from "./provider/link_provider";

export function activate(context: vscode.ExtensionContext) {
  const params = {
    schema: "file",
    language: "php",
  };
  context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider(params, linkProvider),
    vscode.languages.registerHoverProvider(
      params,
      hoverProvider
    ),
    elementArgumentCompletionProvider
  );
}

export function deactivate() {}
