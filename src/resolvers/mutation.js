import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/user";

const Mutation = {
  signup: async (parent, args, context, info) => {
    // Trim and lower case email
    const email = args.email.trim().toLowerCase();

    // Check email is valid
    if (validator.isEmail(email) === false) {
      throw new Error("Email not valid.");
    }

    // Check if email already exist in database
    const currentUsers = await User.find({}); // get all users in database

    const isEmailExist =
      currentUsers.findIndex((user) => user.email === email) > -1;

    if (isEmailExist) {
      throw new Error("Email already exist.");
    }

    // Trim password
    const password = args.password.trim();

    // Validate password
    if (validator.isLength(password, { min: 6 }) === false) {
      throw new Error("Password must be at least 6 characters.");
    }

    // Encrypt password
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...args,
      email,
      password: hashPassword,
    });

    return newUser;
  },
};

export default Mutation;
