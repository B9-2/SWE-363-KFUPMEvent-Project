import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "Auth route is working",
  });
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  res.status(201).json({
    message: "Register endpoint reached",
    user: {
      name,
      email,
    },
  });
});

router.post("/login", (req, res) => {
  const { email } = req.body;

  res.status(200).json({
    message: "Login endpoint reached",
    user: {
      email,
    },
  });
});

export default router;