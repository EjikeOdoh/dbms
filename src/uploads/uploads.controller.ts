import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { FilterDto } from 'src/participation/dto/filter.dto';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { SecurityLogsService } from 'src/security-logs/security-logs.service';
import { AuditEvent } from 'src/security-logs/event-types';
import { AuditOutcome } from 'src/security-logs/entities/security-log.entity';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService, private readonly audit: SecurityLogsService) {}

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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: { year: number; program: string; quarter: 1 },
    @Request() req,
  ) {
    if (!file || !file.path) {
      throw new Error('File upload failed or file path is undefined.');
    }

    const tag = file.originalname.split('.')[0];

    const filePath = path.resolve(file.path);
    const result = await this.uploadsService.processFile(filePath, { ...data, tag, mimeType: file.mimetype });
    await this.audit.record({ eventType: AuditEvent.FileUploaded, actionOutcome: AuditOutcome.Success, actorUserId: String(req.user.sub), actorRoleAtTime: req.user.role, sessionId: req.user.sid, sourceIp: req.ip, userAgent: req.get('user-agent'), targetResourceType: 'student_import', fileHash: result.fileSecurity.hash, fileName: file.originalname, fileSize: result.fileSecurity.size, mimeType: file.mimetype, metadata: { scanResult: result.fileSecurity.scanResult, recordCount: result.recordCount } });
    return result;
  }

  @Get('download')
  async download(@Query() filterDto: FilterDto, @Res() res: Response) {
    const { filePath, fileName } =
      await this.uploadsService.download(filterDto);

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
