# 🚀 MuleGuard AI - Production Deployment Guide

This guide provides step-by-step instructions to deploy **MuleGuard AI** to production using **Vercel (Frontend)**, **Render or Railway (Backend)**, and **Neo4j AuraDB (Cloud Graph Database)**.

---

## 🏗 Architecture Overview

| Component | Technology | Target Platform | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, Lucide | **Vercel** | ✅ Yes |
| **Backend API** | FastAPI, Python 3.11, Tesseract OCR, OpenCV | **Render** or **Railway** | ✅ Yes |
| **Database (Relational)** | SQLite (Digital Chain of Custody & Evidence) | Mounted Disk on Render / Railway | ✅ Yes |
| **Database (Graph)** | Neo4j Graph Database | **Neo4j AuraDB Free** | ✅ Yes |

---

## 📋 Step 1: Set Up Free Neo4j AuraDB Cloud Instance (2 mins)

1. Go to [Neo4j AuraDB Free](https://neo4j.com/cloud/aura-free/) and sign up / log in.
2. Click **Create an Instance** and select **AuraDB Free** (0.00 / month).
3. Choose your preferred cloud region and click **Create**.
4. **Save your credentials**:
   * **Connection URI**: `neo4j+s://<unique-id>.databases.neo4j.io`
   * **Username**: `neo4j`
   * **Password**: *(The generated password shown upon instance creation)*
5. Wait ~60 seconds for the instance status to turn **Running** (Green).

---

## ⚡ Step 2: Deploy Backend to Render or Railway

### Option A: Deploying on Render (Recommended)

1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `https://github.com/mk2514/muleGuard.git`.
4. Fill in the service configuration:
   * **Name**: `muleguard-api`
   * **Region**: Choose closest to you (e.g., Oregon or Frankfurt)
   * **Language**: `Docker`
   * **Dockerfile Path**: `./backend/Dockerfile`
   * **Docker Context**: `./backend`
   * **Instance Type**: `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `8000` | Internal server port |
   | `DATABASE_PATH` | `muleguard.db` | Path to case database |
   | `NEO4J_URI` | `neo4j+s://<id>.databases.neo4j.io` | Your AuraDB connection URI |
   | `NEO4J_USER` | `neo4j` | Neo4j user |
   | `NEO4J_PASSWORD` | `your_auradb_password` | Your AuraDB password |
   | `FRONTEND_URL` | `https://*.vercel.app` | Allow CORS requests from Vercel |
6. Click **Create Web Service**. Render will build the Docker container and start your FastAPI service.
7. Once deployed, copy your backend URL (e.g. `https://muleguard-api.onrender.com`).

---

### Option B: Deploying on Railway

1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `mk2514/muleGuard`.
4. Go to **Settings**:
   * **Root Directory**: `backend`
   * **Builder**: `DOCKERFILE` (uses `backend/Dockerfile`)
5. Go to **Variables** and add:
   * `PORT`: `8000`
   * `NEO4J_URI`: `neo4j+s://<id>.databases.neo4j.io`
   * `NEO4J_USER`: `neo4j`
   * `NEO4J_PASSWORD`: `your_password`
6. Go to **Settings** -> **Networking** -> click **Generate Domain** to get your public URL (e.g., `https://muleguard-backend-production.up.railway.app`).

---

## 🌐 Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `mk2514/muleGuard`.
4. Configure Project Settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: Click *Edit* and select **`frontend`**
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://muleguard-api.onrender.com` *(Your Render/Railway backend URL without trailing slash)* |
6. Click **Deploy**.
7. In ~60 seconds, Vercel will deploy your application with a public domain (e.g., `https://muleguard-ai.vercel.app`).

---

## 🐳 Alternative: Self-Host with Docker Compose (Single Server / VPS)

If you wish to host the entire stack on an Ubuntu VPS, AWS EC2, or DigitalOcean Droplet:

1. Clone the repository on your server:
   ```bash
   git clone https://github.com/mk2514/muleGuard.git
   cd muleGuard
   ```
2. Start the entire application with one command:
   ```bash
   docker compose up -d --build
   ```
3. Your application is live:
   * **Frontend Web App**: `http://<your-server-ip>`
   * **Backend API Documentation**: `http://<your-server-ip>:8000/docs`
   * **Neo4j Browser**: `http://<your-server-ip>:7474` (User: `neo4j`, Password: `password123`)

---

## ✅ Post-Deployment Verification Checklist

1. **API Status**:
   Visit `https://<your-backend-url>/docs` to view the interactive Swagger API documentation.
2. **Database Ingestion**:
   Go to `/datasources` in your Vercel web app and upload an evidence dataset (CSV, Excel, or PDF). Verify records populate in `/output`.
3. **Entity Resolution & Accused Display**:
   Navigate to `/entities`. Verify that primary accused (`RAVI SHARMA`) and co-accused (`VIKRAM MALHOTRA`) appear in the Entity Table and Entity Cluster SVG with red alert badges.
4. **Neo4j Live Graph Synchronization**:
   Navigate to `/graph`. Click **Sync to Live Neo4j** to push graph nodes and relationships to your Neo4j AuraDB instance.
5. **Chain of Custody & Timeline**:
   Check `/custody` and `/timeline` to ensure SQLite event logging and digital verification are functioning.
