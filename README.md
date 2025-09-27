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
| Frontend | Vite + React + R3F   | [https://oniria-frontend.vercel.app](https://oniria-one.vercel.app/) |
| Backend  | Express + TypeScript | [https://oniria-backend.vercel.app](https://oniria-6pou.vercel.app/)   |

---

## 🛠️ Cómo empezar a trabajar

### 1. Clonar el repositorio

```bash
git clone git@github.com:PedroOsnaghi/oniria.git
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

### 📝 cómo llamamos nuestras ramas...

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

## 🧑‍💻 Flujo de trabajo para nuevas funcionalidades

Cuando termines de desarrollar una funcionalidad:

### 1. Commit de tus cambios
```bash
git add .
git commit -m "feat: agregar interpretación con OPENAI"
```
### 2. Subir la rama al remoto
```bash
Copiar código
git push -u origin feature/interpretacion-openai
```
### 3. Crear Pull Request (PR)

 - Venite al repo y anda a la pestaña `Pull request` y selecciona `New Pull Request`
   
 <img width="224" height="145" alt="Image" src="https://github.com/user-attachments/assets/a5cee9bb-ee2c-403d-ac3d-492f781766b7" />

 - Base branch: dev

 - Compare branch: feature/...

⚠️ Importante: la PR siempre apunta a dev, nunca a main.

### 4. Completar la plantilla de PR

- Explicá qué hace la PR

- Marcá el checklist (tests, lint, docs)

- Señalá qué áreas se modificaron

- Agregá notas/screenshots si aplica

### 5. Asignar revisores

- Asigná 2 revisores del equipo (a la derecha `reviewers`)
  
<img width="272" height="287" alt="Image" src="https://github.com/user-attachments/assets/8ea11b7b-933e-4c01-b34d-29e2dd6ef7d6" />

- Ellos deben aprobar la PR

### 6. Verificación automática

- Al abrir la PR se ejecutan los tests automáticos (CI)

- Si fallan ❌ → corregí y volvé a pushear

- Si todo pasa ✅ y hay 2 aprobaciones → se puede mergear

### 7. Merge a dev

- Usar Squash & Merge para mantener el historial limpio

- El código queda integrado en dev

---

<h2>El equipo de Oniria 😎</h2>

| [<img src="https://github.com/moavalos.png" width="100" style="border-radius:50%"><br/>Mora Avalos](https://github.com/moavalos)     | [<img src="https://github.com/ClarisaR.png" width="100" style="border-radius:50%"><br/>Clarisa R](https://github.com/ClarisaR)                     | [<img src="https://github.com/PedroOsnaghi.png" width="100" style="border-radius:50%"><br/>Pedro Osnaghi](https://github.com/PedroOsnaghi) | [<img src="https://github.com/KevinLlombart.png" width="100" style="border-radius:50%"><br/>Kevin Llombart](https://github.com/KevinLlombart) |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [<img src="https://github.com/tomycernik.png" width="100" style="border-radius:50%"><br/>Tomy Cernik](https://github.com/tomycernik) | [<img src="https://github.com/MilagrosChavezz.png" width="100" style="border-radius:50%"><br/>Milagros Chavez](https://github.com/MilagrosChavezz) | [<img src="https://github.com/ma3rtin.png" width="100" style="border-radius:50%"><br/>Martin Mutuverria](https://github.com/ma3rtin)       | [<img src="https://github.com/usuario8.png" width="100" style="border-radius:50%"><br/>Pedro Ricartes](https://github.com/ricartes123)             |

---
