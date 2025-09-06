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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, CreatePartnerResponseDto, GetAllPartnersResponseDto, PartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiConsumes, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('partners')
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new partner with logo upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Partner creation payload with logo upload',
    type: PartnerDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Partner created successfully',
    type: CreatePartnerResponseDto,
  })
  @ApiConflictResponse({
    example: `This partner already exists!`
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while creating this partner.`
  })
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
    let logoUrl: string;
    let logoPublicId: string;
    if (logo) {
      const filePath = path.resolve(logo.path);
      const uploadRes = await this.cloudinaryService.uploadImage(filePath);
      logoUrl = uploadRes.url;
      logoPublicId = uploadRes.public_id;
    }


    return await this.partnersService.create({
      ...createPartnerDto,
      logoUrl,
      logoPublicId,
    });
  }


  @Get()
  @ApiOperation({ summary: `Get all partners` })
  @ApiOkResponse({
    type: [GetAllPartnersResponseDto]
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching all partners.`
  })
  async findAll() {
    return await this.partnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: `Get partner` })
  @ApiOkResponse({
    type: CreatePartnerResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while fetching this partner.`
  })
  async findOne(@Param('id') id: string) {
    return await this.partnersService.findOne(+id);
  }


  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(+id, updatePartnerDto);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update partner' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: PartnerDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Partner updated successfully',
    type: CreatePartnerResponseDto,
  })
  @ApiInternalServerErrorResponse({
    example: `An error occurred while updating this partner record`
  })
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
    let logoUrl: string;
    let logoPublicId: string;
    if (logo) {
      const filePath = path.resolve(logo.path);
      const uploadRes = await this.cloudinaryService.uploadImage(filePath);
      logoUrl = uploadRes.url;
      logoPublicId = uploadRes.public_id;
    }

    return this.partnersService.update(+id, {
      ...updatePartnerDto,
      logoUrl,
      logoPublicId,
    });
  }


  @Delete(':id')
  @ApiOperation({ summary: `Delete a partner` })
  @ApiOkResponse({
    type: DeleteResponseDto
  })
  @ApiInternalServerErrorResponse({
    example: `An error occurred while deleting this partner record`
  })
  remove(@Param('id') id: string) {
    return this.partnersService.remove(+id);
  }
}
