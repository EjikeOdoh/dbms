import { Body, Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { FilterDto } from 'src/participation/dto/filter.dto';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum.';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
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
  async uploadFile(@UploadedFile() file: Express.Multer.File,
    @Body() data: { year: number, program: string, quarter: 1 }) {
    if (!file || !file.path) {
      throw new Error('File upload failed or file path is undefined.');
    }

    const filePath = path.resolve(file.path);
    return await this.uploadsService.processFile(filePath, data)
  }

  @Get('download')
  async download(@Query() filterDto: FilterDto, @Res() res: Response) {
    const { filePath, fileName } = await this.uploadsService.download(filterDto);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
      }
      
      // Clean up: delete the temporary file
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting temporary file:', unlinkErr);
        }
      });
    });
  }
}
