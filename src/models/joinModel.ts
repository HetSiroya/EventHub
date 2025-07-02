import mongoose from "mongoose";
import { model } from "mongoose";

export interface Join {
  userId: mongoose.Schema.Types.ObjectId;
  eventId: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

const Join = new mongoose.Schema<Join>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  isDeleted: {  
    type: Boolean,
    default: false,
  },
});

const JoinModel = model<Join>("Join", Join);
export default JoinModel;
