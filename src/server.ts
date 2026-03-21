import express from "express";
import userRoutes from "./presentation/api/routes/user-routes.js";
import uploadRoutes from "./presentation/api/routes/upload-routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.use(userRoutes);
app.use(uploadRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});