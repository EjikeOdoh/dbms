import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { Repository } from 'typeorm';
import { VolunteerParticipation } from 'src/volunteer-participation/entities/volunteer-participation.entity';
import { Program } from 'src/programs/entities/program.entity';
import { VolunteerParticipationService } from 'src/volunteer-participation/volunteer-participation.service';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer) private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(VolunteerParticipation) private vp: Repository<VolunteerParticipation>,
    @InjectRepository(Program) private programRepository: Repository<Program>,
    private participationService: VolunteerParticipationService
  ) { }

  async create(createVolunteerDto: CreateVolunteerDto) {
    const { quarter, year, program, ...rest } = createVolunteerDto
    const volunteer = this.volunteerRepository.create(rest)

    try {
      const newVolunteer = await this.volunteerRepository.save(volunteer)
      if (newVolunteer.type === 'PROGRAM') {

        const currentProgram = await this.programRepository.findOne({ where: { program } });
        if (!currentProgram) {
          throw new NotFoundException(`Program with name ${program} not found`);
        }

        await this.participationService.create({
          volunteerId: newVolunteer.id,
          programId: currentProgram.id,
          quarter,
          year
        })
      }

      return newVolunteer

    } catch (err) {
      if (err.code === '23505') {
        throw new Error("this person already exists")
      }
      console.log(err)
      throw new InternalServerErrorException('An error occurred while creating this volunteer')
    }
  }

  async findAll() {
    try {
      return await this.volunteerRepository.find({
        select: ['id', 'firstName', 'lastName', 'type', 'active', 'location']
      })
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while getting volunteers')
    }
  }

  async findOne(id: number) {
    const volunteer = await this.volunteerRepository.findOne({ where: { id } })
    let participations = []

    if (!volunteer) {
      throw new NotFoundException(`Volunteer with ID ${id} not found`);
    }

    if (volunteer.type === 'PROGRAM') {
      participations = await this.vp
        .createQueryBuilder('volunteer_participation')
        .leftJoinAndSelect('volunteer_participation.program', 'program')
        .select([
          'volunteer_participation.id AS id',
          'volunteer_participation.year AS year',
          'volunteer_participation.quarter AS quarter',
          'program.program AS program'
        ])
        .where('volunteer_participation.id = :volunteerId', { volunteerId: id })
        .orderBy('volunteer_participation.year', 'DESC')
        .getRawMany()
    }

    return { ...volunteer, participations }
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
