import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('FakeREST Api Test Suite', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://fakerestapi.azurewebsites.net/api/v1';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => {
    p.reporter.add(rep);
    const requestBody = {
      userName: faker.internet.username(),
      password: faker.internet.password(),
    };
    return p
      .spec()
      .post(`${baseUrl}/Users`)
      .withJson(requestBody)
      .expectStatus(StatusCodes.OK)
      .stores('createdUserID', 'id')
      .stores('createdUserName', 'userName');
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('User Management', () => {
    it('should retrieve the created user by ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/$S{createdUserID}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('userName', '$S{createdUserName}');
    });

    it('should retrieve the list of all users', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users`)
        .expectStatus(StatusCodes.OK)
        .expectJson('$', '$V.length > 0');
    });

    it('should update the user', async () => {
      const updatedUserName = faker.internet.username();
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

  describe('Activities API', () => {
    it('should create a new activity', async () => {
      const requestBody = {
        id: faker.number.int({ min: 100 }),
        title: faker.lorem.sentence(),
        dueDate: faker.date.future().toISOString(),
        completed: false,
      };

      await p
        .spec()
        .post(`${baseUrl}/Activities`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: requestBody.id,
          title: requestBody.title,
        });
    });
  });
});