import type { Node } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';

import type { Suggestion } from '@/lib/db/schema';

export const suggestionsPluginKey = new PluginKey('suggestions');

export type ProjectedSuggestion = Suggestion & {
  selectionStart?: number;
  selectionEnd?: number;
};

/**
 * Project suggestions with document positions
 */
export function projectWithPositions(
  doc: Node,
  suggestions: Array<Suggestion>
): ProjectedSuggestion[] {
  return suggestions.map((suggestion) => {
    if (!suggestion.originalText) {
      return suggestion;
    }

    // Find position of the text in the document
    let selectionStart: number | undefined;
    let selectionEnd: number | undefined;

    doc.descendants((node, pos) => {
      if (node.isText) {
        const index = node.text?.indexOf(suggestion.originalText);
        if (index !== -1 && index !== undefined) {
          selectionStart = pos + index;
          selectionEnd = pos + index + suggestion.originalText.length;
          return false;
        }
      }
      return true;
    });

    return {
      ...suggestion,
      selectionStart,
      selectionEnd,
    };
  });
}

/**
 * Plugin for handling suggestions
 */
export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return {
        decorations: DecorationSet.empty,
      };
    },
    apply(tr, prev) {
      const meta = tr.getMeta(suggestionsPluginKey);
      if (meta?.decorations) {
        return {
          decorations: meta.decorations,
        };
      }
      
      if (tr.docChanged && prev.decorations) {
        return {
          decorations: prev.decorations.map(tr.mapping, tr.doc),
        };
      }
      
      return prev;
    },
  },
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      return pluginState ? pluginState.decorations : DecorationSet.empty;
    },
  },
}); 
