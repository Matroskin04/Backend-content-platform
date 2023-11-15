import { Module } from '@nestjs/common';
import { UsersSaController } from './api/sa/users-sa.controller';
import { UsersBloggerController } from './api/blogger/users-blogger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepository } from './infrastructure/SQL/repository/users.repository';
import { UsersOrmRepository } from './infrastructure/typeORM/repository/users-orm.repository';
import { RegisterUserUseCase } from '../auth/application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../auth/application/use-cases/login-user.use-case';
import { ValidateUserUseCase } from '../auth/application/use-cases/validate-user.use-case';
import { CreateUserUseCase } from './application/sa/use-cases/create-user.use-case';
import { UpdateBanInfoOfUserUseCase } from './application/sa/use-cases/update-ban-info-of-user.use-case';
import { UpdateUserBanInfoForBlogUseCase } from './application/blogger/use-cases/update-user-ban-info-for-blog.use-case';
import { DeleteUserUseCase } from './application/sa/use-cases/delete-user.use-case';
import { Users } from './domain/users.entity';
import { UsersPasswordRecovery } from './domain/users-password-recovery.entity';
import { UsersEmailConfirmation } from './domain/users-email-confirmation.entity';
import { UsersBanInfo } from './domain/users-ban-info.entity';
import { UsersQueryRepository } from './infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from './infrastructure/typeORM/query.repository/users-orm.query.repository';
import { CryptoAdapter } from '../../infrastructure/adapters/crypto.adapter';
import { EmailConfirmationOrmRepository } from './infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from './infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from './infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { DevicesOrmRepository } from '../devices/infrastructure/typeORM/repository/devices-orm.repository';
import { BannedUsersOfBlog } from '../blogs/domain/banned-users-of-blog.entity';
import { Devices } from '../devices/domain/devices.entity';
import { BlogsOrmQueryRepository } from '../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { AppModule } from '../../app.module';
import { Blogs } from '../blogs/domain/blogs.entity';

const entities = [
  Users,
  UsersPasswordRecovery,
  UsersEmailConfirmation,
  UsersBanInfo,
  BannedUsersOfBlog,
  Devices,
  Blogs,
];
const queryRepositories = [
  UsersQueryRepository,
  UsersOrmQueryRepository,
  BlogsOrmQueryRepository,
];
const repositories = [
  UsersRepository,
  UsersOrmRepository,
  DevicesOrmRepository,
  EmailConfirmationOrmRepository,
  PasswordRecoveryOrmRepository,
  BanInfoOrmRepository,
];
const useCases = [
  CreateUserUseCase,
  UpdateBanInfoOfUserUseCase,
  UpdateUserBanInfoForBlogUseCase,
  DeleteUserUseCase,
];
@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [UsersSaController, UsersBloggerController],
  providers: [
    ...useCases,
    ...repositories,
    ...queryRepositories,
    CryptoAdapter,
  ],
  exports: [TypeOrmModule],
})
export class UsersModule {}