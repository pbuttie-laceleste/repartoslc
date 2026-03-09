import { v4 as uuid } from 'uuid';

const families = [
  { id: 'fam-bebidas', name: 'Bebidas' },
  { id: 'fam-combos', name: 'Combos' }
];

const subfamilies = [
  { id: 'sub-cervezas', familyId: 'fam-bebidas', name: 'Cervezas' },
  { id: 'sub-gaseosas', familyId: 'fam-bebidas', name: 'Gaseosas' },
  { id: 'sub-hamburguesas', familyId: 'fam-combos', name: 'Hamburguesas' }
];

const items = [
  {
    id: 'itm-ipa330',
    subfamilyId: 'sub-cervezas',
    name: 'IPA 330ml',
    sku: 'IPA-330',
    saleUnit: 'botella',
    manufactureUnit: 'caja'
  },
  {
    id: 'itm-cola500',
    subfamilyId: 'sub-gaseosas',
    name: 'Cola 500ml',
    sku: 'COLA-500',
    saleUnit: 'botella',
    manufactureUnit: 'pack'
  },
  {
    id: 'itm-burguer',
    subfamilyId: 'sub-hamburguesas',
    name: 'Hamburguesa Clásica',
    sku: 'BURG-CLAS',
    saleUnit: 'unidad',
    manufactureUnit: 'bandeja'
  }
];

const unitEquivalences = [
  {
    id: 'eq-ipa',
    itemId: 'itm-ipa330',
    saleUnitQty: 1,
    manufactureUnitQty: 0.0833, // 12 botellas por caja
    notes: '12 botellas = 1 caja'
  },
  {
    id: 'eq-cola',
    itemId: 'itm-cola500',
    saleUnitQty: 6,
    manufactureUnitQty: 1,
    notes: 'Pack de 6'
  },
  {
    id: 'eq-burguer',
    itemId: 'itm-burguer',
    saleUnitQty: 8,
    manufactureUnitQty: 1,
    notes: 'Bandeja de 8 unidades'
  }
];

const stores = [
  { id: 'store-centro', name: 'Sucursal Centro', address: 'Av. Siempre Viva 123', timezone: 'America/Argentina/Cordoba' },
  { id: 'store-norte', name: 'Sucursal Norte', address: 'Bv. Illia 456', timezone: 'America/Argentina/Cordoba' }
];

const stockTargets = [
  { id: 'target-finde', name: 'Fin de semana', description: 'Nivel alto para sábados y domingos', createdBy: 'system', defaultFlag: false, active: true },
  { id: 'target-semana', name: 'Semana', description: 'Nivel habitual lunes-viernes', createdBy: 'system', defaultFlag: true, active: true }
];

const stockTargetLines = [
  { id: uuid(), targetId: 'target-finde', itemId: 'itm-ipa330', targetQtySaleUnits: 72 },
  { id: uuid(), targetId: 'target-finde', itemId: 'itm-cola500', targetQtySaleUnits: 120 },
  { id: uuid(), targetId: 'target-finde', itemId: 'itm-burguer', targetQtySaleUnits: 200 },
  { id: uuid(), targetId: 'target-semana', itemId: 'itm-ipa330', targetQtySaleUnits: 36 },
  { id: uuid(), targetId: 'target-semana', itemId: 'itm-cola500', targetQtySaleUnits: 60 },
  { id: uuid(), targetId: 'target-semana', itemId: 'itm-burguer', targetQtySaleUnits: 120 }
];

const stockSnapshots = [];
const replenishmentRequests = [];

export default {
  families,
  subfamilies,
  items,
  unitEquivalences,
  stores,
  stockTargets,
  stockTargetLines,
  stockSnapshots,
  replenishmentRequests
};
