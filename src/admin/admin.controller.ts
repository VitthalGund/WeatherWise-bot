import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Res,
  Logger,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const Cookies = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return data ? request.cookies?.[data] : request.cookies;
});
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    Logger.debug(email);
    return this.adminService.login(res, email, password);
  }
  @Post('login/google')
  async google(@Res() res: Response, @Body('email') googleAccessToken: string) {
    return this.adminService.google(res, googleAccessToken);
  }
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    Logger.debug(email);
    return this.adminService.register(res, email, password);
  }

  @Get('refresh')
  async refresh(@Cookies('jwt') jwt: string, @Res() res: Response) {
    return this.adminService.refresh(jwt, res);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Delete('user')
  async deleteUser(@Res() res: Response, @Body('chatId') chatId: string) {
    if (!chatId) {
      return res.status(400).json({ message: 'missing chatId' });
    }
    Logger.debug(chatId);
    return this.adminService.deleteUser(res, chatId);
  }

  @Delete('users')
  async deleteUsers(@Res() res: Response, @Body('chatIds') chatIds: string[]) {
    if (!chatIds) {
      return res.status(400).json({ message: 'missing chatIds' });
    }

    return this.adminService.deleteUsers(res, chatIds);
  }

  @Post('blockUser')
  async blockUser(@Res() res: Response, @Body('chatId') chatId: string) {
    if (!chatId) {
      return res.status(400).json({ message: 'missing chatId' });
    }

    return this.adminService.blockUser(res, chatId);
  }
  @Post('unblockUser')
  async unblockUser(@Res() res: Response, @Body('chatId') chatId: string) {
    if (!chatId) {
      return res.status(400).json({ message: 'missing chatId' });
    }

    return this.adminService.unblockUser(res, chatId);
  }

  @Post('blockUsers')
  async blockUsers(@Res() res: Response, @Body('chatIds') chatIds: string[]) {
    if (!chatIds) {
      return res.status(400).json({ message: 'missing chatIds' });
    }

    return this.adminService.blockUsers(res, chatIds);
  }
  @Post('updateAPI')
  async updateAPI(
    @Res() res: Response,
    @Body('key') key: string,
    @Body('key') email: string,
  ) {
    return this.adminService.API(res, key, email);
  }
}
