import sellerApi from '../sellerApi';

describe('sellerApi', () => {
  it('should have the correct baseURL', () => {
    expect(sellerApi.defaults.baseURL).toBe('http://localhost:5000/api/sellers');
  });
});