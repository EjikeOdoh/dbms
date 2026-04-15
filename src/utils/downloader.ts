import * as XLSX from 'xlsx';
import { MPD } from 'src/participation/dto/filter.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export async function downloader(options: MPD) {
    try {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(options.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, `${options.year}_${options.school}.xlsx`);
        const buffer = XLSX.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx',
        });

        return {
            buffer,
            fileName: `${options.year}_${options.school || 'all'}.xlsx`,
        };
    } catch (error) {
        console.error('Download error:', error);
        throw new HttpException(
            'Error generating download file',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}