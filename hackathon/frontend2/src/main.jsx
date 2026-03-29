import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import InventoryDashboard from "./components/InventoryDashboard";
import "./styles.css";

const fallbackInventory = [
  { name: "bun", quantity: 50, max: 50 },
  { name: "patty", quantity: 26, max: 40 },
  { name: "cheese", quantity: 12, max: 35 },
  { name: "lettuce", quantity: 18, max: 30 },
  { name: "tomato", quantity: 9, max: 30 },
  { name: "onion", quantity: 7, max: 20 },
  { name: "pickles", quantity: 16, max: 25 },
  { name: "sauce", quantity: 10, max: 20 },
  { name: "fries", quantity: 22, max: 30 },
  { name: "salt", quantity: 17, max: 20 },
  { name: "vegan patty", quantity: 8, max: 20 },
  { name: "chicken", quantity: 11, max: 20 },
  { name: "coke", quantity: 14, max: 24 },
  { name: "dietCoke", quantity: 10, max: 24 },
  { name: "sprite", quantity: 9, max: 24 },
  { name: "water", quantity: 16, max: 30 },
  { name: "ice", quantity: 65, max: 100 },
];

const fallbackAnalytics = {
  todayTrending: [
    { name: "patty", value: 42 },
    { name: "bun", value: 39 },
    { name: "fries", value: 28 },
    { name: "cheese", value: 24 },
    { name: "lettuce", value: 19 },
  ],
  monthlyAverage: [
    { name: "bun", value: 34 },
    { name: "patty", value: 31 },
    { name: "fries", value: 25 },
    { name: "cheese", value: 22 },
    { name: "lettuce", value: 16 },
  ],
  hourlyDemand: [
    { hour: "10 AM", value: 8 },
    { hour: "11 AM", value: 12 },
    { hour: "12 PM", value: 24 },
    { hour: "1 PM", value: 29 },
    { hour: "2 PM", value: 18 },
    { hour: "3 PM", value: 15 },
    { hour: "4 PM", value: 20 },
    { hour: "5 PM", value: 26 },
    { hour: "6 PM", value: 31 },
    { hour: "7 PM", value: 23 },
    { hour: "8 PM", value: 10 },
  ],
};

const fallbackPredictions = {
  predictedTopIngredient: "patty",
  predictedTopMenuItem: "Classic Burger",
  recommendedRefills: [
    { name: "patty", currentStock: 26, predictedDemandScore: 12.5, riskScore: 0.41 },
    { name: "bun", currentStock: 50, predictedDemandScore: 10.8, riskScore: 0.3 },
    { name: "fries", currentStock: 22, predictedDemandScore: 8.6, riskScore: 0.22 },
  ],
  emergingTrends: ["patty", "bun", "fries"],
  modelSource: "fallback-demo",
};

const maxValues = {
  bun: 50,
  patty: 40,
  cheese: 35,
  lettuce: 30,
  tomato: 30,
  onion: 20,
  pickles: 25,
  sauce: 20,
  fries: 30,
  salt: 20,
  "vegan patty": 20,
  chicken: 20,
  coke: 24,
  dietCoke: 24,
  sprite: 24,
  water: 30,
  ice: 100,
};

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

const DASHBOARD_POLL_INTERVAL_MS = 3000;

function formatInventoryObject(data) {
  return Object.entries(data).map(([name, quantity]) => ({
    name,
    quantity,
    max: maxValues[name] || Math.max(quantity, 1),
  }));
}


function App() {
  const [inventory, setInventory] = useState(fallbackInventory);
  const [analytics, setAnalytics] = useState(fallbackAnalytics);
  const [predictions, setPredictions] = useState(fallbackPredictions);
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadDashboardData = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMessage("");
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard-data`);

      if (!response.ok) {
        throw new Error(`Dashboard request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data?.inventory && typeof data.inventory === "object") {
        setInventory(formatInventoryObject(data.inventory));
      }

      if (data?.analytics) {
        setAnalytics(data.analytics);
      }

      if (data?.predictions) {
        setPredictions(data.predictions);
      }

      setBackendConnected(true);
      setErrorMessage("");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);

      if (!silent) {
        setInventory(fallbackInventory);
        setAnalytics(fallbackAnalytics);
        setPredictions(fallbackPredictions);
      }

      setBackendConnected(false);
      setErrorMessage("Live backend unavailable. Showing demo data instead.");
      setLastUpdated(new Date());
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const updateInventoryItem = async (ingredientName, quantity) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/inventory/${encodeURIComponent(ingredientName)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        throw new Error(`Inventory update failed: ${response.status}`);
      }

      await loadDashboardData({ silent: true });
      return true;
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      setErrorMessage("Could not sync inventory update to backend.");
      return false;
    }
  };

  useEffect(() => {
    loadDashboardData();

    const timer = setInterval(() => {
      loadDashboardData({ silent: true });
    }, DASHBOARD_POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <InventoryDashboard
      initialInventory={inventory}
      analytics={analytics}
      predictions={predictions}
      backendConnected={backendConnected}
      loading={loading}
      errorMessage={errorMessage}
      onRefresh={loadDashboardData}
      onUpdateInventoryItem={updateInventoryItem}
      lastUpdated={lastUpdated}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);