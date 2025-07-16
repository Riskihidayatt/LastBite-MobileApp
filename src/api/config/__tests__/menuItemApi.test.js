import menuItemApi from '../menuItemApi';

describe('menuItemApi', () => {
  it('should have the correct baseURL', () => {
    expect(menuItemApi.defaults.baseURL).toBe('http://10.10.102.131:8080/api');
  });
});