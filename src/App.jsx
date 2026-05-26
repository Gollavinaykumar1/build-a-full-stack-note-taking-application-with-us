import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlinePlus } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { clsx } from 'clsx';
import 'tailwindcss/base.css';
import 'tailwindcss/components.css';
import 'tailwindcss/utilities.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', priority: 'Low', assignee: '' });
  const [dragging, setDragging] = useState(null);
  const [columns, setColumns] = useState({
    'To Do': [],
    'In Progress': [],
    'Review': [],
    'Done': []
  });

  const fetchNotes = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notes`);
      setNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDragStart = (event, note) => {
    setDragging(note);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, column) => {
    if (dragging) {
      const updatedColumns = { ...columns };
      const index = updatedColumns[column].findIndex((note) => note.id === dragging.id);
      if (index === -1) {
        updatedColumns[column].push(dragging);
      } else {
        updatedColumns[column].splice(index, 1);
      }
      setColumns(updatedColumns);
      setDragging(null);
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/notes`, newNote);
      setNotes([...notes, response.data]);
      setNewNote({ title: '', priority: 'Low', assignee: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditNote = async (note) => {
    try {
      const response = await axios.put(`${BASE_URL}/notes/${note.id}`, note);
      setNotes(notes.map((n) => n.id === note.id ? response.data : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNote = async (note) => {
    try {
      await axios.delete(`${BASE_URL}/notes/${note.id}`);
      setNotes(notes.filter((n) => n.id !== note.id));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePriorityChange = (event, note) => {
    const updatedNote = { ...note, priority: event.target.value };
    handleEditNote(updatedNote);
  };

  const handleAssigneeChange = (event, note) => {
    const updatedNote = { ...note, assignee: event.target.value };
    handleEditNote(updatedNote);
  };

  const handleTitleChange = (event, note) => {
    const updatedNote = { ...note, title: event.target.value };
    handleEditNote(updatedNote);
  };

  const handleAddCard = () => {
    setNewNote({ title: '', priority: 'Low', assignee: '' });
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={
          <div className="h-screen flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300">
              <h1 className="text-3xl font-bold">Note Taker</h1>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddCard}>
                <AiOutlinePlus size={20} /> Add Card
              </button>
            </div>
            <div className="flex-1 flex overflow-x-auto">
              {Object.keys(columns).map((column, index) => (
                <div key={column} className={clsx('w-full md:w-1/4 xl:w-1/4 p-4', {
                  'bg-red-100': column === 'To Do',
                  'bg-yellow-100': column === 'In Progress',
                  'bg-blue-100': column === 'Review',
                  'bg-green-100': column === 'Done'
                })}>
                  <h2 className={clsx('text-2xl font-bold mb-4', {
                    'text-red-500': column === 'To Do',
                    'text-yellow-500': column === 'In Progress',
                    'text-blue-500': column === 'Review',
                    'text-green-500': column === 'Done'
                  })}>
                    {column} ({columns[column].length})
                  </h2>
                  <ul>
                    {columns[column].map((note, index) => (
                      <li key={note.id} className="bg-white p-4 mb-4 border border-gray-300 rounded" draggable onDragStart={(event) => handleDragStart(event, note)}>
                        <div className="flex justify-between items-center mb-2">
                          <input type="text" value={note.title} onChange={(event) => handleTitleChange(event, note)} className="w-full p-2 border border-gray-300 rounded" />
                          <div className="flex items-center">
                            <select value={note.priority} onChange={(event) => handlePriorityChange(event, note)} className="p-2 border border-gray-300 rounded">
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                            <input type="text" value={note.assignee} onChange={(event) => handleAssigneeChange(event, note)} className="p-2 border border-gray-300 rounded" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleEditNote(note)}>
                            <FiEdit size={20} /> Edit
                          </button>
                          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => handleDeleteNote(note)}>
                            <RiDeleteBinLine size={20} /> Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {newNote.title && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-300">
                <h2 className="text-2xl font-bold mb-4">Add New Note</h2>
                <input type="text" value={newNote.title} onChange={(event) => setNewNote({ ...newNote, title: event.target.value })} className="w-full p-2 border border-gray-300 rounded" />
                <select value={newNote.priority} onChange={(event) => setNewNote({ ...newNote, priority: event.target.value })} className="p-2 border border-gray-300 rounded">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input type="text" value={newNote.assignee} onChange={(event) => setNewNote({ ...newNote, assignee: event.target.value })} className="p-2 border border-gray-300 rounded" />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAddNote}>
                  Add Note
                </button>
              </div>
            )}
          </div>
        } />
      </Routes>
      <ToastContainer />
    </HashRouter>
  );
};

export default App;