import express from "express";
import 'reflect-metadata';
import cors from "cors";
import { AppRoutes } from "./infrastructure/routes/router";
import { envs } from "./config/envs";
import session from 'express-session';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 30,
    },
    name: 'oniria.sid',
    rolling: true,
  })
);

app.use(AppRoutes.routes);

const port = envs.PORT || 3000;

app.listen(port, () => {
    console.log(`Server corriendo en puerto ${port}`);
    console.log(`Modo: ${process.env.NODE_ENV}`)
});
