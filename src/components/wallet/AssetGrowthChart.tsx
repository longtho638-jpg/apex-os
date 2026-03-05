'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface AssetGrowthChartProps {
  data: {
    day: number;
    value: number;
    date?: string;
  }[];
}

export default function AssetGrowthChart({ data }: AssetGrowthChartProps) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis dataKey="day" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
            itemStyle={{ color: '#00FF94', fontWeight: 'bold', fontFamily: 'monospace' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
            labelStyle={{ display: 'none' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#00FF94"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
