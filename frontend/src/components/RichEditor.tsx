'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  minHeightClass?: string;
}

export function RichEditor({
  value,
  onChange,
  placeholder,
  dir = 'auto',
  minHeightClass = 'min-h-[280px]',
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `article-content tiptap-editor focus:outline-none px-4 py-3 ${minHeightClass}`,
        dir,
        'data-placeholder': placeholder || '',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="border border-ink-300 rounded">
        <div className="h-10 bg-surface-100 border-b border-ink-300" />
        <div className={`bg-white ${minHeightClass}`} />
      </div>
    );
  }

  return (
    <div className="border border-ink-300 rounded overflow-hidden bg-white dark:bg-navy-800 dark:border-navy-700">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [, force] = useState(0);

  useEffect(() => {
    const refresh = () => force((n) => n + 1);
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);
    return () => {
      editor.off('selectionUpdate', refresh);
      editor.off('transaction', refresh);
    };
  }, [editor]);

  const btn = (active: boolean, disabled = false) =>
    `px-2 py-1 text-sm rounded transition ${
      active
        ? 'bg-brand-700 text-white'
        : 'text-ink-700 hover:bg-surface-100 dark:text-navy-100 dark:hover:bg-navy-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;

  const promptLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Link URL (leave empty to remove):', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-ink-300 bg-surface-50 dark:bg-navy-700 dark:border-navy-600">
      <button
        type="button"
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btn(false, !editor.can().undo())}
      >
        ↶
      </button>
      <button
        type="button"
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btn(false, !editor.can().redo())}
      >
        ↷
      </button>
      <Divider />
      <select
        value={
          editor.isActive('heading', { level: 2 })
            ? 'h2'
            : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : 'p'
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'p') editor.chain().focus().setParagraph().run();
          else if (v === 'h2')
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          else if (v === 'h3')
            editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        className="text-xs border border-ink-300 rounded px-1.5 py-1 bg-white dark:bg-navy-800 dark:border-navy-600 dark:text-navy-100"
        aria-label="Text style"
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>
      <Divider />
      <button
        type="button"
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
      >
        <b>B</b>
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
      >
        <i>I</i>
      </button>
      <button
        type="button"
        title="Underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive('underline'))}
      >
        <u>U</u>
      </button>
      <button
        type="button"
        title="Strike"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive('strike'))}
      >
        <s>S</s>
      </button>
      <Divider />
      <button
        type="button"
        title="Link"
        onClick={promptLink}
        className={btn(editor.isActive('link'))}
      >
        🔗
      </button>
      <Divider />
      <button
        type="button"
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
      >
        •
      </button>
      <button
        type="button"
        title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
      >
        1.
      </button>
      <button
        type="button"
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
      >
        ❝
      </button>
      <Divider />
      <button
        type="button"
        title="Align left"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={btn(editor.isActive({ textAlign: 'left' }))}
      >
        ⇤
      </button>
      <button
        type="button"
        title="Align center"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={btn(editor.isActive({ textAlign: 'center' }))}
      >
        ↔
      </button>
      <button
        type="button"
        title="Align right"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={btn(editor.isActive({ textAlign: 'right' }))}
      >
        ⇥
      </button>
      <Divider />
      <button
        type="button"
        title="Inline code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btn(editor.isActive('code'))}
      >
        {'<>'}
      </button>
      <button
        type="button"
        title="Clear formatting"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        className={btn(false)}
      >
        ⌫
      </button>
    </div>
  );
}

function Divider() {
  return (
    <span className="w-px h-5 bg-ink-300 mx-0.5 dark:bg-navy-600" />
  );
}
