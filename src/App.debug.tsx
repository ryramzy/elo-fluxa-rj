import React from 'react';

export default function DebugApp() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-6 text-green-400">DEBUG: App is Loading!</h1>
      <div className="space-y-4">
        <p className="text-xl">If you see this, React is working.</p>
        <div className="bg-slate-800 p-4 rounded">
          <h2 className="text-2xl font-semibold mb-2 text-yellow-400">Debug Checklist:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>React rendering: <span className="text-green-400">OK</span></li>
            <li>Vite dev server: <span className="text-green-400">OK</span></li>
            <li>Basic styling: <span className="text-green-400">OK</span></li>
            <li>Next: Test with original App.tsx</li>
          </ul>
        </div>
        <button 
          onClick={() => alert('Button click working!')}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
        >
          Test Click Handler
        </button>
      </div>
    </div>
  );
}
