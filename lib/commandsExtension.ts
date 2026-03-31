import { type ViewUpdate, ViewPlugin, Decoration, type DecorationSet } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { KNOWN_COMMANDS, KNOWN_COMMAND_NAMES } from './commands';

function buildCommandDecorations(view: import('@codemirror/view').EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      const trimmed = line.text.trimStart();
      if (trimmed.startsWith('/')) {
        const commandName = trimmed.split(/\s/)[0];
        const className = KNOWN_COMMAND_NAMES.has(commandName)
          ? 'cm-command-valid'
          : 'cm-command-invalid';
        builder.add(line.from, line.to, Decoration.mark({ class: className }));
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

export const commandHighlighter = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: import('@codemirror/view').EditorView) {
      this.decorations = buildCommandDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildCommandDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

function commandAutocomplete(context: CompletionContext): CompletionResult | null {
  const line = context.state.doc.lineAt(context.pos);
  const trimmed = line.text.trimStart();
  if (!trimmed.startsWith('/')) return null;

  const leadingSpaces = line.text.length - trimmed.length;
  const from = line.from + leadingSpaces;

  return {
    from,
    options: KNOWN_COMMANDS.map((cmd) => ({
      label: cmd.name,
      detail: cmd.description,
      type: 'keyword',
    })),
    validFor: /^\/\w*$/,
  };
}

export const commandAutocompleteExt = autocompletion({
  override: [commandAutocomplete],
  activateOnTyping: true,
});
