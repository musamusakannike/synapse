import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  longDescription: string;
  banner: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  whatYouWillLearn: string[];
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    longDescription: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    whatYouWillLearn: [{ type: String }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CourseSchema.virtual('topicCount', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'course',
  count: true,
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
