import pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('JSONPlaceholder API Tests', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://jsonplaceholder.typicode.com';

  // Configurações iniciais do Pactum
  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  // Dados para o corpo das requisições POST e PUT
  const newPostData = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    userId: faker.number.int({ min: 1, max: 10 }),
  };

  const updatedPostData = {
    id: 1,
    title: `UPDATED: ${faker.lorem.sentence()}`,
    body: `UPDATED: ${faker.lorem.paragraph()}`,
    userId: 1,
  };


  describe('GET Endpoints', () => {
    it('Should get a single post by ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts/1`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          userId: 1,
          id: 1,
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit'
        });
    });

    it('Should get all posts', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'number' },
              id: { type: 'number' },
              title: { type: 'string' },
              body: { type: 'string' }
            },
            required: ['userId', 'id', 'title', 'body']
          }
        })
        .expectJsonLength(100);
    });
  });


  describe('POST Endpoint', () => {
    it('Should create a new post', async () => {
      await p
        .spec()
        .post(`${baseUrl}/posts`)
        .withJson(newPostData)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          ...newPostData,
          id: 101 // A API sempre retorna 101 para novos posts
        });
    });
  });


  describe('PUT Endpoint', () => {
    it('Should update an existing post', async () => {
      await p
        .spec()
        .put(`${baseUrl}/posts/1`)
        .withJson(updatedPostData)
        .expectStatus(StatusCodes.OK)
        .expectJson(updatedPostData);
    });
  });


  describe('DELETE Endpoint', () => {
    it('Should delete an existing post', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/posts/1`)
        .expectStatus(StatusCodes.OK);
    });
  });
});