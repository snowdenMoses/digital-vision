import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const response = exception.getResponse();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      message:
        typeof response === 'string'
          ? response
          : (response as Record<string, any>).message || 'An error occurred',
      timestamp: new Date().toISOString(),
      path: gqlHost.getInfo()?.fieldName, // Get the GraphQL method field name
    };

    throw new GraphQLError(errorResponse.message, {
      extensions: {
        code: status,
        timestamp: errorResponse.timestamp,
        path: errorResponse.path,
      },
    });
  }
}
