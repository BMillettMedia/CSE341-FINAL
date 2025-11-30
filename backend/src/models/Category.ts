// backend/src/models/Category.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface CategoryDocument extends Document {
    name: string;
    description: string;
    icon: string;
}

const CategorySchema = new Schema<CategoryDocument>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
});

export const Category = mongoose.model<CategoryDocument>('Category', CategorySchema);