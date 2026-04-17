import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Test 1: Basic routing without Firebase
function AppShell() {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-white p-8">
        <h1 className="text-4xl font-bold mb-6 text-green-400">ISOLATION TEST: Step 1</h1>
        <p className="text-xl mb-4">Basic React + Router working</p>
        <button 
          onClick={() => setHasEntered(true)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Enter Site (Test Navigation)
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white p-8">
      <h1 className="text-4xl font-bold mb-6 text-green-400">ISOLATION TEST: Step 2</h1>
      <p className="text-xl mb-4">Navigation working - testing routing</p>
      <Routes>
        <Route path="/" element={<div className="bg-slate-800 p-4 rounded">Home Route Working</div>} />
        <Route path="/about" element={<div className="bg-slate-800 p-4 rounded">About Route Working</div>} />
        <Route path="*" element={<div className="bg-slate-800 p-4 rounded">404 Route Working</div>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <AppShell />
    </div>
  );
}
