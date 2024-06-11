
import historySchema from "../scheemas/historySchema";
import userSchema from "../scheemas/userSchema";
import watchlistSchema from "../scheemas/watchlistSchema";
import favoritesSchema from "../scheemas/favoritesSchema";

// Automatic job that deletes users scheduled for deletion
const userCleanup = async () => {
    console.log('Running user cleanup job...');
    try {
        const users = await userSchema.find({ deletion_timestamp: { $lte: new Date() } });

        if (!users.length) return;
        await Promise.all([
            userSchema.deleteMany({ _id: { '$in': users.map((user: any) => user._id) } }),
            historySchema.deleteMany({ user_id: { '$in': users.map((user: any) => user._id) } }),
            watchlistSchema.deleteMany({ user_id: { '$in': users.map((user: any) => user._id) } }),
            favoritesSchema.deleteMany({ user_id: { '$in': users.map((user: any) => user._id) } })
        ]);
    } catch (err) {
        console.error("Error running user cleanup job: ", err);
    } finally {
        const nextCleanupTimestamp = new Date();
        nextCleanupTimestamp.setDate(nextCleanupTimestamp.getDate() + 1);
        nextCleanupTimestamp.setHours(0, 0, 0, 0);
    
        console.log('User cleanup job finished.');
        setTimeout(userCleanup, nextCleanupTimestamp.getTime() - Date.now());
    }
}

export default userCleanup;