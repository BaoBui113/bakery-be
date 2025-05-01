class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
class UnauthorizedError extends ErrorResponse {
  constructor(message = "Unauthorized", status = 401) {
    super(message, status);
  }
}
class ForbiddenError extends ErrorResponse {
  constructor(message = "Forbidden", status = 403) {
    super(message, status);
  }
}
class NotFoundError extends ErrorResponse {
  constructor(message = "Not Found", status = 404) {
    super(message, status);
  }
}
class BadRequestError extends ErrorResponse {
  constructor(message = "Bad Request", status = 400) {
    super(message, status);
  }
}
class InternalServerError extends ErrorResponse {
  constructor(message = "Internal Server Error", status = 500) {
    super(message, status);
  }
}
class ConflictError extends ErrorResponse {
  constructor(message = "Conflict", status = 409) {
    super(message, status);
  }
}
class UnprocessableEntityError extends ErrorResponse {
  constructor(message = "Unprocessable Entity", status = 422) {
    super(message, status);
  }
}
class NotAcceptableError extends ErrorResponse {
  constructor(message = "Not Acceptable", status = 406) {
    super(message, status);
  }
}
class PreconditionFailedError extends ErrorResponse {
  constructor(message = "Precondition Failed", status = 412) {
    super(message, status);
  }
}
class TooManyRequestsError extends ErrorResponse {
  constructor(message = "Too Many Requests", status = 429) {
    super(message, status);
  }
}
class ServiceUnavailableError extends ErrorResponse {
  constructor(message = "Service Unavailable", status = 503) {
    super(message, status);
  }
}
class GatewayTimeoutError extends ErrorResponse {
  constructor(message = "Gateway Timeout", status = 504) {
    super(message, status);
  }
}
class NotImplementedError extends ErrorResponse {
  constructor(message = "Not Implemented", status = 501) {
    super(message, status);
  }
}
module.exports = {
  ErrorResponse,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  InternalServerError,
  ConflictError,
  UnprocessableEntityError,
  NotAcceptableError,
  PreconditionFailedError,
  TooManyRequestsError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  NotImplementedError,
};
