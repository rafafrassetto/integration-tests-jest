import pactum from 'pactum';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

const p = pactum;
const rep = SimpleReporter;
const baseUrl = 'https://reqres.in/api';

describe('Prova 02 - Testes de Integração na API ReqRes.in', () => {
  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Criação de Usuário (POST)', () => {
    it('Deve criar um novo usuário com sucesso', async () => {
      const requestBody = {
        name: faker.person.fullName(),
        job: faker.person.jobTitle(),
      };

      await p
        .spec()
        .post(`${baseUrl}/users`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonLike({
          name: requestBody.name,
          job: requestBody.job,
        })
        .stores('UserID', 'id');
    });
  });

  describe('Consulta de Usuários (GET)', () => {
    it('Deve listar os usuários de uma página específica', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users`)
        .withQueryParams('page', 2)
        .expectStatus(StatusCodes.OK)
        .expectJsonMatch({
          page: 2,

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: (pactum as any).match.like([
            {
              id: 7,
              email: 'michael.lawson@reqres.in',
            },
          ]),
        });
    });

    it('Deve obter um usuário específico pelo ID', async () => {
      await p
        .spec()
        .get(`${baseUrl}/users/2`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          data: {
            id: 2,
            email: 'janet.weaver@reqres.in',
            first_name: 'Janet',
          },
        });
    });
  });

  describe('Atualização de Usuário (PUT)', () => {
    it('Deve atualizar um usuário existente com sucesso', async () => {
      const updatedBody = {
        name: faker.person.fullName(),
        job: 'Resident',
      };

      await p
        .spec()
        .put(`${baseUrl}/users/{id}`)
        .withPathParams('id', '$S{UserID}')
        .withJson(updatedBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: updatedBody.name,
          job: updatedBody.job,
        });
    });
  });

  describe('Deleção de Usuário (DELETE)', () => {
    it('Deve deletar um usuário com sucesso', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/users/{id}`)
        .withPathParams('id', '$S{UserID}')
        .expectStatus(StatusCodes.NO_CONTENT);
    });
  });
});