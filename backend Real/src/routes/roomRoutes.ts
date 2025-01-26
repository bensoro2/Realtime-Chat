import express from "express";
import { roomController } from "../controllers/roomController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/public", roomController.getPublicRooms);
router.get("/", auth, roomController.getAllRooms);
router.post("/", auth, upload.single("image"), roomController.createRoom);
router.post("/:roomId/join", auth, roomController.joinRoom);
router.put("/:roomId", auth, roomController.updateRoom);
router.delete("/:roomId", auth, roomController.deleteRoom);
router.post(
  "/:roomId/image",
  auth,
  upload.single("image"),
  roomController.uploadImage
);
router.get("/:roomId", auth, roomController.getRoom);
router.get("/:roomId/messages", auth, roomController.getMessages);

export default router;
