import mongoose, { Schema, Document, Model } from "mongoose";

export interface RoleDocument extends Document {
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: "active" | "disabled";
  deleteFlag: number;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    permissions: [{ type: String, default: [] }],
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    deleteFlag: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const RoleModel: Model<RoleDocument> =
  mongoose.models.RoleModel || mongoose.model("RoleModel", RoleSchema);

export default RoleModel;
