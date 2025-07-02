require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
import cors from "cors";
const app = express();
import routes from "./routes";
import path from "path";
const Port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.listen(Port, () => {
  console.log(`http://localhost:${Port}/`);
});
// Serve static files from "../public"
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);

connetDB();

app.use("/", routes);
export default app;
