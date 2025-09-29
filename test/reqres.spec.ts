import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('FakeREST API - Suíte de Testes de Integração', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://fakerestapi.azurewebsites.net/api/v1';

  // Configura um timeout padrão para todas as requisições
  p.request.setDefaultTimeout(30000);

  // Adiciona o reporter antes de todos os testes e finaliza após todos
  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  // Armazena o ID do usuário criado para ser usado em outros testes
  let createdUserId: number;

  describe('Endpoints de Usuários (Users)', () => {
    const requestBody = {
      id: faker.number.int({ max: 2147483647 }),
      userName: faker.internet.userName(),
      password: faker.internet.password(),
    };

    it('1. Deve criar um novo usuário com sucesso', async () => {
      const spec = await p
        .spec()
        .post(`${baseUrl}/Users`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: requestBody.id,
          userName: requestBody.userName,
        });

      createdUserId = spec.json.id;
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

    it('3. Deve buscar um usuário específico pelo ID criado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/${createdUserId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', createdUserId);
    });
    
    it('4. Não deve encontrar um usuário com ID inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Users/99999999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('5. Deve atualizar um usuário pelo ID criado', async () => {
      const updatedUserName = faker.internet.userName();
      const updatedBody = {
        id: createdUserId,
        userName: updatedUserName,
        password: faker.internet.password(),
      };
      await p
        .spec()
        .put(`${baseUrl}/Users/${createdUserId}`)
        .withJson(updatedBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          userName: updatedUserName,
        });
    });

    it('6. Deve deletar um usuário pelo ID criado', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Users/${createdUserId}`)
        .expectStatus(StatusCodes.OK);
    });
  });

  describe('Endpoints de Atividades (Activities)', () => {
    let createdActivityId: number;

    it('7. Deve criar uma nova atividade com sucesso', async () => {
      const requestBody = {
        id: faker.number.int({ max: 1000 }),
        title: faker.lorem.sentence(),
        dueDate: faker.date.future().toISOString(),
        completed: false,
      };

      const spec = await p
        .spec()
        .post(`${baseUrl}/Activities`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike(requestBody);
      
      createdActivityId = spec.json.id;
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

    it('9. Deve buscar uma atividade específica pelo ID criado', async () => {
      await p
        .spec()
        .get(`${baseUrl}/Activities/${createdActivityId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson('id', createdActivityId);
    });

    it('10. Deve atualizar uma atividade pelo ID criado', async () => {
      const updatedTitle = faker.lorem.words(3);
      const requestBody = {
        id: createdActivityId,
        title: updatedTitle,
        dueDate: faker.date.future().toISOString(),
        completed: true,
      };

      await p
        .spec()
        .put(`${baseUrl}/Activities/${createdActivityId}`)
        .withJson(requestBody)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ title: updatedTitle, completed: true });
    });

    it('11. Deve deletar uma atividade pelo ID criado', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/Activities/${createdActivityId}`)
        .expectStatus(StatusCodes.OK);
    });
  });
});