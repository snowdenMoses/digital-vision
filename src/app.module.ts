import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './utilities/filter/http-exception.filter';
import { GraphQLFormattedError } from 'graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true, // Auto-generate schema for development environment only
      formatError: (error: GraphQLFormattedError) => {
        return {
          message: error.message,
          code: error.extensions?.code || 500,
          path: error.path ?? [], // Ensure path is always an array
          timestamp: new Date().toISOString(),
        };
      },
    }),
    PrismaModule,
    UserModule,
  ],
  providers:[
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ]
})
export class AppModule {}

