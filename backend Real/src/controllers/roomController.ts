import * as express from "express";
import { Response } from "express";
import { RoomModel } from "../models/Room";
import { AuthRequest } from "../middleware/auth";
import { MessageModel } from "../models/messageModel";

export const roomController = {
  createRoom: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name } = req.body;
      let imageUrl = undefined;

      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const room = await RoomModel.create({
        name,
        owner: req.user._id,
        members: [req.user._id],
        imageUrl,
      });

      const populatedRoom = await RoomModel.findById(room._id)
        .populate("owner", "username email")
        .populate("members", "username email");

      res.status(201).json(populatedRoom);
      return;
    } catch (error) {
      console.error("Create room error:", error);
      res.status(400).json({ error: "สร้างห้องไม่สำเร็จ" });
      return;
    }
  },

  joinRoom: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const room = await RoomModel.findById(req.params.roomId);
      if (!room) {
        res.status(404).json({ error: "ไม่พบห้อง" });
        return;
      }

      const memberIds = room.members.map((member) => member.toString());

      if (!memberIds.includes(req.user._id.toString())) {
        room.members.push(req.user._id);
        await room.save();
      }

      const populatedRoom = await RoomModel.findById(room._id)
        .populate("owner", "username email")
        .populate("members", "username email");

      res.json(populatedRoom);
      return;
    } catch (error) {
      console.error("Join room error:", error);
      res.status(400).json({ error: "เข้าร่วมห้องไม่สำเร็จ" });
      return;
    }
  },

  updateRoom: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const room = await RoomModel.findById(req.params.roomId);

      if (!room) {
        res.status(404).json({ error: "ไม่พบห้อง" });
        return;
      }

      if (
        req.user.role !== "admin" &&
        room.owner.toString() !== req.user._id.toString()
      ) {
        res.status(403).json({ error: "ไม่มีสิทธิ์แก้ไขห้องนี้" });
        return;
      }

      room.name = req.body.name;
      await room.save();

      const updatedRoom = await RoomModel.findById(room._id)
        .populate("owner", "username email")
        .populate("members", "username email");

      res.json(updatedRoom);
    } catch (error) {
      res.status(400).json({ error: "แก้ไขห้องไม่สำเร็จ" });
    }
  },

  deleteRoom: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const room = await RoomModel.findById(req.params.roomId);

      if (!room) {
        res.status(404).json({ error: "ไม่พบห้อง" });
        return;
      }

      if (
        req.user.role !== "admin" &&
        room.owner.toString() !== req.user._id.toString()
      ) {
        res.status(403).json({ error: "ไม่มีสิทธิ์ลบห้องนี้" });
        return;
      }

      await RoomModel.findByIdAndDelete(req.params.roomId);
      res.json({ message: "ลบห้องสำเร็จ" });
    } catch (error) {
      res.status(400).json({ error: "ลบห้องไม่สำเร็จ" });
    }
  },

  uploadImage: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const room = await RoomModel.findById(req.params.roomId);
      if (!room) {
        res.status(404).json({ error: "ไม่พบห้อง" });
        return;
      }

      if (req.file) {
        room.imageUrl = `/uploads/${req.file.filename}`;
        await room.save();
      }

      res.json(room);
    } catch (error) {
      res.status(400).json({ error: "อัพโหลดรูปภาพไม่สำเร็จ" });
    }
  },

  getAllRooms: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const rooms = await RoomModel.find()
        .populate("owner", "username email")
        .populate("members", "username email")
        .select("-__v")
        .sort({ createdAt: -1 });

      res.json(rooms);
    } catch (error) {
      res.status(400).json({ error: "ไม่สามารถดึงข้อมูลห้องได้" });
    }
  },

  getRoom: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const room = await RoomModel.findById(req.params.roomId)
        .populate("owner", "username email")
        .populate("members", "username email");

      if (!room) {
        res.status(404).json({ error: "ไม่พบห้อง" });
        return;
      }

      const isMember = room.members.some(
        (member: any) => member._id.toString() === req.user._id.toString()
      );

      if (!isMember) {
        res.status(403).json({ error: "คุณไม่ใช่สมาชิกของห้องนี้" });
        return;
      }

      res.json(room);
    } catch (error) {
      console.error("Get room error:", error);
      res.status(400).json({ error: "ไม่สามารถดึงข้อมูลห้องได้" });
    }
  },

  getMessages: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const messages = await MessageModel.find({
        roomId: req.params.roomId,
      }).sort({ createdAt: 1 });
      res.json(messages);
    } catch (error) {
      res.status(400).json({ error: "ไม่สามารถดึงข้อความได้" });
    }
  },

  getPublicRooms: async (
    req: express.Request,
    res: Response
  ): Promise<void> => {
    try {
      const rooms = await RoomModel.find()
        .populate("owner", "username email")
        .populate("members", "username email")
        .select("-__v")
        .sort({ createdAt: -1 })
        .limit(10);

      res.json(rooms);
      return;
    } catch (error) {
      console.error("Get public rooms error:", error);
      res.status(400).json({ error: "ไม่สามารถดึงข้อมูลห้องสาธารณะได้" });
      return;
    }
  },
};
