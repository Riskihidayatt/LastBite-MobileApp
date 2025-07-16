import orderApi, { createOrder, getCustomerOrders, createDirectOrder } from '../orderApi';
import ConfigAPI from '../axiosConfig';

describe('orderApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct baseURL', () => {
    expect(orderApi.defaults.baseURL).toBe('http://localhost:5000/api/orders');
  });

  it('createOrder should call post with correct arguments', async () => {
    const orderData = { cartId: 'cart123', sellerId: 'seller456', notes: 'Test order' };
    const mockResponse = { data: { message: 'Order created' } };
    ConfigAPI.create().post.mockResolvedValue(mockResponse);

    const response = await createOrder(orderData);

    expect(ConfigAPI.create().post).toHaveBeenCalledWith('/from-cart', orderData);
    expect(response).toEqual(mockResponse);
  });

  it('getCustomerOrders should call get with correct arguments', async () => {
    const status = 'PAID';
    const mockResponse = { data: { orders: [] } };
    ConfigAPI.create().get.mockResolvedValue(mockResponse);

    const response = await getCustomerOrders(status);

    expect(ConfigAPI.create().get).toHaveBeenCalledWith('/customer/me', {
      params: {
        status: status,
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('createDirectOrder should call post with correct arguments', async () => {
    const directOrderData = { orderItems: [{ menuItemId: 'item1', quantity: 1 }] };
    const mockResponse = { data: { message: 'Direct order created' } };
    ConfigAPI.create().post.mockResolvedValue(mockResponse);

    const response = await createDirectOrder(directOrderData);

    expect(ConfigAPI.create().post).toHaveBeenCalledWith('', directOrderData);
    expect(response).toEqual(mockResponse);
  });
});