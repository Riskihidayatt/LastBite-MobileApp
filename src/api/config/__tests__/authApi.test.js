import authApi from '../authApi';

describe('authApi', () => {
  it('should have the correct baseURL', () => {
    expect(authApi.defaults.baseURL).toBe('http://localhost:5000/api/auth'); // Assuming your default baseURL is http://localhost:5000/api
  });
});