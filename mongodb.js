import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/Hello")
    .then(() => {
        console.log("Mongodb connected");
    })
    .catch(() => {
        console.log("failed to connect");
    });

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("Person", LogInSchema);

export default collection;