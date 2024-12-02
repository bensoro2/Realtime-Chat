import * as express from "express";
import { roomController } from "../controllers/roomController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { AuthRequest } from "../middleware/auth";
import { Response } from "express";

const router = express.Router();

router.get("/", roomController.getAllRooms);
router.post(
  "/",
  auth,
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    await roomController.createRoom(req, res);
  }
);
router.post("/:roomId/join", auth, async (req: AuthRequest, res: Response) => {
  await roomController.joinRoom(req, res);
});
router.put("/:roomId", auth, async (req: AuthRequest, res: Response) => {
  await roomController.updateRoom(req, res);
});
router.delete("/:roomId", auth, async (req: AuthRequest, res: Response) => {
  await roomController.deleteRoom(req, res);
});
router.post(
  "/:roomId/image",
  auth,
  upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    await roomController.uploadImage(req, res);
  }
);

router.get("/:roomId", auth, async (req: AuthRequest, res: Response) => {
  await roomController.getRoom(req, res);
});

router.get("/:roomId/messages", auth, roomController.getMessages);

export default router;
