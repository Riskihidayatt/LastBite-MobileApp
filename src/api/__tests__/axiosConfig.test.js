import ConfigAPI, { applyInterceptors } from '../axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logoutUser } from '../../../src/redux/slice/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../src/redux/slice/authSlice';
import axios from 'axios'; // Keep axios import for direct mocking in tests

describe('axiosConfig', () => {
  let store;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock the store
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    // Apply interceptors to the globally mocked axios instance
    applyInterceptors(axios.default, store);
  });

  it('should create an axios instance with correct baseURL and headers', () => {
    expect(ConfigAPI.defaults.baseURL).toBe('http://10.10.102.131:8080/api');
    expect(ConfigAPI.defaults.headers['Content-Type']).toBe('application/json');
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header if token exists', async () => {
      const mockToken = 'test_token';
      AsyncStorage.getItem.mockResolvedValue(mockToken);

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const newConfig = await requestInterceptor(config);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
      expect(newConfig.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should not add Authorization header if token does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: {} };
      const newConfig = await requestInterceptor(config);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('userToken');
      expect(newConfig.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should return response for successful requests', async () => {
      const mockResponse = { status: 200, data: 'success' };
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      const result = await responseInterceptor(mockResponse);
      expect(result).toEqual(mockResponse);
    });

    it('should handle 401 error and refresh token successfully', async () => {
      const originalRequest = { config: { _retry: false, headers: {} } };
      const mockRefreshToken = 'refresh_token';
      const newAccessToken = 'new_access_token';
      const newRefreshToken = 'new_refresh_token';

      AsyncStorage.getItem.mockResolvedValueOnce(mockRefreshToken); // For refresh token
      AsyncStorage.setItem.mockResolvedValue(null); // For setting new tokens

      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            token: newAccessToken,
            refreshToken: newRefreshToken,
          },
        },
      });

      // Mock the original request to be re-attempted
      mockAxiosInstance.mockResolvedValueOnce({ data: 'retried success' });

      const error = { response: { status: 401 }, config: originalRequest.config };
      const responseInterceptorError = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      const result = await responseInterceptorError(error);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refreshToken');
      expect(axios.post).toHaveBeenCalledWith(
        'http://10.10.102.131:8080/api/auth/refresh-token',
        { refreshToken: mockRefreshToken }
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('userToken', newAccessToken);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('refreshToken', newRefreshToken);
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(`Bearer ${newAccessToken}`);
      expect(result).toEqual({ data: 'retried success' });
    });

    it('should handle 401 error and logout if no refresh token', async () => {
      const originalRequest = { config: { _retry: false, headers: {} } };
      AsyncStorage.getItem.mockResolvedValueOnce(null); // No refresh token

      const error = { response: { status: 401 }, config: originalRequest.config };
      const responseInterceptorError = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptorError(error)).rejects.toEqual(error);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refreshToken');
      expect(logoutUser).toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle 401 error and logout if refresh token fails', async () => {
      const originalRequest = { config: { _retry: false, headers: {} } };
      const mockRefreshToken = 'refresh_token';
      const refreshError = new Error('Refresh failed');

      AsyncStorage.getItem.mockResolvedValueOnce(mockRefreshToken);
      axios.post.mockRejectedValueOnce(refreshError);

      const error = { response: { status: 401 }, config: originalRequest.config };
      const responseInterceptorError = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptorError(error)).rejects.toEqual(refreshError);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('refreshToken');
      expect(axios.post).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(logoutUser).toHaveBeenCalled();
    });

    it('should queue requests if token refresh is in progress', async () => {
      const originalRequest1 = { config: { _retry: false, headers: {} } };
      const originalRequest2 = { config: { _retry: false, headers: {} } };
      const mockRefreshToken = 'refresh_token';
      const newAccessToken = 'new_access_token';

      AsyncStorage.getItem.mockResolvedValue(mockRefreshToken);
      axios.post.mockImplementationOnce(() => {
        return new Promise(resolve => setTimeout(() => {
          resolve({
            data: {
              data: {
                token: newAccessToken,
                refreshToken: 'new_refresh_token',
              },
            },
          });
        }, 100));
      });

      mockAxiosInstance.mockResolvedValue({ data: 'retried success' });

      const error1 = { response: { status: 401 }, config: originalRequest1.config };
      const error2 = { response: { status: 401 }, config: originalRequest2.config };

      const responseInterceptorError = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      const promise1 = responseInterceptorError(error1);
      const promise2 = responseInterceptorError(error2);

      await Promise.all([promise1, promise2]);

      expect(axios.post).toHaveBeenCalledTimes(1); // Refresh token should only be called once
      expect(mockAxiosInstance).toHaveBeenCalledTimes(2); // Both original requests should be retried
    });
  });
});