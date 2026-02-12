# 🎫 Ticketing App

A microservices-based event ticketing application built with Node.js, TypeScript, React, and Kubernetes.

---

## 🏗️ Architecture Overview

This application consists of the following microservices:

| Service        | Description                                   |
| -------------- | --------------------------------------------- |
| **auth**       | User authentication (signup, signin, signout) |
| **tickets**    | Ticket creation and management                |
| **orders**     | Order processing and management               |
| **payments**   | Payment processing via Stripe                 |
| **expiration** | Order expiration handling with Redis          |
| **client**     | Next.js frontend application                  |

**Supporting Infrastructure:**
- MongoDB instances for each service requiring persistence
- NATS Streaming Server for event-based communication
- Redis for the expiration service queue
- ingress-nginx for routing

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your Mac:

### 1. Docker Desktop
Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)

After installation, **enable Kubernetes**:
1. Open Docker Desktop
2. Go to **Settings** → **Kubernetes**
3. Check **Enable Kubernetes**
4. Click **Apply & Restart**

### 2. Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3. Skaffold
```bash
brew install skaffold
```

---

## 🚀 Installation & Setup

### Step 1: Deploy ingress-nginx

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.14.3/deploy/static/provider/cloud/deploy.yaml
```

> 📚 More details at [kubernetes.github.io/ingress-nginx/deploy](https://kubernetes.github.io/ingress-nginx/deploy/)

### Step 2: Configure /etc/hosts

Add the following entry to your hosts file:

```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1 ticketing.dev
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 3: Install Dependencies

First, build the shared common package:
```bash
cd common
npm install
npm run build
cd ..
```

Then install dependencies for each service:
```bash
cd auth && npm install && cd ..
cd tickets && npm install && cd ..
cd orders && npm install && cd ..
cd payments && npm install && cd ..
cd expiration && npm install && cd ..
cd client && npm install && cd ..
```

### Step 4: Create Kubernetes Secrets

The application requires the following secrets:

**JWT Secret** (required for authentication):
```bash
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_jwt_secret_key_here
```

**Stripe Secret** (required for payments):
```bash
kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=your_stripe_secret_key_here
```

> 💡 Get your Stripe test key from [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)

---

## ▶️ Running the Application

Start the development environment with Skaffold:

```bash
skaffold dev
```

This will:
- Build all Docker images
- Deploy all services to your local Kubernetes cluster
- Watch for file changes and sync automatically

> ⏳ The first run may take several minutes to pull/build all images.

To stop the application, press `Ctrl+C` in the terminal.

---

## 🌐 Accessing the Application

Once all pods are running, open your browser and navigate to:

```
https://ticketing.dev
```

### ⚠️ Handling the HTTPS Certificate Warning

Since we're using a self-signed certificate, your browser will show a security warning.

**Chrome on Mac:**
1. When you see "Your connection is not private"
2. Click anywhere on the page
3. Type `thisisunsafe` (you won't see the text appear)
4. The page will load

---

## 🔍 Useful Commands

**Check pod status:**
```bash
kubectl get pods
```

**View logs for a specific service:**
```bash
kubectl logs -f deployment/auth-depl
```

**Restart a deployment:**
```bash
kubectl rollout restart deployment/auth-depl
```

**View all services:**
```bash
kubectl get services
```

---

## 🐛 Troubleshooting

### Pods stuck in `Pending` or `CrashLoopBackOff`

Check if secrets are created:
```bash
kubectl get secrets
```

You should see `jwt-secret` and `stripe-secret` listed.

### ingress-nginx not working

Verify the ingress controller is running:
```bash
kubectl get pods -n ingress-nginx
```

### Nginx error page showing instead of the app

Sometimes, on existing Kubernetes installations, there might already be a loadbalancer installed (like Traefik), which can cause race conditions and override ingress-nginx. This results in a nginx error page showing on the host instead of the app.

To check if Traefik exists:
```bash
kubectl get namespace
```

Look for `traefik` in the list. If it exists, delete it:
```bash
kubectl delete namespace traefik
```

Now the app should work properly.

### Port 80/443 already in use

Stop any services using these ports (like Apache or another web server):
```bash
sudo lsof -i :80
sudo lsof -i :443
```

### Skaffold build failures

Ensure Docker Desktop is running and has sufficient resources allocated (recommended: 4+ GB RAM, 2+ CPUs).

### "Connection refused" errors

Wait for all pods to be in `Running` state:
```bash
kubectl get pods --watch
```

---

## 📁 Project Structure

```
ticketing/
├── auth/           # Authentication service
├── client/         # Next.js frontend
├── common/         # Shared npm package
├── expiration/     # Order expiration service
├── orders/         # Orders service
├── payments/       # Payments service
├── tickets/        # Tickets service
├── infra/k8s/      # Kubernetes manifests
└── skaffold.yaml   # Skaffold configuration
```

---

## 📝 License

This project is for educational purposes.
