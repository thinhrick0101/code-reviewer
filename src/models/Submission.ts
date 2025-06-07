import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  code: string;
  review: {
    style: string;
    performance: string;
    security: string;
    suggestions?: string[];
  };
  refactoredCode?: string;
  createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  code: { type: String, required: true },
  review: {
    style: { type: String, required: true },
    performance: { type: String, required: true },
    security: { type: String, required: true },
    suggestions: { type: [String] },
  },
  refactoredCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema); 