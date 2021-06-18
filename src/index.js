import express from "express";
import server from "./server";

const app = express();

const PORT = 4444;

server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(
    `Server running at http://localhost:${PORT}${server.graphqlPath}`
  );
});
