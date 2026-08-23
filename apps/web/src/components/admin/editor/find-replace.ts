import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/core";

export interface Match {
  from: number;
  to: number;
}

export interface FindReplaceStorage {
  term: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  matches: Match[];
  current: number;
}

const findReplaceKey = new PluginKey("findReplace");

declare module "@tiptap/core" {
  interface Storage {
    findReplace: FindReplaceStorage;
  }

  interface Commands<ReturnType> {
    findReplace: {
      setSearch: (
        term: string,
        opts?: { caseSensitive?: boolean; wholeWord?: boolean },
      ) => ReturnType;
      clearSearch: () => ReturnType;
      findNext: () => ReturnType;
      findPrevious: () => ReturnType;
      replaceCurrent: (replacement: string) => ReturnType;
      replaceAll: (replacement: string) => ReturnType;
    };
  }
}

function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Collects every match of `term` in the document.
 *
 * Matching runs per text node, which is how ProseMirror stores text: a phrase
 * split by a bold run lives in two nodes. That means a search term straddling
 * a formatting boundary is not matched — the same behaviour as most editors,
 * and it keeps positions exact.
 */
function collectMatches(
  doc: PMNode,
  term: string,
  caseSensitive: boolean,
  wholeWord: boolean,
): Match[] {
  if (!term) return [];

  const pattern = wholeWord
    ? `(?<![\\p{L}\\p{N}])${escapeRegExp(term)}(?![\\p{L}\\p{N}])`
    : escapeRegExp(term);

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, caseSensitive ? "gu" : "giu");
  } catch {
    return [];
  }

  const matches: Match[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    regex.lastIndex = 0;
    let hit: RegExpExecArray | null;
    while ((hit = regex.exec(node.text)) !== null) {
      matches.push({ from: pos + hit.index, to: pos + hit.index + hit[0].length });
      if (hit[0].length === 0) regex.lastIndex += 1; // guard against empty matches
    }
  });
  return matches;
}

export const FindReplace = Extension.create<
  Record<string, never>,
  FindReplaceStorage
>({
  name: "findReplace",

  addStorage() {
    return {
      term: "",
      caseSensitive: false,
      wholeWord: false,
      matches: [],
      current: 0,
    };
  },

  addCommands() {
    /** Recomputes matches and repaints the highlight decorations. */
    const refresh = (editor: Editor) => {
      editor.view.dispatch(editor.state.tr.setMeta(findReplaceKey, true));
    };

    return {
      setSearch:
        (term, opts) =>
        ({ editor }) => {
          const storage = editor.storage.findReplace;
          storage.term = term;
          if (opts?.caseSensitive !== undefined)
            storage.caseSensitive = opts.caseSensitive;
          if (opts?.wholeWord !== undefined) storage.wholeWord = opts.wholeWord;
          storage.matches = collectMatches(
            editor.state.doc,
            term,
            storage.caseSensitive,
            storage.wholeWord,
          );
          storage.current = 0;
          refresh(editor);
          return true;
        },

      clearSearch:
        () =>
        ({ editor }) => {
          const storage = editor.storage.findReplace;
          storage.term = "";
          storage.matches = [];
          storage.current = 0;
          refresh(editor);
          return true;
        },

      findNext:
        () =>
        ({ editor }) => {
          const storage = editor.storage.findReplace;
          if (!storage.matches.length) return false;
          storage.current = (storage.current + 1) % storage.matches.length;
          const match = storage.matches[storage.current];
          editor.commands.setTextSelection(match);
          editor.commands.scrollIntoView();
          refresh(editor);
          return true;
        },

      findPrevious:
        () =>
        ({ editor }) => {
          const storage = editor.storage.findReplace;
          if (!storage.matches.length) return false;
          storage.current =
            (storage.current - 1 + storage.matches.length) %
            storage.matches.length;
          const match = storage.matches[storage.current];
          editor.commands.setTextSelection(match);
          editor.commands.scrollIntoView();
          refresh(editor);
          return true;
        },

      replaceCurrent:
        (replacement: string) =>
        ({ editor }) => {
          const storage = editor.storage.findReplace;
          const match = storage.matches[storage.current];
          if (!match) return false;

          editor
            .chain()
            .focus()
            .insertContentAt(match, replacement, {
              updateSelection: true,
              parseOptions: { preserveWhitespace: "full" },
            })
            .run();

          // Positions shifted — rebuild from the new document.
          storage.matches = collectMatches(
            editor.state.doc,
            storage.term,
            storage.caseSensitive,
            storage.wholeWord,
          );
          if (storage.current >= storage.matches.length) storage.current = 0;
          refresh(editor);
          return true;
        },

      replaceAll:
        (replacement: string) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.findReplace;
          const matches = collectMatches(
            editor.state.doc,
            storage.term,
            storage.caseSensitive,
            storage.wholeWord,
          );
          if (!matches.length) return false;

          // Replace back-to-front so earlier positions stay valid.
          if (dispatch) {
            for (let i = matches.length - 1; i >= 0; i--) {
              const { from, to } = matches[i];
              tr.insertText(replacement, from, to);
            }
            tr.setMeta(findReplaceKey, true);
            dispatch(tr);
          }

          storage.matches = [];
          storage.current = 0;
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    // Storage is created once and mutated in place, so holding the reference
    // here keeps the plugin reading the same object the commands write to.
    const storage = this.storage;

    return [
      new Plugin({
        key: findReplaceKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            // Recompute whenever the doc changed or a command asked for it.
            if (!tr.docChanged && !tr.getMeta(findReplaceKey)) return old;
            if (!storage.term) return DecorationSet.empty;

            if (tr.docChanged) {
              storage.matches = collectMatches(
                tr.doc,
                storage.term,
                storage.caseSensitive,
                storage.wholeWord,
              );
              if (storage.current >= storage.matches.length) storage.current = 0;
            }

            const decorations = storage.matches.map((match, index) =>
              Decoration.inline(match.from, match.to, {
                class:
                  index === storage.current
                    ? "ln-find-match ln-find-current"
                    : "ln-find-match",
              }),
            );
            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
