import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import { CreateStudentDto } from 'src/students/dto/create-student.dto';
import { ProgramType } from 'src/programs/entities/program.entity';
import {parse} from 'date-fns'

@Injectable()
export class UploadsService {

    async processFile(filePath: string, data) {
        let records: any[]
        try {
            records = this.parseXLSX(filePath)
            const studentsData = records.map(record=>(this.mapToCreateStudentDto(record, data)))
            return studentsData;
        } catch (error) {
            console.log(error)
            throw new HttpException("Error processing this file", HttpStatus.BAD_REQUEST)
        } finally {
            this.deleteFile(filePath)
        }

    }

    private parseXLSX(filePath: string): any[] {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName],{
            raw: true,
            defval: null
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


    // Transforming the data functions

    private mapToCreateStudentDto(record: any, data): CreateStudentDto {
        return {
          school: record['SCHOOL'],
          class: record['Class'],
          firstName: record['FIRST NAME'],
          lastName: record['LAST NAME'],
          dob:record['FDOB'],
          address: record['Address'],
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
          country: 'Nigeria',
          quarter: Number(data['quarter']),
          year: Number(data['year']),
          program: ProgramType[data['program']],    
           grades:{
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
           }
        };
      }
}
