import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faListOl, faListUl, faAlignLeft,faAlignCenter,faAlignRight } from '@fortawesome/free-solid-svg-icons';

import StarterKit from "@tiptap/starter-kit";
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

export default function RTECourseDetails({ value, onChange, disabled }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  const getButtonClass = (isActive) => 
  `
    w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer transition-all ease-in-out
    ${isActive ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary hover:bg-primaryhover hover:text-white'}
    ${disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-primary' : ''}
  `;

  if (!editor) return null;

  const handleToggle = (format) => {
    if (!editor) return;

    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run();
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      {/* Toolbar */}
      <div className="flex gap-2 border-b border-gray-300 bg-gray-50 p-2 rounded-t-md shrink-0">
        <div className="relative group">
          <button className={getButtonClass(editor.isActive('bold'), disabled)}
            type="button"
            onClick={() => handleToggle('bold')}
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
        </div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive('italic'), disabled)}
            type="button"
            onClick={() => handleToggle('italic')}
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
        </div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive('underline'), disabled)}
            type="button"
            onClick={() => handleToggle('underline')}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>
        </div>
                        
        <div className="w-[2px] h-8 bg-unactive"></div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive('orderedList'), disabled)}
            type="button"
            onClick={() => handleToggle('orderedList')}
            >
            <FontAwesomeIcon icon={faListOl} />
          </button>
        </div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive('bulletList'), disabled)}
            type="button"
            onClick={() => handleToggle('bulletList')}
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
        </div>

        <div className="w-[2px] h-8 bg-unactive"></div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive({ textAlign: 'left' }), disabled)}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
        </div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive({ textAlign: 'center' }), disabled)}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
        </div>

        <div className="relative group">
          <button className={getButtonClass(editor.isActive({ textAlign: 'right' }), disabled)}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
        </div>
      </div>

      <div className={`flex-1 border border-gray-300 rounded-b-md bg-white flex flex-col overflow-y-auto min-h-0 ${
          disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <EditorContent className="flex-1 w-full h-full outline-none prose max-w-none p-3"
          editor={editor}
        />
      </div>
    </div>
  );
}
