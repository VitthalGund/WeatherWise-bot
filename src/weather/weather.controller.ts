import { Controller, Module } from '@nestjs/common';
import { WeatherServices } from './weather.service';
// import { Message } from 'node-telegram-bot-api';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/userSchema';

@Controller('bot')
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
})
export class WeatherController {
  constructor(private readonly weatherServices: WeatherServices) {}
}
