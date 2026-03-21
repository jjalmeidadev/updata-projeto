import express from "express";
import userRoutes from "./presentation/api/routes/user-routes.ts";
import uploadRoutes from "./presentation/api/routes/upload-routes.ts";

const app = express();

app.use(express.json());

app.use(userRoutes);
app.use(uploadRoutes);

app.get("/", (_req, res) => {
  res.send("Backend is running HI AFONSO");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});