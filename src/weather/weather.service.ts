import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');
import axios from 'axios';
import mongoose from 'mongoose';
import { Message } from 'node-telegram-bot-api';
import { User } from 'src/Model/userSchema';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class WeatherServices {
  private bot: any;
  private logger = new Logger(WeatherServices.name);
  constructor(@InjectModel(User.name) private userModel: mongoose.Model<User>) {
    this.bot = new TelegramBot(process.env.TelgramBotApiKey, {
      polling: true,
    });
    this.bot.on('message', (msg: Message) => {
      this.logger.debug(msg);
      if (msg.text === '/start') {
        this.start(msg.chat.id);
      }
      if (msg.text === '/subscribe') {
        this.subscribe(msg);
      }
      // const pattern = /^\/[\w\s'.-]+$/i;
      // this.logger.debug(pattern.test(msg.text));
    });
  }

  async subscribe(msg: Message) {
    const chatId = msg.chat.id;
    this.bot.sendMessage(
      chatId,
      'Enter the name of your location.(eg: location:Mumbai)',
    );
    this.bot.on('message', async (msg: Message) => {
      this.logger.debug('done');
      if (msg.text.startsWith('location:')) {
        this.subscribeUser(
          msg.chat.id.toString().toLowerCase(),
          msg.text.split(':')[1].trim(),
        );
      }
    });
  }

  // async registerUser(msg: Message) {
  //   const chatId = Number(msg.chat.id).toString();
  //   if (!msg.location) {
  //     this.bot.sendMessage(
  //       chatId,
  //       "We don't able to access your location, but still you can get weather updates by city:cityname (eg. city:Mumbai)",
  //     );
  //     return;
  //   }
  //   const location: [number, number] = [
  //     msg.location.longitude,
  //     msg.location.latitude,
  //   ];
  //   await this.subscribeUser(chatId, location);
  //   this.bot.sendMessage(
  //     chatId,
  //     'You have been subscribed to daily weather updates!',
  //   );
  // }

  start(chatId: number) {
    this.bot.sendMessage(chatId, 'Welcome to WeatherWise Bot');
  }

  async subscribeUser(chatId: string, locationName?: string) {
    const duplicate = await this.userModel.find({ chatId });
    this.logger.debug(duplicate);
    if (duplicate) {
      this.bot.sendMessage(
        chatId,
        'You are already subscribed, You will received weather at 7AM daily!',
      );
      return;
    }

    const data = await this.fetchWeatherDataForLocation(locationName);
    if (data === 'No response') {
      this.bot.sendMessage('Invalid location!');
      return;
    }

    this.bot.sendMessage(chatId, this.generateMessage(data));
    // Store the chatId and location in MongoDB
    const user = new this.userModel({
      chatId,
      locationName,
    });
    await user.save();
  }

  @Cron('0 7 * * *')
  async sendUpdates() {
    // Fetch weather data for each subscriber and send them a message.
    const users = await this.userModel.find();

    for (const user of users) {
      const data = await this.fetchWeatherDataForLocation(user.locationName);
      const message = this.generateMessage(data);
      this.bot.sendMessage(user.chatId, message);
    }
  }
  private async fetchWeatherDataForLocation(locationName: string) {
    // implement the code to handle location name
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${process.env.openWeatherAPIKey}`,
      );
      return response.data;
    } catch (error) {
      return 'No response';
    }
  }
  private async fetchWeatherData([longitude, latitude]: [number, number]) {
    // Fetch weather data from the OpenWeather API.
    // Replace 'YOUR_OPENWEATHER_API_KEY' with your actual API key.
    try {
      const response = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.openWeatherAPIKey}`,
      );
      return response.data;
    } catch (error) {
      return 'No response';
    }
  }

  generateMessage(data: any) {
    const weather = data.weather[0].description;
    const temperature = data.main.temp - 273.15;
    const city = data.name;
    const humidity = data.main.humidity;
    const pressure = data.main.pressure;
    const windSpeed = data.wind.speed;
    const message = `The weather in ${city} is ${weather} with a temperature of ${temperature.toFixed(
      2,
    )}°C. The humidity is ${humidity}%, the pressure is ${pressure}hPa, and the wind speed is ${windSpeed}m/s.`;
    return message;
  }
}
