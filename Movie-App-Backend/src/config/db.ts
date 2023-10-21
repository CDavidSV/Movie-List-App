import mongoose from "mongoose";

const connectMongoDB = async (mongoURI: string) => {
    await mongoose.connect(mongoURI).then(() => {
        console.log('Connected to mongodb'.green);
    }).catch((err) => {
        console.error('Failed to connect to mongodb:'.red, err);
    });
};

export default connectMongoDB;