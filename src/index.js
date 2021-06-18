import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import server from "./server";

dotenv.config();

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT;

const createServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASSWORD}@graphql-basic.entvt.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
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
