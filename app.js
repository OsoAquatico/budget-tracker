const { useState, useEffect } = React;
const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = window.Recharts;

function BudgetTracker() {
  const [startAmount, setStartAmount] = useState(15000);
  const [targetAmount, setTargetAmount] = useState(2500);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const dailyChange = (targetAmount - startAmount) / 31;
    const newRows = Array.from({ length: 32 }, (_, index) => ({
      day: index,
      forecast: startAmount + (dailyChange * index),
      plus: 0,
      minus: 0
    }));
    setRows(newRows);
  }, [startAmount, targetAmount]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
    }).format(num);
  };

  const calculateActual = () => {
    let current = startAmount;
    return rows.map(row => ({
      ...row,
      actual: current += (row.plus - row.minus)
    }));
  };

  const data = calculateActual();

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="form-group">
            <label>Startbelopp</label>
            <input
              type="number"
              className="form-control"
              value={startAmount}
              onChange={(e) => setStartAmount(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-group">
            <label>Målbelopp</label>
            <input
              type="number"
              className="form-control"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Dag</th>
                <th>Prognos</th>
                <th>Plus</th>
                <th>Minus</th>
                <th>Utfall</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{formatNumber(row.forecast)}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.plus}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[index].plus = Number(e.target.value) || 0;
                        setRows(newRows);
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={row.minus}
                      onChange={(e) => {
                        const newRows = [...rows];
                        newRows[index].minus = Number(e.target.value) || 0;
                        setRows(newRows);
                      }}
                    />
                  </td>
                  <td>{formatNumber(data[index].actual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-md-6">
          <LineChart width={600} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => formatNumber(value)} />
            <Legend />
            <Line type="monotone" dataKey="forecast" stroke="#8884d8" name="Prognos" />
            <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Utfall" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<BudgetTracker />, document.getElementById('root'));
