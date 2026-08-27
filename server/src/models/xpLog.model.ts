import mongoose, { Schema, Document } from 'mongoose';

export type XpSourceType = 'topic' | 'exercise_question' | 'chapter_exercise';

export interface IXpLog extends Document {
  user: mongoose.Types.ObjectId;
  xp: number;
  sourceType: XpSourceType;
  sourceId: string;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const XpLogSchema: Schema = new Schema<IXpLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    xp: {
      type: Number,
      required: true,
      min: 0,
    },
    sourceType: {
      type: String,
      enum: ['topic', 'exercise_question', 'chapter_exercise'],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

XpLogSchema.index({ user: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export default mongoose.model<IXpLog>('XpLog', XpLogSchema);
