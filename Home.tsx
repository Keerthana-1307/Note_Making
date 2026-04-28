//npm install -g @ionic/cli
//ionic start NotesApp blank --type=react
//cd NotesApp
//ionic serve
//paste the code in src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButtons,
  IonButton,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/react';
import { add, close } from 'ionicons/icons';
import './Home.css';

interface Note {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  date: string;
  color: string;
}

const PASTEL_COLORS = [
  '#FFD6E0',
  '#FFEAA7',
  '#D4EDDA',
  '#CCE5FF',
  '#E2D9F3',
  '#FFE5CC',
  '#D1ECF1',
  '#F8D7DA',
];

const STORAGE_KEY = 'notesapp_notes';

const Home: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = notes.filter((note) => {
    const q = searchText.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingNote(null);
    setTitleInput('');
    setContentInput('');
    setShowModal(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setTitleInput(note.title);
    setContentInput(note.content);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!titleInput.trim() && !contentInput.trim()) return;

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNote.id
            ? { ...n, title: titleInput.trim() || 'Untitled', content: contentInput.trim() }
            : n
        )
      );
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: titleInput.trim() || 'Untitled',
        content: contentInput.trim(),
        completed: false,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      };
      setNotes((prev) => [newNote, ...prev]);
    }

    setShowModal(false);
  };

  const toggleComplete = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const completedCount = notes.filter((n) => n.completed).length;

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader>
        <IonToolbar className="main-toolbar">
          <IonTitle className="app-title"> My Notes</IonTitle>
          <IonButtons slot="end">
            {completedCount > 0 && (
              <IonBadge color="success" className="header-badge">
                {completedCount} done
              </IonBadge>
            )}
            <IonBadge color="medium" className="header-badge">
              {notes.length} total
            </IonBadge>
          </IonButtons>
        </IonToolbar>

        {/* Search bar in a second toolbar row */}
        <IonToolbar className="search-toolbar">
          <IonSearchbar
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value ?? '')}
            placeholder="Search notes..."
            animated
            className="notes-searchbar"
          />
        </IonToolbar>
      </IonHeader>

      {/* ── Content ── */}
      <IonContent className="notes-content">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon"></span>
            <p className="empty-title">
              {searchText ? 'No notes found' : 'No notes yet!'}
            </p>
            {!searchText && (
              <p className="empty-sub">Tap + to create your first note</p>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`note-card ${note.completed ? 'note-done' : ''}`}
                style={{ background: note.color }}
              >
                <p className={`note-title ${note.completed ? 'struck' : ''}`}>
                  {note.title}
                </p>

                {note.content ? (
                  <p className={`note-content ${note.completed ? 'struck' : ''}`}>
                    {note.content}
                  </p>
                ) : null}

                <div className="note-footer">
                  <span className="note-date">{note.date}</span>
                  <div className="note-actions">
                    <button
                      className={`act-btn ${note.completed ? 'act-done' : ''}`}
                      onClick={() => toggleComplete(note.id)}
                      title="Toggle complete"
                    >
                      {note.completed ? '✅' : '⬜'}
                    </button>
                    <button
                      className="act-btn"
                      onClick={() => openEditModal(note)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="act-btn"
                      onClick={() => deleteNote(note.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FAB ── */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton className="fab-btn" onClick={openAddModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      {/* ── Add / Edit Modal ── */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar className="modal-toolbar">
            <IonTitle className="modal-title-text">
              {editingNote ? 'Edit Note' : 'New Note'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={close} style={{ color: '#fff' }} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <div className="modal-body">
            <IonItem lines="none" className="modal-input-item">
              <IonLabel position="floating" className="modal-label">
                Title
              </IonLabel>
              <IonInput
                value={titleInput}
                onIonInput={(e) => setTitleInput(e.detail.value ?? '')}
                placeholder="Note title..."
                className="modal-input"
              />
            </IonItem>

            <IonItem lines="none" className="modal-input-item textarea-item">
              <IonLabel position="floating" className="modal-label">
                Content
              </IonLabel>
              <IonTextarea
                value={contentInput}
                onIonInput={(e) => setContentInput(e.detail.value ?? '')}
                placeholder="Write your note here..."
                autoGrow
                rows={6}
                className="modal-textarea"
              />
            </IonItem>

            <IonButton
              expand="block"
              className="save-button"
              onClick={handleSave}
            >
              {editingNote ? 'Update Note' : 'Save Note'}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Home;
