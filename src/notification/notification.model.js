import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // destinatario
    type: {
        type: String,
        enum: ["comment_reply", "post_reply"],
        required: true
    },
    referenceId: { type: Schema.Types.ObjectId, required: true }, // ID del comentario o post original
    seen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
