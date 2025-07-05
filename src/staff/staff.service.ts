import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private staffRepository: Repository<Staff>
  ) { }

  async create(createStaffDto: CreateStaffDto) {
    const newStaff = this.staffRepository.create(createStaffDto)
    try {
      return await this.staffRepository.save(newStaff)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while creating this staff')
    }
  }

  async findAll() {
    try {
      return await this.staffRepository.find()
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while creating this staff')
    }
  }

  async findOne(id: number) {
    try {
      return await this.staffRepository.findOne({
        where: { id }
      });

    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Staff record was not found')
    }
  }

  async update(id: number, updateStaffDto: UpdateStaffDto) {
    try {
      await this.staffRepository.update(id, updateStaffDto)
      return await this.findOne(id)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while updating this staff record')
    }
  }

  async remove(id: number) {
    try {
      await this.staffRepository.delete(id)
      return { delete: true }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while deleting this staff record')
    }
  }
}
