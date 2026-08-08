import mongoose, { Schema, Document } from 'mongoose';

export interface IStudySession extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
  type: 'flashcard' | 'mcq';
  flashcardsStudied: number;
  mcqAnswered: number;
  mcqCorrect: number;
  duration: number;
  score: number;
  createdAt: Date;
}

const StudySessionSchema: Schema = new Schema<IStudySession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
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
    type: {
      type: String,
      enum: ['flashcard', 'mcq'],
      required: true,
    },
    flashcardsStudied: {
      type: Number,
      default: 0,
    },
    mcqAnswered: {
      type: Number,
      default: 0,
    },
    mcqCorrect: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStudySession>('StudySession', StudySessionSchema);
