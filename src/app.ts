require("dotenv").config();
import express from "express";
import connetDB from "./config/db.config";
const app = express();
import routes from "./routes";
const Port = process.env.PORT || 5000;
app.use(express.json());

app.listen(Port, () => {
  console.log(`http://localhost:${Port}/`);
});
connetDB();

app.use("/" , routes);
export default app;
