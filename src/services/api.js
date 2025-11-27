/**
 * API Service Layer
 * 封裝所有後端 API 請求，包含錯誤處理
 */

const API_BASE_URL = 'http://localhost:3001/api';

class APIError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.code = code;
    }
}

/**
 * 通用 API 請求函數
 */
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new APIError(
                data.message || data.error || 'API request failed',
                response.status,
                data.error
            );
        }

        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }

        // 網路錯誤或其他錯誤
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new APIError('無法連接到伺服器，請檢查網路連線', 0, 'NETWORK_ERROR');
        }

        throw new APIError(error.message || '未知錯誤', 0, 'UNKNOWN_ERROR');
    }
}

/**
 * 診間相關 API
 */
export const clinicAPI = {
    /**
     * 取得所有診間資訊
     */
    getAll: async () => {
        return apiRequest('/clinics');
    },

    /**
     * 叫號
     */
    callNext: async (clinicId) => {
        return apiRequest('/call-next', {
            method: 'POST',
            body: JSON.stringify({ clinicId }),
        });
    },

    /**
     * 取得診間的報到記錄
     */
    getCheckins: async (clinicId) => {
        return apiRequest(`/checkins/${clinicId}`);
    },
};

/**
 * 患者相關 API
 */
export const patientAPI = {
    /**
     * 根據身分證字號查詢患者
     */
    getById: async (patientId) => {
        return apiRequest(`/patients/${patientId}`);
    },
};

/**
 * 報到相關 API
 */
export const checkinAPI = {
    /**
     * 執行報到
     */
    checkIn: async (patientId, clinicId) => {
        return apiRequest('/checkin', {
            method: 'POST',
            body: JSON.stringify({ patientId, clinicId }),
        });
    },
};

/**
 * 日誌相關 API
 */
export const logAPI = {
    /**
     * 取得最近的操作日誌
     */
    getRecent: async (limit = 50) => {
        return apiRequest(`/logs?limit=${limit}`);
    },
};

/**
 * 健康檢查
 */
export const healthCheck = async () => {
    try {
        const response = await fetch('http://localhost:3001/health');
        return response.ok;
    } catch {
        return false;
    }
};

export { APIError };
