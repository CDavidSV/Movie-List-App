import mongoose from "mongoose";

const connectMongoDB = async (mongoURI: string) => {
    await mongoose.connect(mongoURI).then(() => {
        console.log('Connected to mongodb'.green);
    });
};

export default connectMongoDB;