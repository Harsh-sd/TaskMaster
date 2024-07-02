const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,
        required: false // Set to true if you want to make it mandatory
    },
    file: {
        type: String // Assuming you'll store the file path
    }
}, { timestamps: true });

module.exports = mongoose.model("task", taskSchema);
