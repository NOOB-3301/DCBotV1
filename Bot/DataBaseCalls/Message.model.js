import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    embedding: {
        type: [Number], // Store the vector as an array of numbers (Float32)
        required: true
    }
});

// Create an index for the embedding field (if using MongoDB Atlas with vector search enabled)
messageSchema.index({ embedding: '2dsphere' }); // This creates a geospatial index for vector search

const Message = mongoose.model("Message", messageSchema);

export default Message;
