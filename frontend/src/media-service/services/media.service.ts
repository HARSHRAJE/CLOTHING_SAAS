import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const mediaApi = axios.create({
    baseURL: 'http://localhost:8080/media',
});

mediaApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Media {
    id: string;
    shopId: string;
    fileName: string;
    url: string;
    fileType: string;
    size: number;
    entityType: 'PRODUCT' | 'SHOP' | 'VARIANT';
    entityId: string;
    createdAt: string;
}

export const MediaService = {
    uploadMedia: async (file: File, entityType: 'PRODUCT' | 'SHOP' | 'VARIANT', entityId: string): Promise<Media> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);

        const response = await mediaApi.post<Media>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMediaByEntity: async (entityType: 'PRODUCT' | 'SHOP', entityId: string): Promise<Media[]> => {
        const response = await mediaApi.get<Media[]>('', {
            params: { entityType, entityId }
        });
        return response.data;
    },

    deleteMedia: async (id: string): Promise<void> => {
        await mediaApi.delete(`/${id}`);
    },

    getMediaUrl: (url: string | null | undefined): string | null => {
        if (!url) return null;
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        // Remove leading slash if BASE_URL ends with one, or ensure slash if not
        // Here BASE_URL is 'http://localhost:8089' (no slash) and url starts with /
        return `${BASE_URL}${url}`;
    }
};
