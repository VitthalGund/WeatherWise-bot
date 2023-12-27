import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { WeatherController } from './weather/weather.controller';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherServices } from './weather/weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './Model/userSchema';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    WeatherModule,
    ConfigModule.forRoot({ envFilePath: '.env.local' }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/Bot'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [WeatherServices, AppService],
})
export class AppModule {}
