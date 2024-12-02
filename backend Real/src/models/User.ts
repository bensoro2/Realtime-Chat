import { prop, getModelForClass } from "@typegoose/typegoose";

export type UserRole = "member" | "admin";

export class User {
  @prop({ required: true, unique: true })
  public username!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ type: String, enum: ["member", "admin"], default: "member" })
  public role!: UserRole;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const UserModel = getModelForClass(User);
