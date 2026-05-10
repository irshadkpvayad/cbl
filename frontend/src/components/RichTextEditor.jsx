import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight } from "lowlight";
import { Bold, Code, Heading1, Heading2, ImagePlus, Italic, Link as LinkIcon, List, Quote, Table2 } from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";

const lowlight = createLowlight();

export default function RichTextEditor({ value, onChange }) {
  const { uploadImage } = useAuth();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write a polished article with headings, media, code, and useful details..." })
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose-grid"
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    }
  });

  if (!editor) return null;

  const addImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    editor.chain().focus().setImage({ src: url, alt: file.name, loading: "lazy" }).run();
  };

  const buttons = [
    [Bold, () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold"],
    [Italic, () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic"],
    [Heading1, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), "Heading"],
    [Heading2, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }), "Subheading"],
    [List, () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "List"],
    [Quote, () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "Quote"],
    [Code, () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"), "Code"],
    [Table2, () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), false, "Table"],
    [LinkIcon, () => {
      const url = window.prompt("Paste URL");
      if (url) editor.chain().focus().setLink({ href: url }).run();
    }, editor.isActive("link"), "Link"]
  ];

  return (
    <div className="editor">
      <div className="mb-3 flex flex-wrap gap-2">
        {buttons.map(([Icon, action, active, label]) => (
          <button key={label} type="button" onClick={action} className={`btn-soft h-10 w-10 px-0 ${active ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : ""}`} title={label}>
            <Icon size={17} />
          </button>
        ))}
        <label className="btn-soft h-10 w-10 cursor-pointer px-0" title="Upload image">
          <ImagePlus size={17} />
          <input type="file" accept="image/*" className="hidden" onChange={addImage} />
        </label>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
