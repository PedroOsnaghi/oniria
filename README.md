![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express&logoColor=black)
![Jest](https://img.shields.io/badge/Jest-29.x-C21325?logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI/CD-2088FF?logo=githubactions&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-black?logo=vercel&logoColor=white)

# ⚙️ Oniria – Backend API

- Este es el **backend de Oniria**, desarrollado en **Node.js + Express**.  
Se conecta a **Supabase** para manejar autenticación, base de datos y almacenamiento, y expone una **API REST** que permite analizar, guardar e interpretar sueños mediante IA.  

Podes acceder a ella desde: 👉 [oniria-backend.vercel.app](https://oniria-backend.vercel.app) 

## 🚀 Funcionalidades principales
- Autenticación de usuarios (integrada con Supabase Auth).  
- Gestión de sueños: creación, listado, detalles.  
- Interpretación automática de sueños mediante IA.  
- Exposición de endpoints REST para consumo desde el frontend.  

---

## 📖 Documentación

La documentación completa sobre la arquitectura y el funcionamiento del backend está disponible en la **Wiki**:  
👉 [Sección Backend en la Wiki](https://github.com/PedroOsnaghi/oniria/wiki#-backend)

---

## 🔧 Requisitos
- Node.js >= 20  
- npm (viene con Node)  
- Cuenta de **Supabase** (con el proyecto configurado).  

---

## 🛠️ Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone git@github.com:org/oniria.git
cd oniria/apps/backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Ejecutar en modo desarrollo
npm run dev
```

