import mongoose from 'mongoose';
const connectionFinalW = mongoose.createConnection("mongodb://localhost:27017/FinalW");

connectionFinalW.on('error', console.error.bind(console, 'Connection error:'));
connectionFinalW.once('open', () => {
    console.log("Mongodb connected to FinalW");
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: { 
        type: String,
        required: true,
    },
    location: { 
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

const User = connectionFinalW.model("User", userSchema);

export default User;