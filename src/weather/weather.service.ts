import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const TelegramBot = require('node-telegram-bot-api');
import axios from 'axios';
import mongoose from 'mongoose';
import { Message } from 'node-telegram-bot-api';
import { User } from 'src/schemas/userSchema';
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
      if (msg.text.toLowerCase() === '/start') {
        this.start(msg.chat.id);
      }

      if (msg.text.toLowerCase() === '/subscribe') {
        this.subscribed(msg, true);
      }

      if (msg.text.toLowerCase().startsWith('location:')) {
        this.subscribed(msg, false).then((status) => {
          if (status === 'No response' || status === 'blocked') {
            return;
          }
          this.subscribeUser(
            msg.chat.id.toString().toLowerCase(),
            msg.text.split(':')[1].trim().toLowerCase(),
            msg.from.first_name,
          );
        });
      }

      if (msg.text.toLowerCase().startsWith('updates')) {
        userModel
          .findOne({ chatId: msg.chat.id.toString() }, { locationName: 1 })
          .then((value) => {
            if (value === null) {
              this.bot.sendMessage(
                msg.chat.id,
                'Your not subscribed to service yet',
              );
              this.bot.sendMessage(
                msg.chat.id,
                'send /subscribe to receive daily weather updates!',
              );
              return;
            }
            this.fetchWeatherDataForLocation(value.locationName).then(
              (value) => {
                const messgae = this.generateMessage(value);
                this.bot.sendMessage(msg.chat.id, messgae);
              },
            );
          })
          .catch(this.logger.debug);
      }

      // const pattern = /^\/[\w\s'.-]+$/i;
      // this.logger.debug(pattern.test(msg.text));
    });
  }

  async subscribed(msg: Message, newUser: boolean) {
    const chatId = msg.chat.id.toString();

    const duplicate = await this.userModel.findOne({ chatId });
    if (duplicate?.blocked) {
      this.bot.sendMessage(chatId, 'No service available!');
      return 'blocked';
    }
    if (newUser) {
      if (duplicate) {
        this.bot.sendMessage(
          chatId,
          'You are already subscribed, You will received weather at 7AM daily!',
        );
        return 'No response';
      }

      this.bot.sendMessage(
        chatId,
        'Enter the name of your location.(eg: location:Mumbai)',
      );
    }
  }

  start(chatId: number) {
    this.bot.sendMessage(chatId, 'Welcome to WeatherWise Bot');
  }

  async subscribeUser(chatId: string, locationName: string, username: string) {
    const data = await this.fetchWeatherDataForLocation(locationName);
    this.logger.debug(data);
    console.log(data);
    if (data === 'No response') {
      this.bot.sendMessage('Invalid location!');
      return;
    }

    this.bot.sendMessage(chatId, this.generateMessage(data));
    // Store the chatId and location in MongoDB
    const user = await this.userModel.updateOne(
      {
        chatId,
      },
      {
        $set: {
          chatId,
          username,
          locationName,
        },
      },
      {
        upsert: true,
      },
    );
    if (user.upsertedCount == 1) {
      this.bot.sendMessage(
        chatId,
        'Congratulations, You will received weather at 7AM daily!',
      );
      this.bot.sendMessage(chatId, 'Thanks for choosing WeatherWise!');
    }
    if (user.modifiedCount == 1) {
      this.bot.sendMessage(
        chatId,
        'Your location is updated to ' + locationName,
      );
      this.bot.sendMessage(
        chatId,
        'You will received weather at 7AM daily for !' + locationName,
      );
      this.bot.sendMessage(
        chatId,
        'Your can change your location any time (no warries)!',
      );
    }
  }

  @Cron('0 7 * * *')
  async sendUpdates() {
    // Fetch weather data for each subscriber and send them a message.
    const users = await this.userModel.find({ blocked: false });

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
      if (response.data.message === 'city not found') {
        return 'No response';
      }
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
