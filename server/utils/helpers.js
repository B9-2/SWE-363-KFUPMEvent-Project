export const formatSuccessResponse = (message, data = null) => {
  return {
    success: true,
    message,
    data,
  };
};

export const formatErrorResponse = (message) => {
  return {
    success: false,
    message,
  };
};