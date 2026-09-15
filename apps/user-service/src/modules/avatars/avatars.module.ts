import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { FilesModule } from '../../providers/files/files.module';
import { AvatarsRepository } from './avatars.repository';

@Module({
  imports: [FilesModule],
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarsRepository],
})
export class AvatarsModule {}
