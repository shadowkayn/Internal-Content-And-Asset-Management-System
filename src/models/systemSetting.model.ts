import { Schema, models, model } from "mongoose";

export interface SystemSetting {
  siteName: string;
  siteLogo: string;
  copyright: string;
  allowRegister: boolean;
  multiLogin: boolean;
  loginOverTime: number;
  fileSizeLimit: number;
  storePath: string;
}

const systemSettingSchema = new Schema<SystemSetting>({
  siteName: {
    type: String,
    default: "KAYN ADMIN",
  },
  siteLogo: {
    type: String,
    default: "",
  },
  copyright: {
    type: String,
    default: "",
  },
  allowRegister: {
    type: Boolean,
    default: true,
  },
  multiLogin: {
    type: Boolean,
    default: true,
  },
  loginOverTime: {
    type: Number,
    default: 5,
  },
  fileSizeLimit: {
    type: Number,
    default: 5,
  },
  storePath: {
    type: String,
    default: "",
  },
});

const systemSettingModel =
  models.systemSettingModel || model("systemSettingModel", systemSettingSchema);

export default systemSettingModel;
