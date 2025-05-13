import { Schema, model } from "mongoose";

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

export default model('Category', categorySchema);
