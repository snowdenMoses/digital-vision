import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes the module accessible throughout the app without re-importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Ensure PrismaService is accessible to other modules
})
export class PrismaModule {}
