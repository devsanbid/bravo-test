import React from 'react'
import { Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Code,
    Quote,
    Link,
    Undo,
    Redo
  } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface TipTapMenuBarProps {
  editor: Editor
}

export const TipTapMenuBar: React.FC<TipTapMenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex items-center p-2 border-b">
        <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
        >
            <Bold className="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
        >
            <Italic className="h-4 w-4" />
        </Button>
        <Button
        variant="ghost"
        size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
        >
            <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
            <Heading1 className="h-4 w-4" />
        </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('URL', previousUrl);

            // cancelled
            if (url === null) {
              return;
            }

            // empty
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink()
                .run();

              return;
            }

            // update link
            editor.chain().focus().extendMarkRange('link').setLink({ href: url })
              .run();
        }}

        className={editor.isActive('link') ? 'is-active' : ''}
      >
        <Link className="h-4 w-4" />
      </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-4 w-4" />
        </Button>
    </div>
  )
}
