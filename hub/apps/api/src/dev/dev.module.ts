import { Module } from '@nestjs/common';
import { SwitchRevisionController } from './switch-revision.controller';
import { FirestoreModule } from '../firestore/firestore.module';

@Module({
  imports: [FirestoreModule],
  controllers: [SwitchRevisionController],
})
export class DevModule {}
