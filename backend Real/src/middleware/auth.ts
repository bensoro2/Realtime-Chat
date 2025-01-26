import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { UserModel } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error();
    }
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = await UserModel.findById(decoded._id);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "กรุณาเข้าสู่ระบบ" });
  }
};

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.role !== "admin") {
      throw new Error();
    }
    next();
  } catch (error) {
    res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง" });
  }
};
