import userApi from '../userApi';

describe('userApi', () => {
  it('should have the correct baseURL', () => {
    expect(userApi.defaults.baseURL).toBe('http://localhost:5000/api/users');
  });
});