import axios from "axios";

// Access the gateway URL or direct service URL
// In development, we might use a proxy or direct URL. Assuming via gateway or direct port 8088
// Since other services are on different ports, we'll assume a similar pattern.
// However, the dashboard seems to use direct ports or a configured base URL.
// Let's rely on an env variable or default to localhost:8088 for now, similar to other services.

const API_URL = process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:8088";

export const notificationClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

notificationClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Some services require X-Shop-Id, but Notification Service extracts it from JWT for Owner APIs
    // We can add it just in case if needed later, but our Controller uses JWT.

    return config;
});

export const sendWhatsAppNotification = async (recipient: string, message: string) => {
    const response = await notificationClient.post("/notifications/whatsapp", {
        recipient,
        message,
    });
    return response.data;
};
