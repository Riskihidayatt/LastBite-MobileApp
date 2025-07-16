import paymentApi from '../paymentApi';

describe('paymentApi', () => {
  it('should have the correct baseURL', () => {
    expect(paymentApi.defaults.baseURL).toBe('http://localhost:5000/api/payments');
  });
});