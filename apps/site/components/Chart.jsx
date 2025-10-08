'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
export default function Chart({ data = [] }) {
  return (
    <div className="rounded-2xl border p-4">
      <strong>Trend</strong>
      <div className="h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
