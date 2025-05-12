import { Schema, model } from "mongoose";
import { preventDefaultCategoryDeletion } from "../middleware/category-default.js";

const categorySchema = new Schema({
    category: { 
        type: String, 
        enum: ['Taller', 'Tecnologia', 'Practica'],
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: false 
    },
    status: { 
        type: Boolean, 
        default: true 
    }
}, 
{
    timestamps: true,
    versionKey: false
});

categorySchema.pre("findOneAndDelete", preventDefaultCategoryDeletion);

export default model('Category', categorySchema);
