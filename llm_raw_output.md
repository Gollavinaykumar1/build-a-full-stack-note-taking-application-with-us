# LLM Output

### FILE: src/App.jsx
```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [period, setPeriod] = useState('Week');
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [thisPeriod, setThisPeriod] = useState(0);
  const [growth, setGrowth] = useState(0);
  const { register, handleSubmit, reset } = useForm();
  const [editing, setEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState({});

  const fetchNotes = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/notes`);
      setNotes(response.data);
      setFilteredNotes(response.data);
      calculateKPIs(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const calculateKPIs = (notes) => {
    const total = notes.length;
    const active = notes.filter((note) => note.active).length;
    const thisPeriod = notes.filter((note) => note.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)).length;
    const growth = (thisPeriod / total) * 100;
    setTotal(total);
    setActive(active);
    setThisPeriod(thisPeriod);
    setGrowth(growth);
  };

  const handleCreateNote = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/notes`, data);
      setNotes((prevNotes) => [...prevNotes, response.data]);
      setFilteredNotes((prevNotes) => [...prevNotes, response.data]);
      calculateKPIs([...notes, response.data]);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditNote = async (data) => {
    try {
      const response = await axios.put(`${BASE_URL}/notes/${currentNote.id}`, data);
      setNotes((prevNotes) => prevNotes.map((note) => note.id === response.data.id ? response.data : note));
      setFilteredNotes((prevNotes) => prevNotes.map((note) => note.id === response.data.id ? response.data : note));
      calculateKPIs(notes.map((note) => note.id === response.data.id ? response.data : note));
      setEditing(false);
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/notes/${id}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      setFilteredNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      calculateKPIs(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilter = (period) => {
    setPeriod(period);
    if (period === 'Week') {
      setFilteredNotes(notes.filter((note) => note.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7)));
    } else if (period === 'Month') {
      setFilteredNotes(notes.filter((note) => note.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    } else if (period === 'Year') {
      setFilteredNotes(notes.filter((note) => note.createdAt >= new Date(new Date().getFullYear(), 0, 1)));
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <HashRouter>
      <div className="container mx-auto p-4">
        <ToastContainer />
        <h1 className="text-3xl font-bold mb-4">Note Taking App</h1>
        <div className="flex justify-between mb-4">
          <div className="flex">
            <button className={clsx('btn', period === 'Week' ? 'btn-active' : 'btn-inactive')} onClick={() => handleFilter('Week')}>Week</button>
            <button className={clsx('btn', period === 'Month' ? 'btn-active' : 'btn-inactive')} onClick={() => handleFilter('Month')}>Month</button>
            <button className={clsx('btn', period === 'Year' ? 'btn-active' : 'btn-inactive')} onClick={() => handleFilter('Year')}>Year</button>
          </div>
          <button className="btn" onClick={() => setEditing(false)}>Create Note</button>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Total</h2>
            <p className="text-3xl font-bold">{total}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Active</h2>
            <p className="text-3xl font-bold">{active}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">This Period</h2>
            <p className="text-3xl font-bold">{thisPeriod}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Growth</h2>
            <p className="text-3xl font-bold">{growth}%</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Weekly Trend</h2>
            <div className="flex">
              {notes.map((note, index) => (
                <div key={index} style={{ width: `${(note.createdAt.getDay() / 7) * 100}%` }} className="bg-blue-500 h-4 mr-2"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="bg-gray-200 p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Status Breakdown</h2>
            <div className="flex">
              {notes.map((note, index) => (
                <div key={index} style={{ width: `${(note.active ? 1 : 0) / notes.length * 100}%` }} className="bg-green-500 h-4 mr-2"></div>
              ))}
            </div>
          </div>
        </div>
        <table className="w-full table-auto mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Content</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotes.map((note, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{note.title}</td>
                <td className="px-4 py-2">{note.content}</td>
                <td className="px-4 py-2">{format(note.createdAt, 'yyyy-MM-dd HH:mm:ss')}</td>
                <td className="px-4 py-2">
                  <button className="btn" onClick={() => {
                    setEditing(true);
                    setCurrentNote(note);
                  }}><FiEdit /></button>
                  <button className="btn" onClick={() => handleDeleteNote(note.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editing ? (
          <form onSubmit={handleSubmit(handleEditNote)}>
            <input type="text" {...register('title')} defaultValue={currentNote.title} className="w-full p-2 mb-2 border border-gray-200 rounded" />
            <textarea {...register('content')} defaultValue={currentNote.content} className="w-full p-2 mb-2 border border-gray-200 rounded" />
            <button type="submit" className="btn">Edit Note</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleCreateNote)}>
            <input type="text" {...register('title')} className="w-full p-2 mb-2 border border-gray-200 rounded" />
            <textarea {...register('content')} className="w-full p-2 mb-2 border border-gray-200 rounded" />
            <button type="submit" className="btn">Create Note</button>
          </form>
        )}
      </div>
    </HashRouter>
  );
}

export default App;
=== END ===

### FILE: src/main.jsx
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
=== END ===

### FILE: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-100;
}

.container {
  @apply max-w-md mx-auto p-4;
}

.btn {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}

.btn-active {
  @apply bg-blue-700;
}

.btn-inactive {
  @apply bg-gray-200;
}

table {
  @apply w-full table-auto;
}

th, td {
  @apply px-4 py-2;
}

th {
  @apply bg-gray-200;
}
=== END ===

### FILE: src/api.js
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = {
  async getNotes() {
    const response = await fetch(`${BASE_URL}/notes`);
    return response.json();
  },
  async createNote(data) {
    const response = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  async editNote(id, data) {
    const response = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  async deleteNote(id) {
    await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'DELETE'
    });
  }
};

export default api;
=== END ===
```