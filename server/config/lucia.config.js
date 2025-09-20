const { Lucia } = require("lucia");
const mongooseAdapter = require("@lucia-auth/adapter-mongoose");
const User = require("../models/user.model");

const adapter = mongooseAdapter(User);

const lucia = new Lucia(
  adapter,
  {
    sessionCookie: {
      name: "session",
      expires: false,
      attributes: {
        secure: process.env.NODE_ENV === "production"
      }
    },
    getUserAttributes: (user) => {
      return {
        email: user.email
      };
    }
  }
);

module.exports = { lucia };
