import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import server from "./server";

dotenv.config();
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, PORT } = process.env;

const createServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    const app = express();

    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () => {
      console.log(
        `Server running at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

createServer();
