import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: Types.ObjectId;
  isPublished: boolean;
  publishedAt: Date | null;
  readingTimeMinutes: number;
  views: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      default: '',
      trim: true,
    },
    seoDescription: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

BlogPostSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

BlogPostSchema.set('toJSON', { virtuals: true });
BlogPostSchema.set('toObject', { virtuals: true });

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
