const notification = require("../models/notifications");


const createNotification = async ({
  user,
  type,
  title,
  message,
  relatedOrder = null,
}) => {
  try {
    return await notification.create({
      user,
      type,
      title,
      message,
      relatedOrder,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return null;
  }
};

module.exports = createNotification;