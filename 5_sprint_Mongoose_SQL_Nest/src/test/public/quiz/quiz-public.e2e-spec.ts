import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  create9Questions,
  publishQuestionSaTest,
} from '../../super-admin/quiz/quiz-sa.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import {
  connectPlayerToQuiz,
  createResponseSingleQuizTest,
  getMyCurrentQuiz,
} from './quiz-public.helpers';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { createUserTest } from '../../super-admin/users/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';

describe('Quiz (PUBLIC); /pair-game-quiz/pairs', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;
  let dataSource: DataSource;

  beforeAll(async () => {
    const info = await startApp();
    app = info.app;
    httpServer = info.httpServer;

    dataSource = await app.resolve(DataSource);
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });

  let accessToken1;
  let accessToken2;
  let user1;
  let user2;
  //correct data question
  let correctQuestionId;
  let questionData;
  const correctBody = 'Solve: 3 + 3 = ?';
  const correctAnswers = ['6', 'шесть', 'six'];
  //incorrectData question
  const bodyLength9 = 'a'.repeat(9);
  const bodyLength501 = 'a'.repeat(501);

  describe(`/my-current (GET) - get current quiz game of a user`, () => {
    let questionsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getMyCurrentQuiz(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) no active pair for current user`, async () => {
      //jwt is incorrect
      const result = await getMyCurrentQuiz(httpServer, accessToken1);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`(Additional) + (200) should connect user1 to new quiz;
              + (200) should return current game of user;
              (Additional) + (200) should connect user2 to the quiz;
              + (200) should return current game of user;`, async () => {
      //connect to new quiz
      const result1 = await connectPlayerToQuiz(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      //get current quiz
      const result2 = await getMyCurrentQuiz(httpServer, accessToken1);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          null,
          user1.id,
          0,
          null,
          null,
        ),
      );

      //connect user2 to the quiz
      const result3 = await connectPlayerToQuiz(httpServer, accessToken2);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      //get current quiz
      const result4 = await getMyCurrentQuiz(httpServer, accessToken1);
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result4.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          0,
          user2.body.id,
          user2.body.login,
          0,
          'string',
        ),
      );
    });
  });

  describe(`/connection (POST) - connect user to existing quiz or create new`, () => {
    let questionsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await connectPlayerToQuiz(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) user 1 should create new quiz;
              + (200) user 2 should connect to quiz`, async () => {
      const result1 = await connectPlayerToQuiz(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          null,
          user1.id,
          0,
          null,
          null,
        ),
      );

      const result2 = await connectPlayerToQuiz(httpServer, accessToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          0,
          user2.body.id,
          user2.body.login,
          0,
          'string',
        ),
      );
    });

    //DEPENDENT
    it(`- (403) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await connectPlayerToQuiz(httpServer, accessToken1);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });
  });
});
