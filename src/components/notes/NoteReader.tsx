"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNoteHighlights } from "@/hooks/useNoteHighlights";
import { useNoteProgress } from "@/hooks/useNoteProgress";

interface NoteReaderProps {
  note: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  } | null;
  onProgressUpdate?: (position: number) => void;
}

export default function NoteReader({
  note,
  onProgressUpdate,
}: NoteReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationText, setAnnotationText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const { highlights, addHighlight } = useNoteHighlights(note?.id || null);
  const { progress, updateProgress } = useNoteProgress(note?.id || null);

  // Restore scroll position when note changes
  useEffect(() => {
    if (contentRef.current && progress !== null) {
      contentRef.current.scrollTop = progress;
    }
  }, [progress, note]);

  // Save scroll position
  const handleScroll = useCallback(() => {
    if (contentRef.current && note) {
      const position = contentRef.current.scrollTop;
      updateProgress(position);
      onProgressUpdate?.(position);
    }
  }, [note, updateProgress, onProgressUpdate]);

  // Handle text selection
  const handleMouseUp = () => {
    if (!note) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !contentRef.current) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Get the range within the content div
    const range = selection.getRangeAt(0);
    const container = contentRef.current;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // Calculate offsets relative to the entire content
    // For simplicity, we'll use the text content
    const fullText = container.innerText || "";
    // Find the start index of the selected text in the full text
    const startIndex = fullText.indexOf(selectedText, 0);
    if (startIndex === -1) return;

    setSelectedText(selectedText);
    setSelectionRange({
      start: startIndex,
      end: startIndex + selectedText.length,
    });
  };

  const handleHighlight = async () => {
    if (!note || !selectionRange) return;

    await addHighlight(selectionRange.start, selectionRange.end);
    setSelectedText("");
    setSelectionRange(null);
  };

  const handleAnnotate = async () => {
    if (!note || !selectionRange) return;

    if (!annotationText.trim()) {
      alert("Please enter an annotation.");
      return;
    }

    await addHighlight(
      selectionRange.start,
      selectionRange.end,
      annotationText,
    );
    setAnnotationText("");
    setShowAnnotationDialog(false);
    setSelectedText("");
    setSelectionRange(null);
  };

  // Render content with highlights
  const renderContent = () => {
    if (!note) return null;

    let html = note.content || "";

    // Insert highlight spans
    // We'll assume the content is plain text and we insert <mark> tags
    // For simplicity, we'll use a simple string replacement based on offsets.
    // This is fragile; ideally we'd parse HTML and insert spans with DOM manipulation.
    // For demo, we'll just use a simple approach: split by highlight ranges.
    if (highlights.length > 0) {
      const sortedHighlights = [...highlights].sort(
        (a, b) => a.start_offset - b.start_offset,
      );
      let result = "";
      let lastIndex = 0;
      for (const h of sortedHighlights) {
        // Insert text before highlight
        result += html.substring(lastIndex, h.start_offset);
        // Insert highlighted text
        const highlighted = html.substring(h.start_offset, h.end_offset);
        const annotation = h.annotation
          ? ` data-annotation="${h.annotation}"`
          : "";
        result += `<mark style="background-color: ${h.color};"${annotation}>${highlighted}</mark>`;
        lastIndex = h.end_offset;
      }
      result += html.substring(lastIndex);
      html = result;
    }

    return { __html: html };
  };

  if (!note) {
    return (
      <div className="bg-surface-container-low rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden relative group p-8">
        <div className="flex-1 flex items-center justify-center text-text-muted">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
              description
            </span>
            <p className="mt-2">Select a note to start reading.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden relative group">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-tertiary opacity-80"></div>

      {/* Toolbar */}
      <div className="bg-surface-container p-sm flex items-center justify-between shadow-sm z-10 pt-md">
        <div className="flex items-center gap-sm">
          <span className="bg-primary/10 text-primary px-sm py-base rounded-full font-label-sm text-label-sm">
            Note
          </span>
          <span className="font-label-sm text-label-sm text-text-muted">
            Last edited: {new Date(note.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <button className="w-8 h-8 rounded bg-surface-container-high text-on-surface flex items-center justify-center hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              more_vert
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="p-lg flex-1 overflow-y-auto flex flex-col gap-md custom-scrollbar"
        onScroll={handleScroll}
        onMouseUp={handleMouseUp}
      >
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {note.title}
        </h1>
        <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed outline-none">
          <div dangerouslySetInnerHTML={renderContent()} />
        </div>
      </div>

      {/* Selection popup */}
      {selectedText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface-container-high rounded-xl shadow-xl p-sm flex gap-sm z-50">
          <button
            onClick={handleHighlight}
            className="px-sm py-base rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              highlight
            </span>
            Highlight
          </button>
          <button
            onClick={() => setShowAnnotationDialog(true)}
            className="px-sm py-base rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              comment
            </span>
            Annotate
          </button>
          <button
            onClick={() => {
              setSelectedText("");
              setSelectionRange(null);
            }}
            className="px-sm py-base rounded-lg text-text-muted hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Annotation Dialog */}
      {showAnnotationDialog && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAnnotationDialog(false)}
        >
          <div
            className="bg-surface-container rounded-xl p-md max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
              Add Annotation
            </h3>
            <textarea
              className="w-full bg-surface-container-low rounded-lg p-sm font-body-md text-body-md text-on-surface placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              rows={3}
              placeholder="Enter your annotation..."
              value={annotationText}
              onChange={(e) => setAnnotationText(e.target.value)}
            />
            <div className="flex justify-end gap-sm mt-sm">
              <button
                onClick={() => {
                  setShowAnnotationDialog(false);
                  setAnnotationText("");
                }}
                className="px-md py-sm rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAnnotate}
                className="px-md py-sm rounded-lg bg-primary text-on-primary hover:bg-primary/80 transition-colors"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
