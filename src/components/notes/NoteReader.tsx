"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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
  const { progress, updateProgress } = useNoteProgress(note?.id || null);

  useEffect(() => {
    if (contentRef.current && progress !== null) {
      contentRef.current.scrollTop = progress;
    }
  }, [progress, note]);

  const handleScroll = useCallback(() => {
    if (contentRef.current && note) {
      const position = contentRef.current.scrollTop;
      updateProgress(position);
      onProgressUpdate?.(position);
    }
  }, [note, updateProgress, onProgressUpdate]);

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
      <div
        ref={contentRef}
        className="p-lg flex-1 overflow-y-auto flex flex-col gap-md custom-scrollbar"
        onScroll={handleScroll}
      >
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {note.title}
        </h1>
        <div
          className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed outline-none"
          dangerouslySetInnerHTML={{ __html: note.content || "" }}
        />
      </div>
    </div>
  );
}
