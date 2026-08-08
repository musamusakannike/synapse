import mongoose, { Schema, Document } from 'mongoose';

export type TopicContentType = 'text' | 'latex' | 'youtube' | 'image' | 'video' | 'audio' | 'code';

export interface ITopicContent {
  type: TopicContentType;
  content: string;
  language?: string;
}

export interface ITopic extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  contents: ITopicContent[];
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TopicContentSchema = new Schema<ITopicContent>(
  {
    type: {
      type: String,
      enum: ['text', 'latex', 'youtube', 'image', 'video', 'audio', 'code'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: undefined,
    },
  },
  { _id: true }
);

const TopicSchema: Schema = new Schema<ITopic>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    contents: [TopicContentSchema],
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TopicSchema.virtual('flashcardCount', {
  ref: 'Flashcard',
  localField: '_id',
  foreignField: 'topic',
  count: true,
});

TopicSchema.virtual('mcqCount', {
  ref: 'MCQ',
  localField: '_id',
  foreignField: 'topic',
  count: true,
});

TopicSchema.set('toJSON', { virtuals: true });
TopicSchema.set('toObject', { virtuals: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);
