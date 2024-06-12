import request from 'supertest';
import { app } from '../app';
import CategoryType from '../models/Category-Master-Models/CategoryTypeModel';

//test cased passed

describe('Create Category Type Controller', () => {
  it('should create a new category type', async () => {
    // Mock request body
    const requestBody = {
      name: 'Test Category',
      code: 'TEST',
      status: 'active',
    };

    // Mock CategoryType.findOne method to return null, indicating that the category type does not exist
    CategoryType.findOne = jest.fn().mockResolvedValue(null);

    // Mock CategoryType.create method to return a new category type
    CategoryType.create = jest.fn().mockResolvedValue({
      _id: '1',
      name: 'Test Category',
      code: 'TEST',
      status: 'active',
    });

    // Make request to the endpoint
    const response = await request(app).post('/api/v1/category-type/create').send(requestBody); // Pass mock request body

    // Expect status code to be 201
    expect(response.status).toBe(201);

    // Expect response body to be an object with message property
    expect(response.body).toEqual({ message: 'Category-type created' });

    // Expect CategoryType.findOne to be called with correct parameters
    expect(CategoryType.findOne).toHaveBeenCalledWith({ $or: [{ name: requestBody.name }, { code: requestBody.code }] });

    // Expect CategoryType.create to be called with correct parameters
    expect(CategoryType.create).toHaveBeenCalledWith({
      name: requestBody.name,
      code: requestBody.code,
      status: requestBody.status,
    });
  });

  it('should return error for existing category type', async () => {
    // Mock request body for an existing category type
    const requestBody = {
      name: 'Test Category',
      code: 'TEST',
      status: 'active',
    };

    // Mock CategoryType.findOne method to return an existing category type
    CategoryType.findOne = jest.fn().mockResolvedValue({
      _id: '1',
      name: 'Test Category',
      code: 'TEST',
      status: 'active',
    });

    // Make request to the endpoint
    const response = await request(app).post('/api/v1/category-type/create').send(requestBody); // Pass mock request body

    // Expect status code to be 400
    expect(response.status).toBe(400);

    // Expect response body to contain error message
    expect(response.body).toHaveProperty('message', 'Name or Code already exists.');
  });

  // Add more test cases as needed to cover other scenarios, such as missing request body properties, server errors, etc.
});
