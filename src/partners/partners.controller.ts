import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const originalName = path.parse(file.originalname).name;
          const ext = path.extname(file.originalname);
          const filename = `${originalName}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() logo: Express.Multer.File,
    @Body() createPartnerDto: CreatePartnerDto,
  ) {
    const filePath = path.resolve(logo.path);
    console.log(filePath);

    const uploadRes = await this.cloudinaryService.uploadImage(filePath);

    const logoUrl: string = uploadRes.url;
    const logoPublicId: string = uploadRes.public_id;

    return await this.partnersService.create({
      ...createPartnerDto,
      logoUrl,
      logoPublicId,
    });
  }

  @Get()
  async findAll() {
    return await this.partnersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.partnersService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const originalName = path.parse(file.originalname).name;
          const ext = path.extname(file.originalname);
          const filename = `${originalName}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @UploadedFile() logo: Express.Multer.File,
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    const filePath = path.resolve(logo.path);
    const uploadRes = await this.cloudinaryService.uploadImage(filePath);
    const logoUrl: string = uploadRes.url;
    const logoPublicId: string = uploadRes.public_id;

    return this.partnersService.update(+id, {
      ...updatePartnerDto,
      logoUrl,
      logoPublicId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(+id);
  }
}
