import mongoose, { Schema, Document } from 'mongoose';

export interface IMCQOption {
  text: string;
  isCorrect: boolean;
}

export interface IMCQ extends Document {
  topic: mongoose.Types.ObjectId;
  question: string;
  options: IMCQOption[];
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const MCQOptionSchema = new Schema<IMCQOption>(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const MCQSchema: Schema = new Schema<IMCQ>(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [MCQOptionSchema],
      validate: {
        validator: (v: IMCQOption[]) => v.length >= 2 && v.length <= 6,
        message: 'Options must have between 2 and 6 entries.',
      },
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMCQ>('MCQ', MCQSchema);
