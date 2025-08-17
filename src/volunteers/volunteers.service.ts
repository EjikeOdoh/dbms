import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer) private volunteerRepository: Repository<Volunteer>
  ) { }

  async create(createVolunteerDto: CreateVolunteerDto) {
    const newVolunteer = this.volunteerRepository.create(createVolunteerDto)
    try {
      return await this.volunteerRepository.save(newVolunteer)
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException('An error occurred while creating this volunteer')
    }
  }

  async findAll() {
    try {
      return await this.volunteerRepository.find()
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while getting volunteers')
    }
  }

  async findOne(id: number) {
    try {
      return await this.volunteerRepository.findOne({
        where: { id }
      });

    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Volunteer record was not found')
    }
  }

 async update(id: number, updateVolunteerDto: UpdateVolunteerDto) {
    try {
      await this.volunteerRepository.update(id, updateVolunteerDto)
      return await this.findOne(id)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while updating this volunteer record')
    }
  }

  async remove(id: number) {
    try {
      await this.volunteerRepository.delete(id)
      return { delete: true }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while deleting this volunteer record')
    }
  }
}
