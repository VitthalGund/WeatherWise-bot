import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { WeatherController } from './weather/weather.controller';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherServices } from './weather/weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/userSchema';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [
    WeatherModule,
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    MongooseModule.forRoot(process.env.DATABASE_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule.forRoot(),
    AdminModule,
    AdminModule,
  ],
  controllers: [AppController, AdminController],
  providers: [WeatherServices, AppService, AdminService],
})
export class AppModule {}
