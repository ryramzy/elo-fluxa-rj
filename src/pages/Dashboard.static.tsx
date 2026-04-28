import React from 'react';

const DashboardStatic: React.FC = () => {
  console.log('DashboardStatic rendering');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Dashboard Static Test
      </h1>
      <div className="space-y-2">
        <p className="text-slate-600 dark:text-slate-400">
          This is a static test - no hooks, no auth
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          If you can see this, the routing works
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Check browser console for logs
        </p>
      </div>
    </div>
  );
};

export default DashboardStatic;
