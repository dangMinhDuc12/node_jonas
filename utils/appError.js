class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // check xem có phải lỗi hệ thống không

    Error.captureStackTrace(this, this.constructor); //tạo ra stack lỗi không bao gồm hàm constructor đổ về sau
  }
}

module.exports = AppError;
