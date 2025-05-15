import { Schema, model } from "mongoose";

const postSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    category: { 
        type: Schema.Types.ObjectId, 
        ref: "Category",
        required: true
    },
    content: { 
        type: String, 
        required: true 
    },
    author: {
        type: String,
        required: true
    },
    status: { 
        type: Boolean, 
        default: true, 
    },
},
{
    timestamps: true, 
    versionKey: false 
});

export default model('Post', postSchema);
