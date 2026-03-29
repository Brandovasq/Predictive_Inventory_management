export const INVENTORY_OVERRIDES_KEY = "frontend2_inventory_overrides_v1";

export function normalizeBaseKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

export function loadInventoryOverrides() {
  try {
    const raw = localStorage.getItem(INVENTORY_OVERRIDES_KEY);

    if (!raw) {
      return {
        editsById: {},
        deletedIds: [],
        addedItems: [],
      };
    }

    const parsed = JSON.parse(raw);

    return {
      editsById: parsed?.editsById && typeof parsed.editsById === "object"
        ? parsed.editsById
        : {},
      deletedIds: Array.isArray(parsed?.deletedIds) ? parsed.deletedIds : [],
      addedItems: Array.isArray(parsed?.addedItems) ? parsed.addedItems : [],
    };
  } catch (error) {
    console.error("Failed to load inventory overrides from localStorage:", error);
    return {
      editsById: {},
      deletedIds: [],
      addedItems: [],
    };
  }
}

export function saveInventoryOverrides(overrides) {
  try {
    localStorage.setItem(INVENTORY_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error("Failed to save inventory overrides to localStorage:", error);
  }
}

export function clearInventoryOverrides() {
  try {
    localStorage.removeItem(INVENTORY_OVERRIDES_KEY);
  } catch (error) {
    console.error("Failed to clear inventory overrides from localStorage:", error);
  }
}

export function mergeInventoryWithOverrides(baseInventory = [], overrides = {}) {
  const editsById = overrides?.editsById || {};
  const deletedIds = new Set(overrides?.deletedIds || []);
  const addedItems = overrides?.addedItems || [];

  const mergedBase = baseInventory
    .map((item) => {
      const storageId = normalizeBaseKey(item.name);
      const edit = editsById[storageId];

      return {
        id: storageId,
        storageId,
        source: "base",
        originalName: item.name,
        name: edit?.name ?? item.name,
        quantity: Number(edit?.quantity ?? item.quantity) || 0,
        max: Number(edit?.max ?? item.max) || 0,
      };
    })
    .filter((item) => !deletedIds.has(item.storageId));

  const mergedAdded = addedItems
    .filter((item) => item?.id && !deletedIds.has(item.id))
    .map((item) => ({
      id: item.id,
      storageId: item.id,
      source: "added",
      originalName: item.name,
      name: item.name,
      quantity: Number(item.quantity) || 0,
      max: Number(item.max) || 0,
    }));

  return [...mergedBase, ...mergedAdded];
}