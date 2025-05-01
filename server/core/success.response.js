const StatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
};
const ReasonStatusCode = {
  OK: "OK",
  CREATED: "Created",
  ACCEPTED: "Accepted",
  NO_CONTENT: "No Content",
};
class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = message || ReasonStatusCode.OK;
    this.statusCode = statusCode;
    this.reasonStatusCode = reasonStatusCode;
    this.metadata = metadata;
  }
  send(res) {
    res.status(this.statusCode).json({
      status: this.statusCode,
      reasonStatusCode: this.reasonStatusCode,
      message: this.message,
      metadata: this.metadata,
    });
  }
}

class OkeResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({
      message,
      statusCode: StatusCode.OK,
      reasonStatusCode: ReasonStatusCode.OK,
      metadata,
    });
  }
}
class CreatedResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({
      message,
      statusCode: StatusCode.CREATED,
      reasonStatusCode: ReasonStatusCode.CREATED,
      metadata,
    });
  }
}

module.exports = {
  SuccessResponse,
  OkeResponse,
  CreatedResponse,
};
