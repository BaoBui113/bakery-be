const { SuccessResponse } = require("../core/success.response");
const ReportService = require("../services/report.service");

class ReportController {
  static async getReport(req, res) {
    return new SuccessResponse({
      message: "Get report successfully",
      metadata: await ReportService.getReportByOrder(req.query.type),
    }).send(res);
  }

  static async getReportByStatus(req, res) {
    return new SuccessResponse({
      message: "Get report successfully",
      metadata: await ReportService.getreportByStatus(req.params.status),
    }).send(res);
  }

  static async getReportUserRegister(req, res) {
    return new SuccessResponse({
      message: "Get report successfully",
      metadata: await ReportService.getReportUserRegister(req.query.type),
    }).send(res);
  }
}
module.exports = ReportController;
