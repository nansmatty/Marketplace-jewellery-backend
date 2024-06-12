import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  description: string;
  status: 'active' | 'inactive';
}

const faqSchema: Schema<IFaq> = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'frequently_asked_questions',
  }
);

const FAQ: Model<IFaq> = mongoose.model('FAQ', faqSchema);

export default FAQ;
