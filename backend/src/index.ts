import express from "express";
import cors from "cors";
import { AppRoutes } from "./routes/router";
import { envs } from "./config/envs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(AppRoutes.routes);

const port = envs.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
