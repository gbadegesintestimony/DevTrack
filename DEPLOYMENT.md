# DevTrack — Production Deployment & Infrastructure Guide

This handbook provides step-by-step instructions for deploying **DevTrack** to:
1. **Target A: Managed PaaS (Vercel + Render)** — Ideal for zero-maintenance CI/CD.
2. **Target B: Self-Hosted Cloud (AWS EC2 + Docker Compose)** — Ideal for full DevOps control.

---

## 🏛️ Architecture Overview

```text
Target A: Managed Cloud (Vercel + Render)
┌─────────────────────────┐          ┌─────────────────────────┐
│     Vercel Edge CDN     │  HTTPS   │    Render Web Service   │
│   (React + Vite SPA)    ├─────────►│  (Express.js + Prisma)  │
│  devtrack.vercel.app    │          │  devtrack-api.onrender  │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │ Render PostgreSQL (v16) │
                                     └─────────────────────────┘

Target B: AWS EC2 Instance (Single-Node Docker Compose)
┌──────────────────────────────────────────────────────────────┐
│                    AWS EC2 Linux Instance                    │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │    Frontend    │  │    Backend     │  │   PostgreSQL   │  │
│  │ (Nginx:Alpine) │  │ (Node:Alpine)  │  │ (Postgres:16)  │  │
│  │    Port 80     │  │   Port 5000    │  │   Port 5432    │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                         Docker Bridge Network                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Option A: Vercel (Frontend) + Render (Backend + Database)

### 1. Deploy Database & Backend on Render
1. Push your DevTrack repository to **GitHub**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Select your `DevTrack` repository. Render will automatically detect the [render.yaml](file:///c:/Users/testy/DevTrack/render.yaml) file.
5. Click **Apply**. Render will automatically provision:
   - **`devtrack-db`**: Managed PostgreSQL database.
   - **`devtrack-api`**: Express Web Service with auto-migrations and healthchecks.
6. Copy your backend service URL (e.g. `https://devtrack-api-xxxx.onrender.com`).

### 2. Deploy Frontend on Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. In **Root Directory**, select `frontend`.
4. In **Build & Development Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://devtrack-api-xxxx.onrender.com/api/v1`
6. Click **Deploy**. Vercel will build and deploy using [vercel.json](file:///c:/Users/testy/DevTrack/frontend/vercel.json).
7. Once deployed, copy your Vercel URL (e.g. `https://devtrack.vercel.app`).
8. Return to your Render Web Service settings and set:
   - `FRONTEND_URL` = `https://devtrack.vercel.app`

---

## ⚡ Option B: AWS EC2 (Full-Stack Docker Compose)

### 1. Launch AWS EC2 Instance
1. In the AWS Console, launch an EC2 instance:
   - **AMI**: Ubuntu 22.04 LTS or 24.04 LTS (64-bit x86)
   - **Instance Type**: `t3.small` or `t3.medium` (minimum 2GB RAM recommended)
   - **Storage**: 20GB+ gp3 EBS volume.
2. In **Security Group Rules**, allow:
   - `SSH` (Port 22) from your IP
   - `HTTP` (Port 80) from `0.0.0.0/0`
   - `HTTPS` (Port 443) from `0.0.0.0/0`
   - `Custom TCP` (Port 5000) from `0.0.0.0/0` (if direct API access is desired)

### 2. Connect & Run Automated Deployment
1. Connect to your EC2 instance via SSH:
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/DevTrack.git
   cd DevTrack
   ```
3. Run the automated provisioning script:
   ```bash
   chmod +x scripts/deploy-ec2.sh
   ./scripts/deploy-ec2.sh
   ```
4. The script will automatically:
   - Install Docker and Docker Compose plugin.
   - Generate secure random production secrets in `.env`.
   - Build and start all 3 containers (`postgres`, `backend`, `frontend`).
   - Run Prisma production migrations.

### 3. Setup Custom Domain & HTTPS on EC2 (Optional)
To attach a custom domain with free SSL:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔑 Environment Variables Reference

| Variable | Scope | Description | Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Backend | Environment mode | `production` |
| `PORT` | Backend | Express HTTP listening port | `5000` |
| `DATABASE_URL` | Backend | PostgreSQL connection URI | `postgresql://user:pass@host:5432/devtrack?schema=public` |
| `SESSION_SECRET` | Backend | Key for HMAC token signatures (min 32 chars) | Generated random hex |
| `CSRF_SECRET` | Backend | Key for CSRF token signatures (min 32 chars) | Generated random hex |
| `FRONTEND_URL` | Backend | Origin for CORS & cookie domain lock | `https://devtrack.vercel.app` |
| `VITE_API_URL` | Frontend | Base URL of backend API | `https://api.devtrack.com/api/v1` |

---

## 🔍 Health & Verification Endpoints

- **Live Health Diagnostics**: `GET /api/v1/health`
- **CSRF Handshake**: `GET /api/v1/auth/csrf-token`
- **Session Verification**: `GET /api/v1/auth/me`
