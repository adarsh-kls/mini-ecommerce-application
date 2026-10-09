const API_URL = "http://localhost:5000/api/notifications";

const getToken = () => {
  return localStorage.getItem("token");
};

export const getNotifications = async () => {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to fetch notifications"
    );
  }

  return data;
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_URL}/${id}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to mark notification"
    );
  }

  return data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/read-all`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to mark notifications"
    );
  }

  return data;
};