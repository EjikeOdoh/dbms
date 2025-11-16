import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Volunteer } from './entities/volunteer.entity';
import { Repository } from 'typeorm';
import { VolunteerParticipation } from 'src/volunteer-participation/entities/volunteer-participation.entity';
import { VolunteerParticipationService } from 'src/volunteer-participation/volunteer-participation.service';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer)
    private volunteerRepository: Repository<Volunteer>,
    @InjectRepository(VolunteerParticipation)
    private vp: Repository<VolunteerParticipation>,
    private participationService: VolunteerParticipationService,
  ) {}

  async create(createVolunteerDto: CreateVolunteerDto) {
    const { quarter, year, programId, ...rest } = createVolunteerDto;
    const volunteer = this.volunteerRepository.create(rest);

    try {
      const newVolunteer = await this.volunteerRepository.save(volunteer);
      if (newVolunteer.type === 'PROGRAM') {
        await this.participationService.create({
          volunteerId: newVolunteer.id,
          programId,
          quarter,
          year,
        });
      }

      return newVolunteer;
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('this person already exists');
      }
      console.log(err);
      throw new InternalServerErrorException(
        'An error occurred while creating this volunteer',
      );
    }
  }

  async findAll() {
    try {
      return await this.volunteerRepository.find({
        select: ['id', 'firstName', 'lastName','email', 'type', 'active','hasAccount'],
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while getting volunteers',
      );
    }
  }

  async findOne(id: number) {
    const volunteer = await this.volunteerRepository.findOneOrFail({
      where: { id },
    });

    const participations = await this.vp
      .createQueryBuilder('volunteer-participation')
      .leftJoinAndSelect('volunteer-participation.program', 'program')
      .select([
        'volunteer-participation.id AS id',
        'volunteer-participation.year AS year',
        'volunteer-participation.quarter AS quarter',
        'program.program AS program',
      ])
      .where('volunteer-participation.volunteerId = :volunteerId', {
        volunteerId: id,
      })
      .orderBy('volunteer-participation.year', 'DESC')
      .getRawMany();

    return { ...volunteer, participations };
  }

  async update(id: number, updateVolunteerDto: UpdateVolunteerDto) {
    try {
      await this.volunteerRepository.update(id, updateVolunteerDto);
      return this.volunteerRepository.findOne({ where: { id } });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while updating this volunteer record',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.volunteerRepository.delete(id);
      return { delete: true };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while deleting this volunteer record',
      );
    }
  }
}
