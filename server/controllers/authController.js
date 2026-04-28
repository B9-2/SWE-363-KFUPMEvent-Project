export const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  res.status(201).json({
    message: "Register endpoint reached successfully",
    user: {
      name,
      email,
    },
  });
};

export const loginUser = (req, res) => {
  const { email } = req.body;

  res.status(200).json({
    message: "Login endpoint reached successfully",
    user: {
      email,
    },
  });
};

export const getAuthStatus = (req, res) => {
  res.status(200).json({
    message: "Auth controller is working",
  });
};