import express from "express";
const router = express.Router();
import eventRoutes from "./event";

import auth from "./auth";
router.get("/", (req, res) => {
  res.send("done");
});

router.use("/auth", auth);
// router.use("/send-mail", mailsend);
// ... other imports ...

// ... other middleware ...
router.use("/events", eventRoutes);

export default router;
