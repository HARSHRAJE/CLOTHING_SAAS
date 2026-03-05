import axios from "axios";

// Access the gateway URL or direct service URL
// In development, we might use a proxy or direct URL. Assuming via gateway or direct port 8088
// Since other services are on different ports, we'll assume a similar pattern.
// However, the dashboard seems to use direct ports or a configured base URL.
// Let's rely on an env variable or default to localhost:8088 for now, similar to other services.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const notificationClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export const sendWhatsAppNotification = async (recipient: string, message: string) => {
    const response = await notificationClient.post("/notifications/whatsapp", {
        recipient,
        message,
    });
    return response.data;
};
