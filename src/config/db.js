// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     const connection = await mongoose.connect(process.env.MONGODB_URI, {
//       serverSelectionTimeoutMS: 5000,
//       maxPoolSize: 10,
//       minPoolSize: 2
//     });

//     console.log(
//       `MongoDB Connected: ${connection.connection.host}`
//     );
//   } catch (error) {
//     console.error("MongoDB Connection Error:", error.message);

//     process.exit(1);
//   }
// };

// export default connectDB;





import mongoose from "mongoose";

const connectDB = async () => {

  try {

    console.log("⏳ Connecting to MongoDB...");

    const connection =
      await mongoose.connect(
        process.env.MONGODB_URI,
        {
          serverSelectionTimeoutMS: 5000,
          maxPoolSize: 10,
          minPoolSize: 2
        }
      );

    console.log(
      `✅ MongoDB: CONNECTED`
    );

    console.log(
      `   Host: ${connection.connection.host}`
    );

    console.log(
      `   Database: ${connection.connection.name}`
    );

  } catch (error) {

    console.error("");
    console.error(
      "❌ MongoDB: CONNECTION FAILED"
    );

    console.error(
      `   ${error.message}`
    );

    console.error("");

    process.exit(1);
  }
};


// ======================================================
// MONGODB EVENTS
// ======================================================

mongoose.connection.on(
  "disconnected",
  () => {

    console.error(
      "❌ MongoDB: DISCONNECTED"
    );

  }
);

mongoose.connection.on(
  "reconnected",
  () => {

    console.log(
      "✅ MongoDB: RECONNECTED"
    );

  }
);

mongoose.connection.on(
  "error",
  (error) => {

    console.error(
      "❌ MongoDB ERROR:",
      error.message
    );

  }
);


export default connectDB;