import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    post: { 
        type: Schema.Types.ObjectId, 
        ref: 'Post',  
        required: true 
    },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',  
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    parentComment: { 
        type: Schema.Types.ObjectId, 
        ref: "Comment", 
        default: null 
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

export default model('Comment', commentSchema);
