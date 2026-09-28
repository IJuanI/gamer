import { Module } from '@nestjs/common';
import { SwitchRevisionController } from './switch-revision.controller';
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SwitchRevisionController],
})
export class DevModule {}
