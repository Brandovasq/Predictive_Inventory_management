*Smart Burger Ordering & Inventory Dashboard

A full-stack restaurant system that connects live customer orders to real-time inventory tracking and predictive demand insights.

Overview

This project was built as a hackathon solution to simulate a modern restaurant ordering and inventory workflow. It integrates a customer-facing ordering interface with a backend system for real-time inventory tracking, along with a separate dashboard for monitoring stock levels, analytics, and predictive insights.

Traditional restaurant inventory systems are reactive, where staff only recognize issues after stock becomes low or unavailable. This system shifts that process toward a more proactive, data-driven approach by updating inventory instantly with every order, tracking ingredient-level usage, and surfacing trends and shortages as they occur.

The application is designed to help restaurant operators make more informed operational decisions by identifying usage patterns, highlighting potential shortages, and providing insight into future demand.

Features-

-Frontend 1 — Customer Ordering UI
Built with React, this interface allows users to browse menu items, customize ingredients at a granular level, and submit orders through an interactive, menu-based experience. Orders are sent directly to the backend for processing.

-Backend — Flask API
The backend processes incoming orders, tracks ingredient usage, and updates inventory levels in real time. It stores order history and exposes endpoints that support analytics and predictive insights displayed on the dashboard.

-Frontend 2 — Inventory Dashboard
Built with React and Vite, the dashboard provides a real-time view of inventory levels and system activity. It displays ingredient stock levels categorized as Critical, Low, Normal, and Full. The interface supports inventory management actions such as adding, editing, deleting, and refilling items.

The dashboard also includes analytics such as trending ingredients, monthly average usage, and hourly demand patterns. In addition, it presents predictive insights including high-demand ingredient forecasts, refill recommendations, and emerging trends based on historical order data.
