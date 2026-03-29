import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  clearInventoryOverrides,
  loadInventoryOverrides,
  mergeInventoryWithOverrides,
  saveInventoryOverrides,
} from "../utils/inventoryLocalStorage";

const DELETE_WARNING_KEY = "frontend2_skip_delete_warning";

const ingredientMeta = {
  bun: {
    label: "Buns",
    image:
      "https://images.unsplash.com/photo-1632552544552-3ca612a328ac?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  patty: {
    label: "Beef Patties",
    image:
      "https://images.unsplash.com/photo-1609806838045-ead77bbe70e9?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  cheese: {
    label: "Cheese",
    image:
      "https://images.unsplash.com/photo-1683314573422-649a3c6ad784?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  lettuce: {
    label: "Lettuce",
    image:
      "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  tomato: {
    label: "Tomatoes",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80",
  },
  onion: {
    label: "Onions",
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80",
  },
  pickles: {
    label: "Pickles",
    image:
      "https://images.unsplash.com/photo-1621378581615-6d27c7d86244?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  sauce: {
    label: "Sauce",
    image:
      "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=900&q=80",
  },
  fries: {
    label: "Fries",
    image:
      "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  salt: {
    label: "Salt",
    image:
      "https://images.unsplash.com/photo-1634612831148-03a8550e1d52?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  "vegan patty": {
    label: "Vegan Patties",
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
  },
  chicken: {
    label: "Chicken",
    image:
      "https://images.unsplash.com/photo-1689774187968-0e6c29a1d82e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  coke: {
    label: "Coca-Cola",
    image:
      "https://images.unsplash.com/photo-1624797375978-8c2f746bdd3a?q=80&w=1493&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  dietCoke: {
    label: "Diet Coke",
    image:
      "https://images.unsplash.com/photo-1492558830530-c134e4d828fc?q=80&w=1050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  sprite: {
    label: "Sprite",
    image:
      "https://images.unsplash.com/photo-1690988109041-458628590a9e?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  water: {
    label: "Water",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80",
  },
  ice: {
    label: "Ice",
    image:
      "https://images.unsplash.com/photo-1590430752967-d0e116909be1?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

const missingImageSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="#f8fafc"/>
  <rect x="20" y="20" width="760" height="460" rx="28" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="4"/>
  <rect x="90" y="110" width="620" height="280" rx="20" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
  <circle cx="265" cy="210" r="44" fill="#cbd5e1"/>
  <path d="M170 345 L290 235 L390 320 L490 245 L630 345 Z" fill="#94a3b8"/>
  <text x="400" y="432" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="#475569" font-weight="700">
    Missing Picture
  </text>
</svg>
`);

const missingImageUrl = `data:image/svg+xml;charset=utf-8,${missingImageSvg}`;

function createId() {
  return `ingredient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function InventoryDashboard({
  initialInventory = [],
  analytics,
  predictions = {},
  backendConnected = false,
  loading = false,
  errorMessage = "",
  onRefresh,
  onUpdateInventoryItem,
  lastUpdated,
}) {
  const [overrides, setOverrides] = useState(() => loadInventoryOverrides());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("add");
  const [formError, setFormError] = useState("");
  const [sortMode, setSortMode] = useState("status");
  const [formValues, setFormValues] = useState({
    id: null,
    source: "added",
    storageId: null,
    name: "",
    quantity: "",
    max: "",
  });
  const formatPredictionList = (items = []) => {
    return items.map((item) => formatName(item)).join(", ");
  };
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [skipDeleteWarning, setSkipDeleteWarning] = useState(() => {
    return localStorage.getItem(DELETE_WARNING_KEY) === "true";
  });

  const menuRef = useRef(null);
  const backendAuthoritativeMode = backendConnected;

  const effectiveOverrides = overrides;

  const inventory = useMemo(() => {
    return mergeInventoryWithOverrides(initialInventory, effectiveOverrides);
  }, [initialInventory, effectiveOverrides]);

  useEffect(() => {
    saveInventoryOverrides(overrides);
  }, [overrides]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatName = (name) => {
    if (ingredientMeta[name]?.label) return ingredientMeta[name].label;

    return String(name)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const getImage = (name) => ingredientMeta[name]?.image || missingImageUrl;

  const getPercent = (quantity, max) => {
    if (!max || max <= 0) return 0;
    return Math.round((quantity / max) * 100);
  };

  const getStatus = (pct) => {
    if (pct <= 10) return "Critical";
    if (pct <= 33) return "Low";
    if (pct <= 75) return "Normal";
    return "Full";
  };

  const getStatusClass = (pct) => {
    if (pct <= 10) return "critical";
    if (pct <= 33) return "low";
    if (pct <= 75) return "normal";
    return "full";
  };

  const handleRefill = async (item) => {
    if (backendConnected && typeof onUpdateInventoryItem === "function") {
      const updated = await onUpdateInventoryItem(item.name, item.max);
      if (!updated) return;
      return;
    }

    if (item.source === "added") {
      setOverrides((prev) => ({
        ...prev,
        addedItems: prev.addedItems.map((addedItem) =>
          addedItem.id === item.storageId
            ? { ...addedItem, quantity: addedItem.max }
            : addedItem
        ),
      }));
      return;
    }

    setOverrides((prev) => ({
      ...prev,
      editsById: {
        ...prev.editsById,
        [item.storageId]: {
          name: item.name,
          quantity: item.max,
          max: item.max,
        },
      },
    }));
  };

  const openAddModal = () => {
    setFormError("");
    setEditorMode("add");
    setFormValues({
      id: null,
      source: "added",
      storageId: null,
      name: "",
      quantity: "",
      max: "",
    });
    setEditorOpen(true);
    setOpenMenuId(null);
  };

  const openEditModal = (item) => {
    setFormError("");
    setEditorMode("edit");
    setFormValues({
      id: item.id,
      source: item.source,
      storageId: item.storageId,
      name: item.name,
      quantity: String(item.quantity),
      max: String(item.max),
    });
    setEditorOpen(true);
    setOpenMenuId(null);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setFormError("");
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveIngredient = (event) => {
    event.preventDefault();

    const trimmedName = formValues.name.trim();
    const quantity = Number(formValues.quantity);
    const max = Number(formValues.max);

    if (!trimmedName) {
      setFormError("Ingredient name is required.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      setFormError("Current units must be 0 or greater.");
      return;
    }

    if (!Number.isFinite(max) || max <= 0) {
      setFormError("Max units must be greater than 0.");
      return;
    }

    if (quantity > max) {
      setFormError("Current units cannot be greater than max units.");
      return;
    }

    const duplicateName = inventory.some((item) => {
      if (editorMode === "edit" && item.storageId === formValues.storageId) {
        return false;
      }
      return item.name.toLowerCase() === trimmedName.toLowerCase();
    });

    if (duplicateName) {
      setFormError("That ingredient already exists.");
      return;
    }

    if (editorMode === "edit") {
      if (formValues.source === "added") {
        setOverrides((prev) => ({
          ...prev,
          addedItems: prev.addedItems.map((item) =>
            item.id === formValues.storageId
              ? {
                  ...item,
                  name: trimmedName,
                  quantity,
                  max,
                }
              : item
          ),
        }));
      } else {
        setOverrides((prev) => ({
          ...prev,
          editsById: {
            ...prev.editsById,
            [formValues.storageId]: {
              name: trimmedName,
              quantity,
              max,
            },
          },
        }));
      }
    } else {
      setOverrides((prev) => ({
        ...prev,
        addedItems: [
          ...prev.addedItems,
          {
            id: createId(),
            name: trimmedName,
            quantity,
            max,
          },
        ],
      }));
    }

    closeEditor();
  };

  const requestDelete = (item) => {
    setOpenMenuId(null);

    if (skipDeleteWarning) {
      handleDeleteIngredient(item);
      return;
    }

    setDeleteTarget(item);
  };

  const handleDeleteIngredient = (item) => {
    if (item.source === "added") {
      setOverrides((prev) => ({
        ...prev,
        addedItems: prev.addedItems.filter(
          (addedItem) => addedItem.id !== item.storageId
        ),
      }));
    } else {
      setOverrides((prev) => {
        const nextEdits = { ...prev.editsById };
        delete nextEdits[item.storageId];

        return {
          ...prev,
          editsById: nextEdits,
          deletedIds: prev.deletedIds.includes(item.storageId)
            ? prev.deletedIds
            : [...prev.deletedIds, item.storageId],
        };
      });
    }

    setDeleteTarget(null);
  };

  const handleDeleteCheckbox = (checked) => {
    setSkipDeleteWarning(checked);
    localStorage.setItem(DELETE_WARNING_KEY, String(checked));
  };

  const handleResetLocalChanges = () => {
    clearInventoryOverrides();
    setOverrides(loadInventoryOverrides());
    setOpenMenuId(null);
    setDeleteTarget(null);
    setEditorOpen(false);
  };

  const sortedInventory = useMemo(() => {
    const priority = {
      Critical: 0,
      Low: 1,
      Normal: 2,
      Full: 3,
    };

    const items = [...inventory];

    switch (sortMode) {
      case "stock-asc":
        return items.sort(
          (a, b) =>
            getPercent(a.quantity, a.max) - getPercent(b.quantity, b.max)
        );

      case "stock-desc":
        return items.sort(
          (a, b) =>
            getPercent(b.quantity, b.max) - getPercent(a.quantity, a.max)
        );

      case "alpha-asc":
        return items.sort((a, b) => formatName(a.name).localeCompare(formatName(b.name)));

      case "alpha-desc":
        return items.sort((a, b) => formatName(b.name).localeCompare(formatName(a.name)));

      case "status":
      default:
        return items.sort((a, b) => {
          const aStatus = getStatus(getPercent(a.quantity, a.max));
          const bStatus = getStatus(getPercent(b.quantity, b.max));

          if (priority[aStatus] !== priority[bStatus]) {
            return priority[aStatus] - priority[bStatus];
          }

          return formatName(a.name).localeCompare(formatName(b.name));
        });
    }
  }, [inventory, sortMode]);

  const summary = useMemo(() => {
    const totalIngredients = inventory.length;
    <section className="panel">
    <div className="panel-header">
      <div>
        <h2>AI Insights</h2>
        <p>
          Short-term predictions based on historical orders and recent order activity.
        </p>
      </div>
    </div>

    <div className="summary-grid">
      <div className="summary-card">
        <span className="summary-label">Predicted Top Ingredient</span>
        <strong className="summary-value">
          {predictions?.predictedTopIngredient
            ? formatName(predictions.predictedTopIngredient)
            : "—"}
        </strong>
      </div>

      <div className="summary-card">
        <span className="summary-label">Predicted Top Menu Item</span>
        <strong className="summary-value">
          {predictions?.predictedTopMenuItem || "—"}
        </strong>
      </div>

      <div className="summary-card">
        <span className="summary-label">Recommended Refill</span>
        <strong className="summary-value">
          {predictions?.recommendedRefills?.[0]?.name
            ? formatName(predictions.recommendedRefills[0].name)
            : "—"}
        </strong>
      </div>

      <div className="summary-card">
        <span className="summary-label">Emerging Trends</span>
        <strong className="summary-value ai-multi-line">
          {predictions?.emergingTrends?.length
            ? formatPredictionList(predictions.emergingTrends)
            : "—"}
        </strong>
      </div>
    </div>
  </section>

    const lowStockCount = inventory.filter((item) => {
      const pct = getPercent(item.quantity, item.max);
      return pct > 10 && pct <= 33;
    }).length;

    const criticalCount = inventory.filter((item) => {
      const pct = getPercent(item.quantity, item.max);
      return pct <= 10;
    }).length;

    const topTrending = analytics?.todayTrending?.[0]?.name || "patty";

    return {
      totalIngredients,
      lowStockCount,
      criticalCount,
      topTrending,
    };
  }, [inventory, analytics]);

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Frontend 2 · Inventory Dashboard</p>
          <h1>Smart Burger Inventory Dashboard</h1>
          <p className="subtext">
            Monitor live inventory levels, highlight shortages, refill items for
            demo purposes, and visualize demand trends throughout the day.
          </p>

          {errorMessage && <p className="error-text">{errorMessage}</p>}

          <p className="last-updated">Last updated: {formattedLastUpdated}</p>
        </div>

        <div className="header-actions">
          <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh Data"}
          </button>

          <div className={`backend-pill ${backendConnected ? "online" : "offline"}`}>
            {backendConnected ? "Backend Connected" : "Using Demo Data"}
          </div>
        </div>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Ingredients Tracked</span>
          <strong className="summary-value">{summary.totalIngredients}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Low Stock</span>
          <strong className="summary-value">{summary.lowStockCount}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Critical Stock</span>
          <strong className="summary-value">{summary.criticalCount}</strong>
        </div>

        <div className="summary-card">
          <span className="summary-label">Top Trending Today</span>
          <strong className="summary-value">
            {formatName(summary.topTrending)}
          </strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Current Inventory</h2>
            <p>
              {backendAuthoritativeMode
                ? "Live backend inventory with per-card edit/delete controls and delete confirmation."
                : "Use the 3-dot menu to edit or delete items, sort the grid, or add a new ingredient at the end."}
            </p>
          </div>

          <div className="panel-controls">
            <label className="sort-control">
              <span>Sort by</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
              >
                <option value="status">Status Priority</option>
                <option value="stock-asc">Stock %: Low to High</option>
                <option value="stock-desc">Stock %: High to Low</option>
                <option value="alpha-asc">Alphabetical: A to Z</option>
                <option value="alpha-desc">Alphabetical: Z to A</option>
              </select>
            </label>

            <button className="reset-btn" onClick={handleResetLocalChanges}>
              Reset Local Changes
            </button>
          </div>
        </div>

        <div className="inventory-grid" ref={menuRef}>
          {sortedInventory.map((item) => {
            const pct = getPercent(item.quantity, item.max);
            const status = getStatus(pct);
            const statusClass = getStatusClass(pct);

            return (
              <div className="inventory-card" key={item.id}>
                <div className="card-menu-wrap">
                  <button
                    className="menu-trigger"
                    onClick={() =>
                      setOpenMenuId((prev) => (prev === item.id ? null : item.id))
                    }
                    aria-label={`Open menu for ${formatName(item.name)}`}
                  >
                    ⋯
                  </button>

                  {openMenuId === item.id && (
                    <div className="card-menu">
                      <button
                        className="card-menu-item"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="card-menu-item danger"
                        onClick={() => requestDelete(item)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <img
                  className="ingredient-image"
                  src={getImage(item.name)}
                  alt={formatName(item.name)}
                />

                <div className="inventory-card-body">
                  <div className="inventory-card-top">
                    <div className="ingredient-identity">
                      <div>
                        <h3>{formatName(item.name)}</h3>
                        <p>
                          {item.quantity} / {item.max} units
                        </p>
                      </div>
                    </div>

                    <span className={`status-badge ${statusClass}`}>{status}</span>
                  </div>

                  <div className="progress-wrap">
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${statusClass}`}
                        style={{
                          width: `${Math.max(0, Math.min(100, pct))}%`,
                        }}
                      />
                    </div>
                    <span className="progress-text">{pct}%</span>
                  </div>

                  <button
                    className="refill-btn"
                    onClick={() => handleRefill(item)}
                  >
                    Refill {formatName(item.name)}
                  </button>
                </div>
              </div>
            );
          })}

          <button className="add-ingredient-card" onClick={openAddModal}>
            <div className="add-card-icon">＋</div>
            <div className="add-card-text">
              <strong>Add Ingredient</strong>
              <span>Create a new inventory item</span>
            </div>
          </button>
        </div>
      </section>

      <section className="analytics-grid">
        <ChartCard
          title="Today’s Trending Ingredients"
          subtitle="Usage based on current-day order activity."
        >
          <BarChart data={analytics?.todayTrending || []} formatName={formatName} />
        </ChartCard>

        <ChartCard
          title="Average Daily Usage This Month"
          subtitle="Prepared monthly average for quick comparison."
        >
          <BarChart data={analytics?.monthlyAverage || []} formatName={formatName} />
        </ChartCard>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Average Orders by Hour</h2>
            <p>Typical demand pattern from 10 AM to 8 PM.</p>
          </div>
        </div>

        <LineChart data={analytics?.hourlyDemand || []} />
      </section>

      {editorOpen && (
        <Modal onClose={closeEditor}>
          <div className="modal-header">
            <div>
              <h3>{editorMode === "edit" ? "Edit Ingredient" : "Add Ingredient"}</h3>
              <p>
                {editorMode === "edit"
                  ? "Update the ingredient name and unit values."
                  : "Create a new ingredient for the dashboard."}
              </p>
            </div>
            <button className="modal-close-btn" onClick={closeEditor}>
              ×
            </button>
          </div>

          <form className="ingredient-form" onSubmit={handleSaveIngredient}>
            <label className="form-field">
              <span>Ingredient Name</span>
              <input
                type="text"
                value={formValues.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="Example: Bacon"
              />
            </label>

            <div className="form-row">
              <label className="form-field">
                <span>Current Units</span>
                <input
                  type="number"
                  min="0"
                  value={formValues.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  placeholder="0"
                />
              </label>

              <label className="form-field">
                <span>Max Units</span>
                <input
                  type="number"
                  min="1"
                  value={formValues.max}
                  onChange={(e) => handleFormChange("max", e.target.value)}
                  placeholder="0"
                />
              </label>
            </div>

            <div className="missing-picture-note">
              New or renamed custom ingredients will use a missing-picture placeholder.
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeEditor}>
                Cancel
              </button>
              <button type="submit" className="primary-btn">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="modal-header">
            <div>
              <h3>Delete Ingredient</h3>
              <p>
                Are you sure you want to delete{" "}
                <strong>{formatName(deleteTarget.name)}</strong>?
              </p>
            </div>
            <button
              className="modal-close-btn"
              onClick={() => setDeleteTarget(null)}
            >
              ×
            </button>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={skipDeleteWarning}
              onChange={(e) => handleDeleteCheckbox(e.target.checked)}
            />
            <span>Do not show again</span>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="danger-btn"
              onClick={() => handleDeleteIngredient(deleteTarget)}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function BarChart({ data, formatName }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="bar-chart">
      {data.map((item) => {
        const width = (item.value / maxValue) * 100;

        return (
          <div className="bar-row" key={item.name}>
            <div className="bar-label">{formatName(item.name)}</div>

            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${width}%` }} />
            </div>

            <div className="bar-value">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data }) {
  const width = 900;
  const height = 260;
  const padding = 36;

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  const points = data.map((item, index) => {
    const x =
      padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y =
      height - padding - (item.value / maxValue) * (height - padding * 2);
    return { ...item, x, y };
  });

  const path = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
    )
    .join(" ");

  return (
    <div className="line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          className="axis-line"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          className="axis-line"
        />

        <path d={path} className="line-path" />

        {points.map((point) => (
          <g key={point.hour}>
            <circle cx={point.x} cy={point.y} r="5" className="line-dot" />
            <text x={point.x} y={height - 12} textAnchor="middle" className="axis-label">
              {point.hour}
            </text>
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="value-label">
              {point.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default InventoryDashboard;