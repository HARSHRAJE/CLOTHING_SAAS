import axios from "axios";
import { DashboardSummary } from "./types";

const ANALYTICS_SERVICE_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || "http://localhost:8087";

const apiClient = axios.create({
    baseURL: ANALYTICS_SERVICE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor for JWT if needed (assuming stored in localStorage)
// Add interceptor for JWT and Shop ID
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

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
