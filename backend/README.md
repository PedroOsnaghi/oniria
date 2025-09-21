![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express&logoColor=black)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=yellow)
![Three.js](https://img.shields.io/badge/Three.js-r3f-black?logo=three.js&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-29.x-C21325?logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-black?logo=vercel&logoColor=white)

# Oniria — Análisis de Sueños con IA

Oniria es una aplicación web que permite interpretar sueños utilizando inteligencia artificial.

## 🚀 Servicios desplegados

| Servicio | Tecnología           | URL                                                                      |
| -------- | -------------------- | ------------------------------------------------------------------------ |
| Frontend | Vite + React + R3F   | [https://oniria-frontend.vercel.app](https://oniria-frontend.vercel.app) |
| Backend  | Express + TypeScript | [https://oniria-backend.vercel.app](https://oniria-backend.vercel.app)   |

---

## 🛠️ Cómo empezar a trabajar

### 1. Clonar el repositorio

```bash
git clone https://github.com/<org-o-usuario>/oniria.git
cd oniria
```

- <h5>🔘 si vas a trabajar en el Backend</h5>

```bash
cd backend
npm install
cp .env.example .env   # copiar y configurar variables de entorno
npm run dev            # levanta en http://localhost:3000
```

- <h5>🔘 si vas a trabajar en el Frontend</h5>

```bash
cd frontend
npm install
npm run dev            # levanta en http://localhost:5173
```

---

## 🔀 2. Crear ramas..

Cuando quieras empezar a trabajar en una nueva funcionalidad, **crea una rama a partir de `dev`** siguiendo la convención definida para el nombre de ramas.

<h4>📝 cómo llamamos nuestras ramas...</h4>

Usamos prefijos que indican el tipo de trabajo:

- `feature/` → para nuevas funcionalidades
- `fix/` → para corregir errores

### 📌 Ejemplos válidos

-feature/login-usuario
-feature/endpoint-suenio
-fix/correccion-bug

### 🚀 Cómo crear la rama

1. Asegurate de estar en `dev`:

```bash
git checkout dev
git pull origin dev
```

2. Crea la rama con el nombre adecuado:

```bash
git checkout -b feature/login-usuario
```

y listo!, ya podes empezar a trabajar..

<div style="margin: 0px auto; width:80%;">
<div style="display:flex;flex-direction:column;">
<img src="https://github.com/PedroOsnaghi.png" width="100" style="border-radius:50%;">
<strong>Pedro Osnaghi</strong>
<div>
<div>
