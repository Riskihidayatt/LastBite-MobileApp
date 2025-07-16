import cartApi, { addItemToCart, getCart, deleteCartItem, updateItemQuantity } from '../cartApi';
import ConfigAPI from '../axiosConfig';

describe('cartApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct baseURL', () => {
    expect(cartApi.defaults.baseURL).toBe('http://localhost:5000/api/carts');
  });

  it('addItemToCart should call post with correct arguments', async () => {
    const menuItemId = 'menu123';
    const quantity = 2;
    const mockResponse = { data: { message: 'Item added' } };
    ConfigAPI.create().post.mockResolvedValue(mockResponse);

    const response = await addItemToCart(menuItemId, quantity);

    expect(ConfigAPI.create().post).toHaveBeenCalledWith('/items', { menuItemId, quantity });
    expect(response).toEqual(mockResponse);
  });

  it('getCart should call get with correct arguments', async () => {
    const mockResponse = { data: { cart: [] } };
    ConfigAPI.create().get.mockResolvedValue(mockResponse);

    const response = await getCart();

    expect(ConfigAPI.create().get).toHaveBeenCalledWith('');
    expect(response).toEqual(mockResponse);
  });

  it('deleteCartItem should call delete with correct arguments', async () => {
    const cartItemId = 'cartItem123';
    const mockResponse = { data: { message: 'Item deleted' } };
    ConfigAPI.create().delete.mockResolvedValue(mockResponse);

    const response = await deleteCartItem(cartItemId);

    expect(ConfigAPI.create().delete).toHaveBeenCalledWith(`/items/${cartItemId}`);
    expect(response).toEqual(mockResponse);
  });

  it('updateItemQuantity should call put with correct arguments', async () => {
    const cartItemId = 'cartItem456';
    const quantity = 3;
    const mockResponse = { data: { message: 'Quantity updated' } };
    ConfigAPI.create().put.mockResolvedValue(mockResponse);

    const response = await updateItemQuantity(cartItemId, quantity);

    expect(ConfigAPI.create().put).toHaveBeenCalledWith(`/items/${cartItemId}`, null, {
      params: {
        quantity: quantity,
      },
    });
    expect(response).toEqual(mockResponse);
  });
});