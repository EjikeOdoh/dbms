import { Injectable, ServiceUnavailableException, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as net from 'net';

@Injectable()
export class FileSecurityService {
  constructor(private readonly config: ConfigService) {}

  async inspect(filePath: string, mimeType?: string) {
    const file = await fs.readFile(filePath);
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'image/jpeg', 'image/png', 'image/webp'];
    if (mimeType && !allowed.includes(mimeType)) throw new UnsupportedMediaTypeException('Unsupported upload type');
    const result = await this.scan(file);
    if (!/stream: OK$/i.test(result)) throw new UnsupportedMediaTypeException('Upload rejected by malware scanner');
    return { hash: `sha256:${createHash('sha256').update(file).digest('hex')}`, size: file.length, mimeType, scanResult: result };
  }

  private scan(file: Buffer): Promise<string> {
    const host = this.config.get<string>('CLAMAV_HOST');
    const port = Number(this.config.get('CLAMAV_PORT') ?? 3310);
    if (!host) throw new ServiceUnavailableException('CLAMAV_HOST must be configured for uploads');
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port });
      let output = '';
      const timer = setTimeout(() => { socket.destroy(); reject(new ServiceUnavailableException('Malware scanner timed out')); }, 10_000);
      socket.on('error', () => { clearTimeout(timer); reject(new ServiceUnavailableException('Malware scanner unavailable')); });
      socket.on('data', data => output += data.toString());
      socket.on('end', () => { clearTimeout(timer); resolve(output.trim()); });
      socket.on('connect', () => {
        socket.write('zINSTREAM\0');
        for (let offset = 0; offset < file.length; offset += 8192) {
          const chunk = file.subarray(offset, offset + 8192);
          const length = Buffer.alloc(4); length.writeUInt32BE(chunk.length);
          socket.write(length); socket.write(chunk);
        }
        socket.write(Buffer.alloc(4)); socket.end();
      });
    });
  }
}
