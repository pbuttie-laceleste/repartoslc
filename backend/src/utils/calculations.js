import store from '../data/store.js';

const findEquivalence = (itemId) => {
  return store.unitEquivalences.find((eq) => eq.itemId === itemId);
};

export const transformSaleToManufacture = (itemId, saleQty) => {
  const eq = findEquivalence(itemId);
  if (!eq || eq.saleUnitQty === 0) {
    return saleQty; // fallback 1 a 1
  }
  const factor = eq.manufactureUnitQty / eq.saleUnitQty;
  return Math.ceil(saleQty * factor * 1000) / 1000; // redondeo leve
};

export const buildReplenishmentLines = ({ targetLines, snapshot }) => {
  const latestSnapshotMap = new Map();
  if (snapshot) {
    snapshot.items.forEach((it) => latestSnapshotMap.set(it.itemId, it.quantitySaleUnits));
  }

  return targetLines.map((line) => {
    const currentSaleUnits = latestSnapshotMap.get(line.itemId) || 0;
    const diffSaleUnits = Math.max(line.targetQtySaleUnits - currentSaleUnits, 0);
    const diffManufactureUnits = transformSaleToManufacture(line.itemId, diffSaleUnits);

    const item = store.items.find((it) => it.id === line.itemId) || {};
    const equivalence = store.unitEquivalences.find((eq) => eq.itemId === line.itemId);

    return {
      lineId: line.id,
      itemId: line.itemId,
      itemName: item.name,
      familyId: store.subfamilies.find((sf) => sf.id === item.subfamilyId)?.familyId,
      subfamilyId: item.subfamilyId,
      currentSaleUnits,
      targetSaleUnits: line.targetQtySaleUnits,
      diffSaleUnits,
      diffManufactureUnits,
      saleUnit: item.saleUnit,
      manufactureUnit: item.manufactureUnit,
      equivalence
    };
  });
};
