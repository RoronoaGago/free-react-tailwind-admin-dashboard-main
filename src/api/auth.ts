import api from './axios';

export const login = async (username: string, password: string) => {
    const response = await api.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
    });

    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
    }

    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getProtectedData = async () => {
    const response = await api.get('http://127.0.0.1:8000/api/protected/');
    return response.data;
};