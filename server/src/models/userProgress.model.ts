import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  flashcardsStudied: number;
  flashcardsTotal: number;
  mcqsAttempted: number;
  mcqsCorrect: number;
  lastStudiedAt: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    flashcardsStudied: {
      type: Number,
      default: 0,
    },
    flashcardsTotal: {
      type: Number,
      default: 0,
    },
    mcqsAttempted: {
      type: Number,
      default: 0,
    },
    mcqsCorrect: {
      type: Number,
      default: 0,
    },
    lastStudiedAt: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

UserProgressSchema.index({ user: 1, course: 1, topic: 1 }, { unique: true });

export default mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
