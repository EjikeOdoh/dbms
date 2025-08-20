import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateVolunteerParticipationDto } from './dto/create-volunteer-participation.dto';
import { UpdateVolunteerParticipationDto } from './dto/update-volunteer-participation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VolunteerParticipation } from './entities/volunteer-participation.entity';
import { Repository } from 'typeorm';
import { Volunteer } from 'src/volunteers/entities/volunteer.entity';
import { Program } from 'src/programs/entities/program.entity';
import { Student } from 'src/students/entities/student.entity';

@Injectable()
export class VolunteerParticipationService {
  constructor(
    @InjectRepository(VolunteerParticipation) private vp: Repository<VolunteerParticipation>,
    @InjectRepository(Volunteer) private vRepository: Repository<Volunteer>,
    @InjectRepository(Program) private programsRepository: Repository<Program>,
  ) { }
  async create(createVolunteerParticipationDto: CreateVolunteerParticipationDto) {

    const { volunteerId, programId, ...rest } = createVolunteerParticipationDto;
    const volunteer = await this.vRepository.findOne({ where: { id: volunteerId } })

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${volunteerId} not found`);
    }

    const p = await this.programsRepository.findOne({ where: { id: programId } })
    if (!p) {
      throw new NotFoundException(`Program not found`)
    }

    const participation = this.vp.create({
      ...rest,
      volunteer,
      program: p
    })

    try {
      return await this.vp.save(participation)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An unexpected error occurred while creating this record.');
    }

  }

  async findAll() {
    return await this.vp.find();
  }

  async findOne(id: number) {
    return await this.vp.findOne({ where: { id } })
  }

  async update(id: number, updateVolunteerParticipationDto: UpdateVolunteerParticipationDto) {
    await this.vp.update(id, updateVolunteerParticipationDto)
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.vp.delete(id)
    return { deleted: true }
  }
}
