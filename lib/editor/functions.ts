import type { Node } from 'prosemirror-model';
import type { DecorationSet, EditorView } from 'prosemirror-view';

import type { ProjectedSuggestion } from './suggestions';

/**
 * Builds a string representation of a document
 */
export function buildContentFromDocument(doc: Node): string {
  let content = '';
  
  doc.forEach((node) => {
    if (node.textContent) {
      content += `${node.textContent}\n`;
    }
  });
  
  return content.trim();
}

/**
 * Builds a document from a string content
 */
export function buildDocumentFromContent(content: string): Node {
  const { doc } = require('./config').documentSchema.nodeFromJSON({
    type: 'doc',
    content: content
      .split('\n')
      .map((paragraph) => ({
        type: 'paragraph',
        content: paragraph
          ? [
              {
                type: 'text',
                text: paragraph,
              },
            ]
          : [],
      })),
  });
  
  return doc;
}

/**
 * Creates a decoration set for suggestions
 */
export function createDecorations(
  suggestions: ProjectedSuggestion[],
  editorView: EditorView
): DecorationSet {
  const { Decoration, DecorationSet } = require('prosemirror-view');
  
  if (!suggestions || !suggestions.length) {
    return DecorationSet.empty;
  }
  
  const decorations = suggestions.flatMap((suggestion) => {
    if (!suggestion.selectionStart || !suggestion.selectionEnd) {
      return [];
    }
    
    return [
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: 'suggestion',
          'data-suggestion-id': suggestion.id,
        }
      ),
    ];
  });
  
  return DecorationSet.create(editorView.state.doc, decorations);
} 