import { Schema, model } from "mongoose";
import { preventDefaultCategoryDeletion } from "../middleware/category-default.js";

const categorySchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: false 
    },
    isDefault: { 
        type: Boolean, 
        default: false 
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
