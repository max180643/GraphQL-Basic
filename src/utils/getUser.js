import jwt from "jsonwebtoken";

const getUser = (token) => {
  if (!token) return null;

  // "Bearer token..." -> ["Bearer", "token..."]
  const parsedToken = token.split(" ")[1];

  try {
    const decodedToken = jwt.verify(parsedToken, process.env.JWT_SECRET);

    return decodedToken;
  } catch (error) {
    return null;
  }
};

export default getUser;
