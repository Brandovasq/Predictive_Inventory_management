from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
INVENTORY_FILE = BASE_DIR / "inventory.json"
ORDERS_FILE = BASE_DIR / "orders.json"


def load_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)


def save_json(file_path, data):
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)


def parse_timestamp(value):
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


def apply_modifiers(ingredients, modifiers):
    updated = ingredients.copy()

    for mod in modifiers:
        mod_type = mod.get("type")
        ingredient = mod.get("ingredient")
        quantity = mod.get("quantity", 1)
        replacement = mod.get("replacement")

        if mod_type == "remove":
            if ingredient in updated and updated[ingredient] > 0:
                updated[ingredient] -= 1

        elif mod_type == "add":
            updated[ingredient] = updated.get(ingredient, 0) + quantity

        elif mod_type == "swap":
            if ingredient in updated and updated[ingredient] > 0:
                updated[ingredient] -= 1
            if replacement:
                updated[replacement] = updated.get(replacement, 0) + 1

    return {k: v for k, v in updated.items() if v > 0}


def build_order_snapshots(orders):
    snapshots = []

    for order in orders:
        ts = parse_timestamp(order.get("timestamp"))
        if not ts:
            continue

        items = order.get("items", [])
        ingredient_totals = defaultdict(int)
        menu_items = []

        for item in items:
            final_ingredients = apply_modifiers(
                item.get("baseIngredients", {}),
                item.get("modifiers", []),
            )

            for ingredient, amount in final_ingredients.items():
                ingredient_totals[ingredient] += amount

            menu_items.append(item.get("name", "Unknown Item"))

        snapshots.append(
            {
                "timestamp": ts,
                "ingredients": dict(ingredient_totals),
                "menu_items": menu_items,
            }
        )

    return snapshots


def build_today_trending(order_snapshots, today):
    counts = defaultdict(int)

    for snap in order_snapshots:
        if snap["timestamp"].date() == today.date():
            for ingredient, qty in snap["ingredients"].items():
                counts[ingredient] += qty

    ranked = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return [{"name": name, "value": value} for name, value in ranked]


def build_monthly_average(order_snapshots, now):
    ingredient_by_day = defaultdict(lambda: defaultdict(int))

    for snap in order_snapshots:
        ts = snap["timestamp"]
        if ts.year == now.year and ts.month == now.month:
            day_key = ts.date().isoformat()
            for ingredient, qty in snap["ingredients"].items():
                ingredient_by_day[day_key][ingredient] += qty

    if not ingredient_by_day:
        return []

    totals = defaultdict(int)
    num_days = len(ingredient_by_day)

    for _, day_counts in ingredient_by_day.items():
        for ingredient, qty in day_counts.items():
            totals[ingredient] += qty

    averages = []
    for ingredient, total in totals.items():
        averages.append(
            {"name": ingredient, "value": round(total / max(num_days, 1), 1)}
        )

    averages.sort(key=lambda x: x["value"], reverse=True)
    return averages[:5]


def build_hourly_demand(order_snapshots):
    # Fixed display range for your dashboard
    labels = [
        (10, "10 AM"),
        (11, "11 AM"),
        (12, "12 PM"),
        (13, "1 PM"),
        (14, "2 PM"),
        (15, "3 PM"),
        (16, "4 PM"),
        (17, "5 PM"),
        (18, "6 PM"),
        (19, "7 PM"),
        (20, "8 PM"),
    ]

    counts = defaultdict(int)

    for snap in order_snapshots:
        hour = snap["timestamp"].hour
        if 10 <= hour <= 20:
            counts[hour] += len(snap["menu_items"])

    return [{"hour": label, "value": counts.get(hour, 0)} for hour, label in labels]


def build_analytics(orders):
    now = datetime.now()
    order_snapshots = build_order_snapshots(orders)

    return {
        "todayTrending": build_today_trending(order_snapshots, now),
        "monthlyAverage": build_monthly_average(order_snapshots, now),
        "hourlyDemand": build_hourly_demand(order_snapshots),
    }


def fallback_predictions(orders, inventory, analytics):
    now = datetime.now()
    order_snapshots = build_order_snapshots(orders)
    recent_cutoff = now - timedelta(minutes=20)

    recent_ingredient_counts = defaultdict(float)
    today_ingredient_counts = defaultdict(float)
    recent_menu_counts = defaultdict(float)
    today_menu_counts = defaultdict(float)

    for snap in order_snapshots:
        ts = snap["timestamp"]

        if ts.date() == now.date():
            for ingredient, qty in snap["ingredients"].items():
                today_ingredient_counts[ingredient] += qty

            for menu_item in snap["menu_items"]:
                today_menu_counts[menu_item] += 1

        if ts >= recent_cutoff:
            for ingredient, qty in snap["ingredients"].items():
                recent_ingredient_counts[ingredient] += qty * 2.0

            for menu_item in snap["menu_items"]:
                recent_menu_counts[menu_item] += 2.0

    monthly_avg_lookup = {
        item["name"]: float(item["value"]) for item in analytics.get("monthlyAverage", [])
    }

    ingredient_scores = defaultdict(float)

    for ingredient in set(
        list(inventory.keys())
        + list(recent_ingredient_counts.keys())
        + list(today_ingredient_counts.keys())
        + list(monthly_avg_lookup.keys())
    ):
        ingredient_scores[ingredient] = (
            recent_ingredient_counts.get(ingredient, 0)
            + today_ingredient_counts.get(ingredient, 0)
            + (0.5 * monthly_avg_lookup.get(ingredient, 0))
        )

    top_ingredient = None
    if ingredient_scores:
        top_ingredient = max(ingredient_scores.items(), key=lambda x: x[1])[0]

    top_menu_item = None
    menu_scores = defaultdict(float)
    for item in set(list(recent_menu_counts.keys()) + list(today_menu_counts.keys())):
        menu_scores[item] = recent_menu_counts.get(item, 0) + today_menu_counts.get(item, 0)

    if menu_scores:
        top_menu_item = max(menu_scores.items(), key=lambda x: x[1])[0]

    refill_candidates = []
    for ingredient, stock in inventory.items():
        predicted = ingredient_scores.get(ingredient, 0)
        if stock <= 0:
            risk = 9999
        else:
            risk = predicted / stock

        refill_candidates.append(
            {
                "name": ingredient,
                "currentStock": stock,
                "predictedDemandScore": round(predicted, 2),
                "riskScore": round(risk, 3),
            }
        )

    refill_candidates.sort(key=lambda x: x["riskScore"], reverse=True)

    emerging = sorted(
        ingredient_scores.items(),
        key=lambda x: x[1],
        reverse=True,
    )[:3]

    return {
        "predictedTopIngredient": top_ingredient,
        "predictedTopMenuItem": top_menu_item,
        "recommendedRefills": refill_candidates[:3],
        "emergingTrends": [name for name, _ in emerging],
        "modelSource": "fallback-heuristic",
    }


