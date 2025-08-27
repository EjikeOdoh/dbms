import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { CreateStudentDto } from 'src/students/dto/create-student.dto';
import { ProgramType } from 'src/programs/entities/program.entity';
import { StudentsService } from 'src/students/students.service';
import { FilterDto } from 'src/participation/dto/filter.dto';
import { ParticipationService } from 'src/participation/participation.service';

@Injectable()
export class UploadsService {
  constructor(
    private studentsService: StudentsService,
    private participationService: ParticipationService,
  ) {}

  async processFile(filePath: string, data) {
    let records: any[];
    try {
      records = this.parseXLSX(filePath);
      const studentsData = records.map((record) =>
        this.mapToCreateStudentDto(record, data),
      );
      await this.studentsService.createMany(studentsData);
      return { upload: true };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error processing this file',
        HttpStatus.BAD_REQUEST,
      );
    } finally {
      this.deleteFile(filePath);
    }
  }

  async download(filterDto: FilterDto) {
    try {
      const data = await this.participationService.findByOptions(filterDto);

      const transformedData = data.map((record) => ({
        firstName: record.firstName,
        lastName: record.lastName,
        dob: Number(
          new Date().getFullYear() - new Date(record.dob).getFullYear(),
        ),
        country: record.country,
        program: record.program,
        year: record.year,
        quarter: record.quarter,
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(transformedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      const tempFilePath = `/tmp/students-${filterDto.year}(${filterDto.program}).xlsx`;
      XLSX.writeFile(workbook, tempFilePath);

      return {
        filePath: tempFilePath,
        fileName: `students-report-${filterDto.year + `(${filterDto.program})` || 'all'}.xlsx`,
      };
    } catch (error) {
      console.error('Download error:', error);
      throw new HttpException(
        'Error generating download file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseXLSX(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      raw: true,
      defval: null,
    });
  }

  private deleteFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error('File not found');
        } else {
          console.error('Error deleting file:', err);
        }
        return;
      }
      console.log(`File at ${filePath} deleted successfully`);
    });
  }

  // Transforming the data function
  private mapToCreateStudentDto(record: any, data): CreateStudentDto {
    return {
      school: record['SCHOOL'],
      currentClass: record['CLASS'],
      firstName: record['FIRST NAME'],
      lastName: record['LAST NAME'],
      dob: record['DOB'],
      address: record['ADDRESS'],
      phone: record['CELL NO.']?.toString(),
      email: record['E-MAIL'],
      fatherLastName: record["FATHER'S LAST NAME"],
      fatherFirstName: record["FATHER'S FIRST NAME"],
      fatherPhone: record["FATHER'S CELL"]?.toString(),
      fatherEducation: record["FATHER'S EDUCATION"],
      fatherJob: record["FATHER'S JOB"],
      motherLastName: record["MOTHER'S LAST NAME"],
      motherFirstName: record["MOTHER'S FIRST NAME"],
      motherPhone: record["MOTHER'S CELL"]?.toString(),
      motherEducation: record["MOTHER'S EDUCATION"],
      motherJob: record["MOTHER'S JOB"],
      noOfSisters: record['NO. OF SISTERS'],
      noOfBrothers: record['NO. OF BROTHERS'],
      position: record['POSITION'],
      focus: record['FOCUS'],
      favSubject: record['FAVORITE SUBJECT'],
      difficultSubject: record['DIFFICULT SUBJECT'],
      careerChoice1: record['CAREER CHOICE 1'],
      careerChoice2: record['CAREER CHOICE 2'],
      country: record['COUNTRY'],
      quarter: Number(data['quarter']),
      year: Number(data['year']),
      program: ProgramType[data['program']],
      grades: {
        english: record['ENGLISH'],
        math: record['MATHEMATICS'],
        chemistry: record['CHEMISTRY'],
        physics: record['PHYSICS'],
        biology: record['BIOLOGY'],
        economics: record['ECONOMICS'],
        government: record['GOVERNMENT'],
        commerce: record['COMMERCE'],
        literature: record['LITERATURE'],
        accounting: record['ACCOUNTING'],
      },
    };
  }
}
