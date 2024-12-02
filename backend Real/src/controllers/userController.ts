import { Request, Response } from "express";
import { UserModel } from "../models/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const userController = {
  register: async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        username,
        email,
        password: hashedPassword,
      });

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.status(201).json({ user: userResponse });
    } catch (error) {
      res.status(400).json({ error: "การลงทะเบียนล้มเหลว" });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        throw new Error("ไม่พบผู้ใช้");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("รหัสผ่านไม่ถูกต้อง");
      }

      const token = jwt.sign({ _id: user._id }, JWT_SECRET);

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json({ user: userResponse, token });
    } catch (error) {
      res.status(400).json({ error: "เข้าสู่ระบบล้มเหลว" });
    }
  },

  getProfile: async (req: AuthRequest, res: Response) => {
    try {
      const user = await UserModel.findById(req.user._id).select("-password");
      if (!user) {
        return res.status(404).json({ error: "ไม่พบผู้ใช้" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "ไม่สามารถดึงข้อมูลผู้ใช้ได้" });
    }
  },
};
