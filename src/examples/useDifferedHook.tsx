import { useState, useDeferredValue } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

function ChartDemo() {
  const [dataPoints, setDataPoints] = useState(100);
  const deferredDataPoints = useDeferredValue(dataPoints, 0);

  const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      x: i,
      y: Math.sin(i / 10) * 50 + Math.random() * 20,
    }));
  };

  const chartData = generateData(deferredDataPoints);

  return (
    <div>
      <label>
        Number of Data Points: {dataPoints}
        <input
          type="range"
          min="100"
          max="10000"
          value={dataPoints}
          onChange={(e) => setDataPoints(Number(e.target.value))}
        />
      </label>
      <div>
        <LineChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Line type="monotone" dataKey="y" stroke="#8884d8" dot={false} />
        </LineChart>
      </div>
    </div>
  );
}

export default ChartDemo;