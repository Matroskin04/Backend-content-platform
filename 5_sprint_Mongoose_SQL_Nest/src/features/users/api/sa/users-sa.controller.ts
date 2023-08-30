import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { QueryUsersSAInputModel } from './models/input/query-users-sa.input.model';
import {
  ViewAllUsersModels,
  UserOutputModel,
} from './models/output/user.output.model';
import { CreateUserInputModel } from './models/input/create-user.input.model';
import { UsersQueryRepository } from '../../infrastructure/query.repository/users.query.repository';
import { UsersSaService } from '../../application/sa/users-sa.service';
import { Response } from 'express';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { BasicAuthGuard } from '../../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateBanInfoOfUserInputModel } from './models/input/update-ban-info-of-user.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/sa/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../../application/sa/use-cases/delete-user.use-case';
import { UpdateBanInfoOfUserCommand } from '../../application/sa/use-cases/update-ban-info-user.use-case';

@SkipThrottle()
@Controller('/hometask-nest/sa/users')
export class UsersSaController {
  constructor(
    protected commandBus: CommandBus,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllUsers(
    @Query() query: QueryUsersSAInputModel,
    @Res() res: Response<ViewAllUsersModels | string>,
  ) {
    const result = await this.usersQueryRepository.getAllUsers(query);
    res.status(HTTP_STATUS_CODE.OK_200).send(result);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(
    @Body() inputUserModel: CreateUserInputModel,
    @Res() res: Response<UserOutputModel>,
  ) {
    const result = await this.commandBus.execute(
      new CreateUserCommand(inputUserModel),
    );
    res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/ban')
  async updateBanInfoOfUser(
    @Param('id') userId: string,
    @Body() inputBanInfo: UpdateBanInfoOfUserInputModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBanInfoOfUserCommand(userId, inputBanInfo),
    );
    if (!result) throw new NotFoundException('User is not found');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response<void>) {
    const result = await this.commandBus.execute(new DeleteUserCommand(userId));

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}