import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('FakeREST Api Final Test Suite', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://fakerestapi.azurewebsites.net/api/v1';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('User Endpoints', () => {
    it('should create a new user successfully', async () => {
      const requestBody = {
        id: faker.number.int({ max: 2147483647 }),
        userName: faker.internet.username(),
        password: faker.internet.password(),
      };
      await p
        .spec()
        .post(`${baseUrl}/Users`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: requestBody.id,
          userName: requestBody.userName,
        });
    });

    it('should retrieve a list of default users', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users`)
        .expectStatus(StatusCodes.OK)
        .expectJson('[0].id', 1);
    });

    it('should retrieve a specific user by a known ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/5`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: 5,
          userName: 'User 5',
        });
    });

    it('should update a user by a known ID', async () => {
      const updatedUserName = faker.internet.username();
      const requestBody = {
        id: 10,
        userName: updatedUserName,
        password: faker.internet.password(),
      };
      await p
        .spec()
        .put(`${baseUrl}/Users/10`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          userName: updatedUserName,
        });
    });

    it('should delete a user by a known ID', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Users/10`)
        .expectStatus(StatusCodes.OK);
    });
  });

  describe('Activities Endpoints', () => {
    it('should return a list of activities', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Activities`)
        .expectStatus(StatusCodes.OK)
        .expectJson('$', '$V.length > 0');
    });
  });
});