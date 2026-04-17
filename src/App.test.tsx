import React from 'react';

export default function TestApp() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Test App - Working!</h1>
      <p className="text-xl">If you can see this, the basic React setup is working.</p>
      <div className="mt-8 p-4 bg-slate-800 rounded">
        <h2 className="text-2xl font-semibold mb-2">Next Steps:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Basic React rendering: OK</li>
          <li>Check if main.tsx is loading this component</li>
          <li>Test with actual App.tsx after fixing Firebase</li>
        </ul>
      </div>
    </div>
  );
}
