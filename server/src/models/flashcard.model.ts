import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  topic: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema: Schema = new Schema<IFlashcard>(
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
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
