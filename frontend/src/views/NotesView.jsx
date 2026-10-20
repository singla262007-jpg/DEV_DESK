import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Folder,
  Tag,
  Download,
  Eye,
  Edit3,
  Check,
  Sparkles,
} from 'lucide-react';

export default function NotesView({
  notes = [],
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}) {
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving'
  const [previewMode, setPreviewMode] = useState(false);

  const saveTimeoutRef = useRef(null);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    if (selectedFolder !== 'All' && n.folder !== selectedFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    }
    return true;
  });

  // Select first note if active not in list
  useEffect(() => {
    if (!activeNoteId && filteredNotes.length > 0) {
      const first = filteredNotes[0];
      setActiveNoteId(first.id);
      setTitle(first.title);
      setContent(first.content || '');
    }
  }, [filteredNotes, activeNoteId]);

  const handleSelectNote = (n) => {
    setActiveNoteId(n.id);
    setTitle(n.title);
    setContent(n.content || '');
  };

  const handleNewNote = async () => {
    const newNote = await onCreateNote({
      title: 'Untitled Note',
      content: '# Untitled Note\n\nWrite your thoughts, technical architecture, or daily reflections here...',
      folder: selectedFolder === 'All' ? 'General' : selectedFolder,
      pinned: false,
    });
    if (newNote) {
      setActiveNoteId(newNote.id);
      setTitle(newNote.title);
      setContent(newNote.content);
    }
  };

  // Debounced auto-save
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (activeNoteId) {
        await onUpdateNote(activeNoteId, { content: newContent });
        setSaveStatus('saved');
      }
    }, 800);
  };

  const handleTitleBlur = async () => {
    setIsEditingTitle(false);
    if (activeNoteId && title.trim()) {
      await onUpdateNote(activeNoteId, { title: title.trim() });
    }
  };

  const handleTogglePin = async (n) => {
    await onUpdateNote(n.id, { pinned: !n.pinned });
  };

  const handleExportMarkdown = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'note').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const folders = ['All', 'General', 'Architecture', 'Daily Logs', 'Meeting Notes', 'Ideas'];

  // Safe simple markdown preview parser
  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} style={{ margin: '14px 0 8px', fontSize: '1.4rem' }}>{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} style={{ margin: '12px 0 6px', fontSize: '1.2rem' }}>{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ margin: '10px 0 4px', fontSize: '1.05rem' }}>{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} style={{ marginLeft: '20px', marginBlock: '3px' }}>{line.slice(2)}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={idx} style={{ height: '4px' }} />;
      }
      if (!line.trim()) {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      return <p key={idx} style={{ margin: '4px 0', lineHeight: 1.6 }}>{line}</p>;
    });
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: '1440px', margin: '0 auto', width: '100%', height: 'calc(100vh - 64px)' }}>
      {/* Container Grid */}
      <div
        className="glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        {/* Left Sidebar: Folders & Note List */}
        <div
          style={{
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          {/* Top Actions */}
          <div style={{ padding: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleNewNote}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>New Note</span>
            </button>
          </div>

          {/* Search bar */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--bg-surface)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Search size={14} color="var(--text-faint)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                style={{ background: 'transparent', border: 'none', padding: 0, fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Folder tabs */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFolder(f)}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: selectedFolder === f ? 'var(--primary-accent)' : 'var(--bg-surface)',
                  color: selectedFolder === f ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notes list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {filteredNotes.length === 0 ? (
              <div style={{ padding: '30px 14px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                No notes in this folder.
              </div>
            ) : (
              filteredNotes.map((n) => {
                const isActive = n.id === activeNoteId;
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isActive ? 'var(--bg-surface-active)' : 'transparent',
                      border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                      marginBottom: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.title || 'Untitled Note'}
                      </span>
                      {n.pinned && <Pin size={11} color="var(--primary-accent)" fill="var(--primary-accent)" />}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-faint)',
                        marginTop: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {n.content ? n.content.slice(0, 40) : 'Empty note'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Editor Pane */}
        {activeNote ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-surface)' }}>
            {/* Editor Toolbar */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                    autoFocus
                    style={{ fontSize: '1.1rem', fontWeight: 700, padding: '2px 8px' }}
                  />
                ) : (
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title="Click to edit title"
                  >
                    {title || 'Untitled Note'}
                  </h2>
                )}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {saveStatus === 'saved' ? <Check size={12} color="var(--accent-emerald)" /> : null}
                  {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="btn-ghost"
                  style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                >
                  {previewMode ? <Edit3 size={14} /> : <Eye size={14} />}
                  <span>{previewMode ? 'Edit' : 'Preview'}</span>
                </button>
                <button
                  onClick={() => handleTogglePin(activeNote)}
                  className="btn-ghost"
                  title="Pin Note"
                  style={{ padding: '6px 10px' }}
                >
                  <Pin
                    size={14}
                    color={activeNote.pinned ? 'var(--primary-accent)' : 'inherit'}
                    fill={activeNote.pinned ? 'var(--primary-accent)' : 'none'}
                  />
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="btn-ghost"
                  title="Export Markdown"
                  style={{ padding: '6px 10px' }}
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onDeleteNote(activeNote.id)}
                  className="btn-ghost"
                  title="Delete Note"
                  style={{ padding: '6px 10px', color: 'var(--accent-rose)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Note Content Area */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {previewMode ? (
                <div style={{ color: 'var(--text-main)', fontSize: '0.94rem' }}>
                  {renderMarkdown(content)}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing Markdown notes, snippets, or project thoughts..."
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.94rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                    resize: 'none',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select or create a note to begin editing.
          </div>
        )}
      </div>
    </div>
  );
}
