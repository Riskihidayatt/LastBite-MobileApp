import menuItemReviewApi, { submitReview, getReviewsByMenuItem } from '../menuItemReviewApi';
import ConfigAPI from '../axiosConfig';

describe('menuItemReviewApi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have the correct baseURL', () => {
    expect(menuItemReviewApi.defaults.baseURL).toBe('http://localhost:5000/api/menu-item-reviews');
  });

  it('submitReview should call post with correct arguments', async () => {
    const reviewData = { menuItemId: 'menu123', rating: 5, comment: 'Great food!' };
    const mockResponse = { data: { message: 'Review submitted' } };
    ConfigAPI.create().post.mockResolvedValue(mockResponse);

    const response = await submitReview(reviewData);

    expect(ConfigAPI.create().post).toHaveBeenCalledWith('', reviewData);
    expect(response).toEqual(mockResponse);
  });

  it('getReviewsByMenuItem should call get with correct arguments', async () => {
    const menuItemId = 'menu123';
    const mockResponse = { data: { reviews: [] } };
    ConfigAPI.create().get.mockResolvedValue(mockResponse);

    const response = await getReviewsByMenuItem(menuItemId);

    expect(ConfigAPI.create().get).toHaveBeenCalledWith(`/menu/${menuItemId}`);
    expect(response).toEqual(mockResponse);
  });
});