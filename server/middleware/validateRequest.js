const validateRequest = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Request body is required",
    });
  }

  next();
};

export default validateRequest;