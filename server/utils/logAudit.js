const AuditLog = require("../models/AuditLog");

const logAudit = async ({ adminId, action, details, req }) => {
  try {
    if (!adminId) return;
    const ipAddress = req
      ? req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1"
      : "127.0.0.1";

    await AuditLog.create({
      admin: adminId,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
};

module.exports = logAudit;
