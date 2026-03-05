import axios from "axios";
import { DashboardSummary } from "./types";

const ANALYTICS_SERVICE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
    baseURL: ANALYTICS_SERVICE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Add interceptor for Shop ID (token is now sent via HttpOnly cookie)
apiClient.interceptors.request.use((config) => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.shopId) {
                config.headers["X-Shop-Id"] = user.shopId;
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
        }
    }
    return config;
});

export const getOwnerDashboardSummary = async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>("/analytics/summary");
    return response.data;
};
