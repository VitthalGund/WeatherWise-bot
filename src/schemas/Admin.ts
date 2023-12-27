import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  @Prop({ type: 'number' })
  username: {
    type: string;
    required: true;
  };

  @Prop({ type: 'string' })
  email: {
    type: string;
    required: true;
  };

  @Prop({ type: 'Boolean' })
  password: {
    type: string;
    required: true;
  };

  roles: {
    Admin: {
      type: number;
      default: 5150;
    };
  };
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(Admin);
