import mongoose, { Schema, Document } from 'mongoose';

export type TopicContentType = 'text' | 'latex' | 'youtube' | 'image' | 'video' | 'audio' | 'code' | 'quiz' | 'exercise';

export interface ITopicQuizOption {
  text: string;
  isCorrect: boolean;
}

export interface ITopicQuiz {
  question: string;
  options: ITopicQuizOption[];
  explanation?: string;
}

export interface ITopicExercise {
  instructions: string;
  starterCode: string;
  language: string;
  expectedOutput?: string;
  solution?: string;
}

export interface ITopicContent {
  type: TopicContentType;
  content: string;
  language?: string;
  title?: string;
  quiz?: ITopicQuiz;
  exercise?: ITopicExercise;
}

export type TopicFlow = 'flat' | 'guided';

export interface ITopic extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description: string;
  contents: ITopicContent[];
  order: number;
  isPublished: boolean;
  defaultFlow: TopicFlow;
  createdAt: Date;
  updatedAt: Date;
}

const TopicQuizOptionSchema = new Schema<ITopicQuizOption>(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const TopicQuizSchema = new Schema<ITopicQuiz>(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [TopicQuizOptionSchema], default: undefined },
    explanation: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const TopicExerciseSchema = new Schema<ITopicExercise>(
  {
    instructions: { type: String, required: true, trim: true },
    starterCode: { type: String, default: '' },
    language: { type: String, default: 'python' },
    expectedOutput: { type: String, default: '' },
    solution: { type: String, default: '' },
  },
  { _id: false }
);

const TopicContentSchema = new Schema<ITopicContent>(
  {
    type: {
      type: String,
      enum: ['text', 'latex', 'youtube', 'image', 'video', 'audio', 'code', 'quiz', 'exercise'],
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
    title: {
      type: String,
      default: undefined,
    },
    quiz: {
      type: TopicQuizSchema,
      default: undefined,
    },
    exercise: {
      type: TopicExerciseSchema,
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
    defaultFlow: {
      type: String,
      enum: ['flat', 'guided'],
      default: 'flat',
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
