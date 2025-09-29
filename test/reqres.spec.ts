import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('FakeREST API - Suíte de Testes de Integração', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://fakerestapi.azurewebsites.net/api/v1';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Endpoints de Usuários (Users)', () => {

    it('1. Deve criar um novo usuário com sucesso', async () => {
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

    it('2. Deve listar todos os usuários e a lista não deve estar vazia', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users`)
        .expectStatus(StatusCodes.OK)
        .expectJson('[0].id', 1)
        .expect((ctx) => {
          const body = ctx.res.json as any[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });

    it('3. Deve buscar um usuário específico por um ID conhecido', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/10`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', 10);
    });
    
    it('4. Não deve encontrar um usuário com ID inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/99999999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('5. Deve atualizar um usuário por um ID conhecido', async () => {
      const updatedUserName = faker.internet.username();
      const updatedBody = {
        id: 10,
        userName: updatedUserName,
        password: faker.internet.password(),
      };
      await p
        .spec()
        .put(`${baseUrl}/Users/10`)
        .withJson(updatedBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: 10,
          userName: updatedUserName,
        });
    });

    it('6. Deve deletar um usuário por um ID conhecido', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Users/10`)
        .expectStatus(StatusCodes.OK);
    });
  });

  describe('Endpoints de Atividades (Activities)', () => {
    
    it('7. Deve criar uma nova atividade com sucesso', async () => {
      const requestBody = {
        id: faker.number.int({ max: 1000 }),
        title: faker.lorem.sentence(),
        dueDate: faker.date.future().toISOString(),
        completed: false,
      };
      await p
        .spec()
        .post(`${baseUrl}/Activities`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike(requestBody);
    });

    it('8. Deve listar todas as atividades e a lista não deve estar vazia', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Activities`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([])
        .expect((ctx) => {
          const body = ctx.res.json as any[];
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });

    it('9. Deve buscar uma atividade específica por um ID conhecido', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Activities/15`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', 15);
    });

    it('10. Deve atualizar uma atividade por um ID conhecido', async () => {
      const updatedTitle = faker.lorem.words(3);
      const requestBody = {
        id: 15,
        title: updatedTitle,
        dueDate: faker.date.future().toISOString(),
        completed: true,
      };
      await p
        .spec()
        .put(`${baseUrl}/Activities/15`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ id: 15, title: updatedTitle, completed: true });
    });

    it('11. Deve deletar uma atividade por um ID conhecido', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Activities/15`)
        .expectStatus(StatusCodes.OK);
    });
  });
});