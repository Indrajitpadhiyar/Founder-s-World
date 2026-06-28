export const successResponse = (message, data, pagination, metadata) => {
  return {
    success: true,
    message,
    data,
    pagination,
    metadata,
  };
};

export const errorResponse = (message, errors, metadata) => {
  return {
    success: false,
    message,
    errors,
    metadata,
  };
};
