import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { FileMaxSizePipe } from '../../common/pipes/file-max-size.pipe';
import { FileAllowMimetypePipe } from '../../common/pipes/file-allow-mimetype.pipe';
import { IFileService } from '../../providers/files/files.adapter';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { type JwtPayload } from '../auth/dto/responses/jwt.response.dto';
import { DeleteRequestDto } from './dto/requests/delete.request.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';

class FilesUploadDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any[];
}

@ApiBearerAuth()
@Controller('avatars')
export class AvatarsController {
  constructor(
    private readonly avatarsService: AvatarsService,
    private readonly fileServise: IFileService,
  ) {}
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files',
    type: FilesUploadDto,
  })
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  public async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFiles(new FileMaxSizePipe(), new FileAllowMimetypePipe())
    files: Array<Express.Multer.File>,
  ) {
    return this.avatarsService.create({ userId: user.sub, files });
  }

  @Get()
  public async findAll(@CurrentUser() user: JwtPayload) {
    return this.avatarsService.findAll(user.sub);
  }

  @Delete()
  public async softDelete(
    @CurrentUser() user: JwtPayload,
    @Body() dto: DeleteRequestDto,
  ) {
    return this.avatarsService.delete({
      avatarId: dto.avatarId,
      userId: user.sub,
    });
  }
}
