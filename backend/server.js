import app from "./src/app.js";
import dotenv from "dotenv";
import path from "path";
import db from "./src/config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

db.poolPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
