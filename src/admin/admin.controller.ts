import { Controller, Get, Post, Delete, Body, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.adminService.login(email, password);
  }
  @Post('login/google')
  async google(@Res() res: Response, @Body('email') googleAccessToken: string) {
    return this.adminService.google(res, googleAccessToken);
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Delete('user')
  async deleteUser(@Body('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('users')
  async deleteUsers(@Body('ids') ids: string[]) {
    return this.adminService.deleteUsers(ids);
  }

  @Post('blockUser')
  async blockUser(@Body('id') id: string) {
    return this.adminService.blockUser(id);
  }

  @Post('blockUsers')
  async blockUsers(@Body('ids') ids: string[]) {
    return this.adminService.blockUsers(ids);
  }
}
