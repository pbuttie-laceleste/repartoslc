import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = async (url, options = {}) => {
  const endpoint = `${API_BASE_URL}${url}`;
  const res = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Error de API');
  }
  return res.json();
};

function App() {
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [stockValues, setStockValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api('/api/stores'),
      api('/api/items'),
      api('/api/stock-targets')
    ]).then(([storesRes, itemsRes, targetsRes]) => {
      setStores(storesRes);
      setItems(itemsRes);
      setTargets(targetsRes);
      setSelectedStore(storesRes[0]?.id || '');
      setSelectedTarget(targetsRes.find((t) => t.defaultFlag)?.id || targetsRes[0]?.id || '');
    }).catch((err) => setError(err.message));
  }, []);

  const handleChangeStock = (itemId, value) => {
    setStockValues((prev) => ({
      ...prev,
      [itemId]: value
    }));
  };

  const selectedTargetLines = useMemo(() => {
    const target = targets.find((t) => t.id === selectedTarget);
    return target?.lines || [];
  }, [targets, selectedTarget]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setError(null);
    setIsLoading(true);
    setResult(null);
    try {
      const payload = {
        captured_at: new Date().toISOString(),
        items: selectedTargetLines.map((line) => ({
          item_id: line.itemId,
          quantity_sale_units: Number(stockValues[line.itemId] || 0)
        }))
      };
      const snapshot = await api(`/api/stores/${selectedStore}/stock-snapshots`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const calc = await api('/api/replenishments/calculate', {
        method: 'POST',
        body: JSON.stringify({
          store_id: selectedStore,
          target_id: selectedTarget,
          snapshot_id: snapshot.id
        })
      });
      setResult(calc);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <div>
          <h1>Reposición por objetivos</h1>
          <p className="subtitle">Calcula cuánto reponer en cada sucursal según el objetivo elegido.</p>
        </div>
      </header>

      <main>
        <section className="card">
          <h2>1. Configuración</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Sucursal
              <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            </label>

            <label>
              Objetivo
              <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)}>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>{target.name}</option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button type="submit" disabled={isLoading || !selectedStore || !selectedTarget}>
                {isLoading ? 'Calculando…' : 'Calcular reposición'}
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <h2>2. Stock actual</h2>
          <p>Ingresá las unidades de venta actuales por artículo.</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Subfamilia</th>
                  <th>Artículo</th>
                  <th>Stock (venta)</th>
                  <th>Objetivo (venta)</th>
                </tr>
              </thead>
              <tbody>
                {selectedTargetLines.map((line) => {
                  const item = items.find((it) => it.id === line.itemId);
                  const family = item?.familyName || '-';
                  const subfamily = item?.subfamilyName || '-';

                  return (
                    <tr key={line.id}>
                      <td>{family}</td>
                      <td>{subfamily}</td>
                      <td>{item?.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={stockValues[line.itemId] || ''}
                          onChange={(e) => handleChangeStock(line.itemId, e.target.value)}
                        />
                      </td>
                      <td>{line.targetQtySaleUnits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {error && <p className="error">{error}</p>}

        {result && (
          <section className="card">
            <h2>3. Pedido sugerido</h2>
            <p>Último cálculo: {new Date(result.calculatedAt).toLocaleString()}</p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Artículo</th>
                    <th>Stock actual</th>
                    <th>Objetivo</th>
                    <th>Diferencia (venta)</th>
                    <th>Reposición (fabricación)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((line) => (
                    <tr key={line.itemId}>
                      <td>{line.itemName}</td>
                      <td>{line.currentSaleUnits}</td>
                      <td>{line.targetSaleUnits}</td>
                      <td>{line.diffSaleUnits}</td>
                      <td>
                        {line.diffManufactureUnits}
                        <span className="unit"> {line.manufactureUnit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
