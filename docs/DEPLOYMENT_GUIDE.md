# Deployment Guide: Hostinger Node.js Cloud & MariaDB

# Project: FMS — Faculty Management System

## 1. Hosting Environment Specifications

- **Application Hosting**: Hostinger Cloud Node.js Application Runner.
- **Node.js Runtime**: Version 22.22.0.
- **Database Engine**: Hostinger Managed MySQL / MariaDB Server.
- **Web Server Proxy**: Nginx reverse proxying to Node.js application port (standard port assigned by Hostinger, e.g. 3000).

---

## 2. Pre-Deployment Configuration

### 2.1 Set Environment Variables in Hostinger Control Panel

Configure the following in the Hostinger Node.js environment variables dashboard:

```bash
NODE_ENV=production
APP_NAME="Faculty Management System"
APP_URL=https://fms.geetauniversity.edu.in  # Or your assigned domain
DATABASE_URL="mysql://u123456789_fms:YourStrongPassword@127.0.0.1:3306/u123456789_fms"
USE_PRISMA_MARIADB_ADAPTER=false
AUTH_SECRET="<generate with openssl rand -base64 32>"
AUTH_TRUST_HOST=true
MEDIA_STORAGE_ROOT=/home/u123456789/fms_storage/uploads
MAX_UPLOAD_SIZE_MB=25
LOG_LEVEL=info
```

### 2.2 Persistent Media Storage Mount

On Hostinger Cloud, the deployment directory is refreshed during redeployments.
Therefore:

1. Create a dedicated storage directory outside the git deployment folder (e.g., `/home/u123456789/fms_storage/uploads`).
2. Point `MEDIA_STORAGE_ROOT` to that absolute directory.

---

## 3. Build & Launch Protocol

### 3.1 Build Command

```bash
npm run build
```

_(Executes: `prisma generate && next build --webpack`)_

### 3.2 Database Migration on Production

```bash
npm run db:migrate:deploy
```

_(Runs pending migrations safely without interactive resets)_

### 3.3 Initial Seed

```bash
INITIAL_ADMIN_EMAIL="admin@geeta.edu.in" INITIAL_ADMIN_PASSWORD="<secure-pwd>" npm run db:seed
```

### 3.4 Process Start

```bash
npm run start
```

Hostinger's process manager (PM2 or native runner) will maintain the app alive.
