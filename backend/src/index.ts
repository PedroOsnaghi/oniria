import express from "express";
import { AppRoutes } from "./routes/router";
import cors from "cors";
import { envs } from "./config/envs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(AppRoutes.routes);

const port = envs.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});