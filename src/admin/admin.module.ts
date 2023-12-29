import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from 'src/schemas/Admin';
import { AdminSchema } from 'src/schemas/Admin';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/userSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
