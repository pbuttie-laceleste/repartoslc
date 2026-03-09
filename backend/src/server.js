import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import store from './data/store.js';
import { buildReplenishmentLines } from './utils/calculations.js';
import { dbHealth } from './db/client.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const success = (res, data = {}, code = 200) => res.status(code).json(data);
const notFound = (res, message = 'No se encontró el recurso solicitado') => res.status(404).json({ message });

app.get('/api/health', async (_req, res) => {
  const database = await dbHealth();
  success(res, { status: 'ok', timestamp: new Date().toISOString(), database });
});

app.get('/api/families', (_req, res) => {
  const payload = store.families.map((family) => ({
    ...family,
    subfamilies: store.subfamilies.filter((sf) => sf.familyId === family.id)
  }));
  success(res, payload);
});

app.get('/api/items', (_req, res) => {
  const payload = store.items.map((item) => {
    const subfamily = store.subfamilies.find((sf) => sf.id === item.subfamilyId);
    const family = store.families.find((fam) => fam.id === subfamily?.familyId);
    return {
      ...item,
      familyId: family?.id,
      familyName: family?.name,
      subfamilyName: subfamily?.name,
      equivalence: store.unitEquivalences.find((eq) => eq.itemId === item.id)
    };
  });
  success(res, payload);
});

app.get('/api/stores', (_req, res) => success(res, store.stores));

app.post('/api/stores/:storeId/stock-snapshots', (req, res) => {
  const { storeId } = req.params;
  const storeExists = store.stores.find((st) => st.id === storeId);
  if (!storeExists) return notFound(res, 'Sucursal inexistente');

  const { captured_at, items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Debes enviar items' });
  }

  const snapshot = {
    id: uuid(),
    storeId,
    capturedAt: captured_at || new Date().toISOString(),
    items: items.map((it) => ({
      itemId: it.item_id,
      quantitySaleUnits: Number(it.quantity_sale_units || 0)
    }))
  };
  store.stockSnapshots.push(snapshot);
  success(res, snapshot, 201);
});

app.get('/api/stores/:storeId/stock-snapshots/latest', (req, res) => {
  const { storeId } = req.params;
  const snapshot = [...store.stockSnapshots]
    .filter((snap) => snap.storeId === storeId)
    .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))[0];
  if (!snapshot) return notFound(res, 'Sin lecturas para la sucursal');
  success(res, snapshot);
});

app.get('/api/stock-targets', (_req, res) => {
  const payload = store.stockTargets.map((target) => ({
    ...target,
    lines: store.stockTargetLines.filter((line) => line.targetId === target.id)
  }));
  success(res, payload);
});

app.post('/api/stock-targets', (req, res) => {
  const { name, description, defaultFlag } = req.body;
  const target = {
    id: uuid(),
    name,
    description,
    createdBy: req.body.createdBy || 'api',
    defaultFlag: Boolean(defaultFlag),
    active: true
  };
  store.stockTargets.push(target);
  success(res, target, 201);
});

app.post('/api/stock-targets/:targetId/lines', (req, res) => {
  const { targetId } = req.params;
  const { itemId, targetQtySaleUnits } = req.body;
  const line = {
    id: uuid(),
    targetId,
    itemId,
    targetQtySaleUnits: Number(targetQtySaleUnits)
  };
  store.stockTargetLines.push(line);
  success(res, line, 201);
});

app.post('/api/replenishments/calculate', (req, res) => {
  const { store_id, target_id, snapshot_id } = req.body;
  const storeData = store.stores.find((st) => st.id === store_id);
  if (!storeData) return notFound(res, 'Sucursal inexistente');
  const target = store.stockTargets.find((tg) => tg.id === target_id);
  if (!target) return notFound(res, 'Objetivo inexistente');
  const targetLines = store.stockTargetLines.filter((line) => line.targetId === target_id);
  if (!targetLines.length) return res.status(400).json({ message: 'El objetivo no tiene artículos configurados' });

  let snapshot = null;
  if (snapshot_id) {
    snapshot = store.stockSnapshots.find((snap) => snap.id === snapshot_id);
  } else {
    snapshot = [...store.stockSnapshots]
      .filter((snap) => snap.storeId === store_id)
      .sort((a, b) => new Date(b.capturedAt) - new Date(a.capturedAt))[0];
  }
  if (!snapshot) return res.status(400).json({ message: 'No hay stock capturado para la sucursal' });

  const lines = buildReplenishmentLines({ targetLines, snapshot });
  const request = {
    id: uuid(),
    storeId: store_id,
    targetId: target_id,
    snapshotId: snapshot.id,
    calculatedAt: new Date().toISOString(),
    status: 'draft',
    lines
  };
  store.replenishmentRequests.push(request);
  success(res, request, 201);
});

app.get('/api/replenishments/:requestId', (req, res) => {
  const request = store.replenishmentRequests.find((reqq) => reqq.id === req.params.requestId);
  if (!request) return notFound(res);
  success(res, request);
});

app.post('/api/replenishments/:requestId/confirm', (req, res) => {
  const request = store.replenishmentRequests.find((reqq) => reqq.id === req.params.requestId);
  if (!request) return notFound(res);
  request.status = 'confirmed';
  request.confirmedAt = new Date().toISOString();
  success(res, request);
});

app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
});
