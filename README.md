# Smart Burger Ordering & Inventory Dashboard

A full-stack smart burger ordering and inventory management system with real-time analytics and AI-driven demand prediction.

## Overview

This project was built as a hackathon solution to simulate a smarter fast-food ordering and kitchen inventory workflow. It combines a customer-facing ordering interface, a Flask backend for inventory tracking, and a separate inventory dashboard for monitoring stock levels, analytics, and predictive insights.

The system is designed to help restaurant staff move from reactive inventory tracking to more proactive decision-making by identifying trends, highlighting shortages, and surfacing refill recommendations.

## Features

### Frontend 1 — Customer Ordering UI
- Built with React
- Lets users browse menu items
- Supports ingredient customization
- Allows cart and order submission
- Sends orders to the backend

### Backend — Flask API
- Receives submitted orders
- Tracks ingredient usage
- Updates remaining inventory
- Stores order history
- Exposes dashboard data for analytics and predictions

### Frontend 2 — Inventory Dashboard
- Built with React + Vite
- Displays current ingredient inventory
- Shows stock status levels such as Critical, Low, Normal, and Full
- Supports local dashboard actions such as add, edit, delete, and refill
- Includes sortable inventory cards
- Shows analytics for trending ingredients, monthly average usage, and hourly demand
- Displays AI insights such as predicted top ingredient, refill recommendations, and emerging trends

## Architecture

```text
Frontend 1 (Customer Ordering UI)
        ↓
Backend (Flask API)
        ↓
Frontend 2 (Inventory Dashboard + AI Insights)
```
