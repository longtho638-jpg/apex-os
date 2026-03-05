'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function PerformanceChart() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    value: 1000 + i ** 1.5 * 10 + Math.random() * 500,
  }));

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
            labelStyle={{ display: 'none' }}
          />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
