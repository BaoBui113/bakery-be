const orderModel = require("../models/order.model");

class ReportService {
  static async getReportByOrder(type) {
    const now = new Date();
    let startDate, endDate;
    let groupingStage = [];
    let resultTemplate = [];

    if (type === "week") {
      const {
        startDate: newStartDate,
        endDate: newEndDate,
        groupingStage: newGroupingStage,
        resultTemplate: newResultTemplate,
      } = await this.getReportOrderByWeek(now);
      startDate = newStartDate;
      endDate = newEndDate;
      groupingStage = newGroupingStage;
      resultTemplate = newResultTemplate;
    } else if (type === "month") {
      const {
        startDate: newStartDate,
        endDate: newEndDate,
        groupingStage: newGroupingStage,
        resultTemplate: newResultTemplate,
      } = await this.getReportOrderByMonth(now);
      startDate = newStartDate;
      endDate = newEndDate;
      groupingStage = newGroupingStage;
      resultTemplate = newResultTemplate;
    }

    const data = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ["pending", "paid", "cancelled"] },
        },
      },
      ...groupingStage,
    ]);

    data.forEach(({ _id, total }) => {
      const index = _id.key - 1;
      const status = _id.status;

      const target = resultTemplate[index];
      if (!target) return;

      if (status === "paid") target.completed = total;
      if (status === "cancelled") target.canceled = total;
      if (status === "pending") target.pending = total;
    });

    return resultTemplate;
  }

  static async getReportOrderByWeek(now) {
    const currentDay = now.getDay();
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    const groupingStage = [
      {
        $addFields: {
          dayOfWeek: { $isoDayOfWeek: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { key: "$dayOfWeek", status: "$status" },
          total: { $sum: 1 },
        },
      },
    ];

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const resultTemplate = weekDays.map((day) => ({
      day,
      pending: 0,
      completed: 0,
      canceled: 0,
    }));

    return { startDate, endDate, groupingStage, resultTemplate };
  }

  static async getReportOrderByMonth(now) {
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const groupingStage = [
      {
        $addFields: {
          dayOfMonth: { $dayOfMonth: "$createdAt" },
        },
      },
      {
        $addFields: {
          weekOfMonth: {
            $switch: {
              branches: [
                { case: { $lte: ["$dayOfMonth", 7] }, then: 1 },
                { case: { $lte: ["$dayOfMonth", 14] }, then: 2 },
                { case: { $lte: ["$dayOfMonth", 21] }, then: 3 },
                { case: { $lte: ["$dayOfMonth", 28] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },
      {
        $group: {
          _id: { key: "$weekOfMonth", status: "$status" },
          total: { $sum: 1 },
        },
      },
    ];

    const resultTemplate = Array.from({ length: 5 }, (_, i) => ({
      week: i + 1,
      pending: 0,
      completed: 0,
      canceled: 0,
    }));
    return { startDate, endDate, groupingStage, resultTemplate };
  }

  static async getreportByStatus(status) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const data = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: monday, $lte: sunday },
          status: status,
        },
      },
      {
        $addFields: {
          dayOfWeek: { $isoDayOfWeek: "$createdAt" }, // 1 = Monday, 7 = Sunday
        },
      },
      {
        $group: {
          _id: { day: "$dayOfWeek" },
          total: { $sum: 1 },
        },
      },
    ]);
    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const result = Array.from({ length: 7 }, (_, i) => ({
      day: weekDays[i],
      completed: 0,
    }));

    data.forEach(({ _id, total }) => {
      const dayIndex = _id.day - 1; // 1 = Monday => 0 index
      result[dayIndex].completed = total;
    });

    return result;
  }

  // Report user register
  static async getReportUserRegister(type) {
    if (type === "week") {
      const now = new Date();
    }
  }
}
module.exports = ReportService;
