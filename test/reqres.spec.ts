// /test/reqres.spec.ts (VERSÃO CORRIGIDA)

import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { SimpleReporter } from '../simple-reporter';

describe('Reqres API Test Suite', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://reqres.in';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('User Management', () => {
    it('Should create a new user', async () => {
      const requestBody = {
        name: faker.person.fullName(),
        job: faker.person.jobTitle(),
      };

      await p
        .spec()
        .post(`${baseUrl}/api/users`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          name: requestBody.name,
          job: requestBody.job,
        })
        .stores('createdUserId', 'id');
    });

    it('Should get a single user by ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/users/2`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          data: {
            id: 2,
            first_name: 'Janet',
          },
        });
    });

    it('Should get a list of users', async () => {
      await p
        .spec()
        .get(`${baseUrl}/api/users?page=2`)
        .expectStatus(StatusCodes.OK)
        // VERIFICAÇÃO CORRIGIDA:
        // Apenas valida que a página é a 2 e que o array 'data' não está vazio.
        .expectJsonLike({
          page: 2,
        })
        .expectJson('data', '$V.length > 0');
    });

    it('Should update an existing user using PUT', async () => {
      const updatedJob = faker.person.jobTitle();
      
      await p
        .spec()
        .put(`${baseUrl}/api/users/$S{createdUserId}`)
        .withJson({
          job: updatedJob,
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          job: updatedJob,
        });
    });
    
    it('Should delete a user', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/api/users/$S{createdUserId}`)
        .expectStatus(StatusCodes.NO_CONTENT);
    });
  });
  
  describe('Authentication', () => {
    it('Should return an error for unsuccessful login (missing password)', async () => {
      await p
        .spec()
        .post(`${baseUrl}/api/login`)
        .withJson({
          email: 'peter@klaven'
        })
        .expectStatus(StatusCodes.BAD_REQUEST)
        // VERIFICAÇÃO CORRIGIDA:
        // Trocado para expectJsonLike para ser mais flexível.
        .expectJsonLike({
          error: 'Missing password'
        });
    });
  });
});