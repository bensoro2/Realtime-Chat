import * as express from "express";
import { userController } from "../controllers/userController";
import { auth } from "../middleware/auth";
const router = express.Router();

router.post("/register", userController.register as express.RequestHandler);
router.post("/login", userController.login as express.RequestHandler);
router.get(
  "/profile",
  auth,
  userController.getProfile as express.RequestHandler
);

export default router;
