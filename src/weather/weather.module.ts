import { Module } from '@nestjs/common';
import { WeatherServices } from './weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/Model/userSchema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [WeatherServices],
})
export class WeatherModule {}
