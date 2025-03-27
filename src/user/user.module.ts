import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/authentication/auth.module';

@Module({
  imports: [AuthModule, JwtModule.register({})],
  providers: [UserService, UserResolver, PrismaService]
})
export class UserModule {}
