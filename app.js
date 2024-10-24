const { useState, useEffect } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Label } = Recharts;

const BudgetTracker = () => {
  const [startAmount, setStartAmount] = useState(15000);
  const [targetAmount, setTargetAmount] = useState(2500);
  const [days] = useState(31);
  const [rows, setRows] = useState([]);

  const dailyForecast = (startAmount - targetAmount) / days;

  const resetData = () => {
    const initialData = Array.from({ length: days + 1 }, (_, index) => ({
      day: index,
      plus: 0,
      zero: index === 0 ? startAmount : startAmount - (dailyForecast * index),
      minus: 0
    }));
    setRows(initialData);
  };useEffect(() => {
    resetData();
  }, [startAmount, targetAmount]);

  const calculateActualData = () => {
    let currentAmount = startAmount;
    return rows.map((row, index) => {
      if (index === 0) {
        return { ...row, actual: startAmount, dailyChange: 0 };
      }
      const dailyNet = row.plus - row.minus;
      currentAmount += dailyNet;
      return {
        ...row,
        actual: currentAmount,
        dailyChange: dailyNet
      };
    });
  };

  const calculateTrendData = (data) => {
    const lastActualIndex = data.findLastIndex(row => row.dailyChange !== 0);
    if (lastActualIndex < 0) return data;
    
    const lastActualValue = data[lastActualIndex].actual;
    const remainingDays = days - lastActualIndex;
    const newDailyChange = (targetAmount - lastActualValue) / remainingDays;
    
    let trendValue = lastActualValue;
    return data.map((row, index) => {
      if (index <= lastActualIndex) {
        return row;
      }
      trendValue += newDailyChange;
      return {
        ...row,
        trend: trendValue
      };
    });
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('sv-SE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const chartData = calculateTrendData(calculateActualData());return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start (kr)
          </label>
          <input 
            type="number" 
            value={startAmount} 
            onChange={(e) => setStartAmount(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daglig prognos (kr)
          </label>
          <input 
            type="number" 
            value={dailyForecast.toFixed(2)} 
            readOnly 
            className="w-full p-2 border rounded bg-gray-50"
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mål (kr)
          </label>
          <input 
            type="number" 
            value={targetAmount} 
            onChange={(e) => setTargetAmount(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex items-end">
          <button 
            onClick={resetData}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Återställ data
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2 overflow-x-auto max-h-96">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Dag</th>
                <th className="p-2 text-left">Plus</th>
                <th className="p-2 text-left">Noll</th>
                <th className="p-2 text-left">Minus</th>
                <th className="p-2 text-left">Utfall</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => (
                <tr key={row.day} className={index === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2">{row.day}</td>
                  <td className="p-2">
                    {index === 0 ? (
                      '–'
                    ) : (
                      <input
                        type="number"
                        value={row.plus}
                        onChange={(e) => {
                          const newRows = [...rows];
                          newRows[index].plus = Number(e.target.value) || 0;
                          setRows(newRows);
                        }}
                        className="w-full p-1 border rounded"
                      />
                    )}
                  </td>
                  <td className="p-2">{formatNumber(row.zero)}</td>
                  <td className="p-2">
                    {index === 0 ? (
                      '–'
                    ) : (
                      <input
                        type="number"
                        value={row.minus}
                        onChange={(e) => {
                          const newRows = [...rows];
                          newRows[index].minus = Number(e.target.value) || 0;
                          setRows(newRows);
                        }}
                        className="w-full p-1 border rounded"
                      />
                    )}
                  </td>
                  <td className="p-2">{formatNumber(chartData[index].actual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-1/2 bg-white p-4 rounded-lg shadow">
          <LineChart
            width={600}
            height={400}
            data={chartData}
            margin={{ top: 20, right: 80, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day"
              type="number"
              domain={[0, 31]}
              ticks={[0, 5, 10, 15, 20, 25, 30]}
            />
            <YAxis 
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip 
              formatter={(value) => formatNumber(value)}
            />
            <Legend 
              verticalAlign="top"
              height={36}
            />
            
            <ReferenceLine 
              y={startAmount} 
              stroke="green" 
              strokeWidth={2}
            >
              <Label
                value={`Start: ${formatNumber(startAmount)} kr`}
                position="right"
                fill="green"
                fontSize={12}
                fontWeight="bold"
              />
            </ReferenceLine>

            <ReferenceLine 
              y={targetAmount} 
              stroke="red" 
              strokeWidth={2}
            >
              <Label
                value={`Mål: ${formatNumber(targetAmount)} kr`}
                position="right"
                fill="red"
                fontSize={12}
                fontWeight="bold"
              />
            </ReferenceLine>

            <Line 
              type="monotone" 
              dataKey="zero" 
              stroke="#8884d8" 
              name="Prognos" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#82ca9d" 
              name="Utfall" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="#ff7300" 
              name="Tendens" 
              strokeDasharray="5 5"
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<BudgetTracker />, document.getElementById('root'));
