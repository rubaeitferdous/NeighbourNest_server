<div align="center">

# 🛠️ NeighbourNest — Server

**REST API for the HelpingHands BD Community Service Events Platform**

[Live Site](https://neighbournest-eight.vercel.app/) · [Client Repository](https://github.com/rubaeitferdous/neighbour_nest_web) · [Server Repository](https://github.com/rubaeitferdous/NeighbourNest_server)

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT_(jose)-000000?logo=jsonwebtokens)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

</div>

---

## 📖 Table of Contents

1. [About the Project](#-about-the-project)
2. [Live Demo & Links](#-live-demo--links)
3. [Features](#-features)
4. [Tech Stack](#-tech-stack)
5. [Architecture Overview](#-architecture-overview)
6. [Project Structure](#-project-structure)
7. [Environment Variables](#-environment-variables)
8. [Getting Started](#-getting-started)
9. [API Reference](#-api-reference)
10. [Authentication & Security](#-authentication--security)
11. [Data Models](#-data-models)
12. [Deployment](#-deployment)
13. [Troubleshooting](#-troubleshooting)
14. [Author](#-author)

---

## 🌱 About the Project

This is the **backend** of **HelpingHands BD** (NeighbourNest) — a platform where people create, join and track social service events such as cleanups, tree planting, donation drives and volunteer days.

The server is a lightweight **Express 5** application backed by **MongoDB**. It exposes a JSON REST API consumed by the [Next.js web app](https://github.com/rubaeitferdous/neighbour_nest_web), verifies the user's **JWT** with `jose`, and is configured for serverless deployment on **Vercel**.

---

## 🔗 Live Demo & Links

| Resource | Link |
| --- | --- |
| 🌐 Live Site | https://neighbournest-eight.vercel.app/ |
| 💻 Client Repository | https://github.com/rubaeitferdous/neighbour_nest_web |
| 🛠️ Server Repository | https://github.com/rubaeitferdous/NeighbourNest_server |

---

## ✨ Features

- **Event management** — create, read, update and delete community service events.
- **Join & track** — users can join events; the API tracks participants and each user's created/joined events.
- **JWT-protected routes** — private endpoints verify the bearer token before running.
- **Ownership checks** — only an event's creator can edit or delete it.
- **MongoDB persistence** — events and participation data stored with the official MongoDB driver.
- **CORS-enabled** — safe cross-origin access for the web client.
- **Serverless-ready** — `vercel.json` included for one-step deployment on Vercel.
- **ES Modules** — modern `import`/`export` syntax throughout.

---

## 🧰 Tech Stack

| Purpose | Package | Version |
| --- | --- | --- |
| Web framework | `express` | ^5.3 |
| Database driver | `mongodb` | ^7.8 |
| JWT verification | `jose` | ^6.2 |
| Cross-origin requests | `cors` | ^2.8 |
| Environment config | `dotenv` | ^18 |
| Module system | ES Modules (`"type": "module"`) | — |
| Hosting | Vercel | — |

---

## 🏗️ Architecture Overview

```text
┌──────────────────┐   HTTPS + JWT    ┌────────────────────┐        ┌──────────────┐
│  Next.js client  │ ───────────────▶ │  Express 5 server  │ ─────▶ │   MongoDB    │
│  (Better Auth)   │ ◀─────────────── │  (this repo)       │ ◀───── │   (Atlas)    │
└──────────────────┘     JSON         └────────────────────┘        └──────────────┘
```

1. The client authenticates the user with Better Auth and obtains a JWT.
2. The client calls this API with `Authorization: Bearer <token>`.
3. The server verifies the token (`jose`), runs the request against MongoDB and returns JSON.

---

## 📁 Project Structure

```text
NeighbourNest_server/
├── src/              # Application source — server entry, routes, DB connection, middleware
├── .gitignore
├── package.json
├── package-lock.json
├── vercel.json       # Vercel serverless configuration
└── README.md
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db-name>

# Client origin for CORS and Better Auth JWKS
CLIENT_URL=http://localhost:3000
```

| Variable | Required | Description |
| --- | :---: | --- |
| `PORT` | ➖ | Port to run the server on (defaults to `5000` locally) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `CLIENT_URL` | ✅ | Front-end origin used to fetch Better Auth's public JWKS and for CORS. Set this to the deployed client URL without a trailing slash, e.g. `https://neighbournest-eight.vercel.app`. |

> ⚠️ Adjust the variable names to match the ones read in `src/`. Never commit your `.env` file — it is already listed in `.gitignore`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm**
- A **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rubaeitferdous/NeighbourNest_server.git
cd NeighbourNest_server

# 2. Install dependencies
npm install

# 3. Create your .env file (see Environment Variables above)

# 4. Start the server
node src/index.js
```

The API will be available at <http://localhost:5000>.

### Recommended npm scripts

Add these to `package.json` for convenience:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "node --watch src/index.js"
}
```

Then run `npm run dev` for auto-restart during development.

> Replace `src/index.js` with your actual entry file if it is named differently.

---

## 📡 API Reference

**Base URL (local):** `http://localhost:5000`

Authenticated routes require the header:

```http
Authorization: Bearer <JWT>
```

> The table below documents the intended REST design. Keep it in sync with the routes declared in `src/`.

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | :---: | --- |
| `GET` | `/` | ❌ | Server health / welcome message |

### Events

| Method | Endpoint | Auth | Description |
| --- | --- | :---: | --- |
| `GET` | `/events` | ❌ | List upcoming events |
| `GET` | `/events/:id` | ❌ | Get one event's details |
| `POST` | `/events` | ✅ | Create a new event |
| `PUT` | `/events/:id` | ✅ (owner) | Update an event |
| `DELETE` | `/events/:id` | ✅ (owner) | Delete an event |

### Participation

| Method | Endpoint | Auth | Description |
| --- | --- | :---: | --- |
| `POST` | `/events/:id/join` | ✅ | Join an event |
| `GET` | `/my-events` | ✅ | Events created by the current user |
| `GET` | `/joined-events` | ✅ | Events the current user has joined |

### Example request

```bash
curl -X POST http://localhost:5000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "title": "Dhanmondi Lake Cleanup",
    "description": "Bring gloves — we provide the bags.",
    "date": "2026-12-12",
    "location": "Dhanmondi, Dhaka",
    "category": "Cleanup"
  }'
```

### Example response

```json
{
  "acknowledged": true,
  "insertedId": "66f1c0b8e4b0a1d2c3e4f567"
}
```

### Status codes

| Code | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Resource created |
| `400` | Invalid request body |
| `401` | Missing or invalid token |
| `403` | Authenticated but not allowed (e.g. not the event owner) |
| `404` | Resource not found |
| `500` | Server error |

---

## 🔒 Authentication & Security

- Tokens are verified with **`jose`** — requests with a missing, expired or tampered token get `401 Unauthorized`.
- The verified user's identity (id/email) is read from the token — never trust ids sent in the request body.
- **CORS** is restricted to the client origin(s).
- Secrets live in environment variables, never in source control.
- Ownership is enforced server-side before updating or deleting an event.

---

## 🗄️ Data Models

### `events`

| Field | Type | Description |
| --- | --- | --- |
| `_id` | `ObjectId` | Unique identifier |
| `title` | `string` | Event name |
| `description` | `string` | What the event is about |
| `date` | `string / Date` | When it takes place |
| `location` | `string` | Where it takes place |
| `category` | `string` | e.g. Cleanup, Tree planting, Donation drive |
| `image` | `string` | Cover image URL |
| `createdBy` | `string` | Email / id of the organizer |
| `participants` | `array` | Users who joined |
| `createdAt` | `Date` | Creation timestamp |

> Adjust the fields to match your actual MongoDB documents.

---

## ☁️ Deployment

The server is configured for **Vercel** through `vercel.json`.

1. Push the repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Add `MONGODB_URI` and `CLIENT_URL` under **Settings → Environment Variables**. Set `CLIENT_URL` to the deployed client origin exactly (for example, `https://neighbournest-eight.vercel.app`, without a trailing slash).
4. In MongoDB Atlas, allow Vercel's IPs (**Network Access → `0.0.0.0/0`** for serverless).
5. Deploy, then set the resulting URL as `NEXT_PUBLIC_API_URL` in the client project.

---

## 🩹 Troubleshooting

| Problem | Likely fix |
| --- | --- |
| `MongoServerSelectionError` | Check `MONGODB_URI` and Atlas Network Access rules |
| CORS error in the browser | Make sure `CLIENT_URL` matches the client origin exactly (no trailing slash) |
| `401 Unauthorized` on private routes | Confirm the secret matches the client and the token isn't expired |
| Works locally, fails on Vercel | Verify all environment variables are set in the Vercel dashboard |

---

## 👤 Author

**S M Rubaeit Ferdus**
GitHub: [@rubaeitferdous](https://github.com/rubaeitferdous)

---

<div align="center">

*Small acts. Stronger communities.* 💚

</div>
