import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('FakeREST Api Test Suite', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://fakerestapi.azurewebsites.net/api/v1';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('User Management', () => {
    const newUserName = faker.internet.userName();

    it('should create a new user', async () => {
      const requestBody = {
        id: faker.number.int({ min: 1000 }),
        userName: newUserName,
        password: faker.internet.password(),
      };
      await p
        .spec()
        .post(`${baseUrl}/Users`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: requestBody.id,
          userName: newUserName,
        })
        .stores('createdUserID', 'id');
    });

    it('should retrieve the created user', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/$S{createdUserID}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          userName: newUserName,
        });
    });

    it('should update the user', async () => {
      const updatedUserName = faker.internet.userName();
      const requestBody = {
        id: '$S{createdUserID}',
        userName: updatedUserName,
        password: faker.internet.password(),
      };

      await p
        .spec()
        .put(`${baseUrl}/Users/$S{createdUserID}`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          userName: updatedUserName,
        });
    });

    it('should delete the user', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Users/$S{createdUserID}`)
        .expectStatus(StatusCodes.OK);
    });
  });

  describe('Activities Management', () => {
    it('should retrieve a list of activities', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Activities`)
        .expectStatus(StatusCodes.OK)
        .expectJson('$', '$V.length > 0');
    });

    it('should create a new activity', async () => {
      const requestBody = {
        id: faker.number.int({ min: 100 }),
        title: faker.lorem.sentence(),
        dueDate: faker.date.future(),
        completed: false,
      };

      await p
        .spec()
        .post(`${baseUrl}/Activities`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          title: requestBody.title,
        });
    });
  });
});