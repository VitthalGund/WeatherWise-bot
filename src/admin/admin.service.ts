import { Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/schemas/Admin';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class AdminService {
  constructor(@InjectModel(Admin.name) private userModel: Model<Admin>) {}

  async login(email: string, password: string) {
    // Here you should implement the logic for admin login
    // You might want to use Passport.js with the Google strategy
    // This is a placeholder and should be replaced with your actual logic
    console.log(`Logging in as ${{ email, password }}`);
  }
  async google(@Res() res: Response, googleAccessToken: string) {
    try {
      console.log('Bearer ' + googleAccessToken);
      if (!googleAccessToken) {
        return res
          .status(400)
          .json({ message: 'insufficient agruments are required.' });
      }

      axios
        .get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        })
        .then(async (response) => {
          const firstName = response.data.given_name;
          const lastName = response.data.family_name;
          const email = response.data.email;
          // const picture = response.data.picture;

          const existingUser = await this.userModel.findOne({ email });

          //   if (!existingUser) {
          //     const result = await this.userModel.create({
          //       isVerified: true,
          //       email,
          //       username: firstName + lastName,
          //       socialLogin: true,
          //     });
          //     existingUser = result;
          //   }
          const roles = Object.values(existingUser.roles).filter(Boolean);
          const authToken = jwt.sign(
            {
              UserInfo: {
                username: firstName + lastName,
                email: email,
                roles: roles,
              },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '10h' },
          );
          const refreshToken = jwt.sign(
            {
              username: firstName + lastName,
              email: existingUser.email,
              roles: roles,
            },
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '24h' },
          );

          res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 72 * 60 * 60 * 1000,
          });
          res.status(200).json({
            email: existingUser.email,
            username: existingUser.username,
            roles,
            success: true,
            accessToken: authToken,
          });
        })
        .catch((e) => {
          console.log(e);
          res.status(400).json({ message: 'Invalid access token!' });
        });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getUsers() {
    // Fetch all users from the database
    return await this.userModel.find({});
  }

  async deleteUser(id: string) {
    // Delete a user from the database
    return await this.userModel.findOneAndDelete({ chatId: id });
  }

  async deleteUsers(ids: string[]) {
    // Delete multiple users from the database
    return await this.userModel.deleteMany({ chatId: { $in: ids } });
  }

  async blockUser(id: string) {
    // Block a user by setting the 'blocked' field to true
    return await this.userModel.findByIdAndUpdate(
      { chatId: id },
      { blocked: true },
    );
  }

  async blockUsers(ids: string[]) {
    // Block multiple users by setting the 'blocked' field to true
    return await this.userModel.updateMany(
      { chatId: { $in: ids } },
      { blocked: true },
    );
  }
}
