import uploadApi from '../uploadApi';
import ConfigAPI from '../axiosConfig';

describe('uploadApi', () => {
  it('should have the correct baseURL', () => {
    expect(uploadApi.defaults.baseURL).toBe('http://localhost:5000/api/upload');
  });

  it('should have the correct Content-Type header', () => {
    expect(uploadApi.defaults.headers['Content-Type']).toBe('multipart/form-data');
  });
});