def run_predictions(orders, inventory, analytics):
    """
    Your teammate can drop a file named predictive_model.py in backend1
    with a function:

        def predict(orders, inventory, analytics): ...

    and return this shape:
    {
      "predictedTopIngredient": "...",
      "predictedTopMenuItem": "...",
      "recommendedRefills": [...],
      "emergingTrends": [...],
      "modelSource": "teammate-model"
    }
    """
    try:
        from predictive_model import predict  # type: ignore

        result = predict(orders, inventory, analytics)

        if isinstance(result, dict):
            result.setdefault("modelSource", "teammate-model")
            return result
    except Exception as error:
        print("predictive_model import/use failed, using fallback:", error)

    return fallback_predictions(orders, inventory, analytics)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/inventory", methods=["GET"])
def get_inventory():
    inventory = load_json(INVENTORY_FILE)
    return jsonify(inventory)


@app.route("/inventory/<path:ingredient_name>", methods=["PUT"])
def update_inventory_item(ingredient_name):
    data = request.get_json(silent=True) or {}
    quantity = data.get("quantity")

    if isinstance(quantity, bool) or not isinstance(quantity, (int, float)):
        return jsonify({"error": "Quantity must be a number"}), 400

    quantity = int(quantity)
    if quantity < 0:
        return jsonify({"error": "Quantity must be 0 or greater"}), 400

    inventory = load_json(INVENTORY_FILE)

    matched_name = next(
        (name for name in inventory.keys() if name.lower() == ingredient_name.lower()),
        None,
    )

    target_name = matched_name or ingredient_name
    inventory[target_name] = quantity
    save_json(INVENTORY_FILE, inventory)

    return jsonify(
        {
            "message": "Inventory updated",
            "ingredient": target_name,
            "quantity": quantity,
            "inventory": inventory,
        }
    )


@app.route("/orders", methods=["GET"])
def get_orders():
    orders = load_json(ORDERS_FILE)
    return jsonify(orders)


@app.route("/analytics", methods=["GET"])
def get_analytics():
    orders = load_json(ORDERS_FILE)
    return jsonify(build_analytics(orders))


@app.route("/predictions", methods=["GET"])
def get_predictions():
    orders = load_json(ORDERS_FILE)
    inventory = load_json(INVENTORY_FILE)
    analytics = build_analytics(orders)
    return jsonify(run_predictions(orders, inventory, analytics))


@app.route("/dashboard-data", methods=["GET"])
def get_dashboard_data():
    inventory = load_json(INVENTORY_FILE)
    orders = load_json(ORDERS_FILE)
    analytics = build_analytics(orders)
    predictions = run_predictions(orders, inventory, analytics)

    return jsonify(
        {
            "inventory": inventory,
            "analytics": analytics,
            "predictions": predictions,
        }
    )


@app.route("/submit-order", methods=["POST"])
def submit_order():
    data = request.get_json()

    if not data or "items" not in data:
        return jsonify({"error": "Missing items in request body"}), 400

    items = data["items"]
    inventory = load_json(INVENTORY_FILE)
    orders = load_json(ORDERS_FILE)

    inventory_changes = {}

    for item in items:
        base_ingredients = item.get("baseIngredients", {})
        modifiers = item.get("modifiers", [])
        final_ingredients = apply_modifiers(base_ingredients, modifiers)

        for ingredient, amount_needed in final_ingredients.items():
            current_stock = inventory.get(ingredient, 0)

            if current_stock < amount_needed:
                return jsonify(
                    {
                        "error": f"Not enough inventory for {ingredient}",
                        "ingredient": ingredient,
                        "needed": amount_needed,
                        "available": current_stock,
                    }
                ), 400

        for ingredient, amount_needed in final_ingredients.items():
            inventory[ingredient] -= amount_needed
            inventory_changes[ingredient] = (
                inventory_changes.get(ingredient, 0) + amount_needed
            )

    order_record = {
        "timestamp": datetime.now().isoformat(),
        "items": items,
    }

    orders.append(order_record)

    save_json(INVENTORY_FILE, inventory)
    save_json(ORDERS_FILE, orders)

    return jsonify(
        {
            "message": "Order submitted successfully",
            "inventoryChanges": inventory_changes,
            "updatedInventory": inventory,
            "orderCount": len(orders),
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, host="0.0.0.0", port=port)