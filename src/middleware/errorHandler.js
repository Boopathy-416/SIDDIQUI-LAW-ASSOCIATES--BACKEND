const errorHandler = (error, req, res, next) => {
  console.error("API Error:", error);

  // MongoDB duplicate key
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message:
        "This mobile number has already been submitted."
    });
  }

  // Mongoose validation
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map(
      (err) => err.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  // Default error
  return res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.statusCode
        ? error.message
        : "Internal server error"
  });
};

export default errorHandler;