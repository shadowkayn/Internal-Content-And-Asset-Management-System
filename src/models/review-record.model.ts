import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReviewRecord extends Document {
  contentId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  action: "approved" | "rejected";
  reason: string;
  previousStatus: string;
  newStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewRecordSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: "Content",
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["approved", "rejected"],
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    previousStatus: {
      type: String,
      required: true,
    },
    newStatus: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// 复合索引：快速查询某篇文章的审核历史
ReviewRecordSchema.index({ contentId: 1, createdAt: -1 });

const ReviewRecordModel: Model<IReviewRecord> =
  mongoose.models.ReviewRecordModel ||
  mongoose.model("ReviewRecordModel", ReviewRecordSchema);

export default ReviewRecordModel;
