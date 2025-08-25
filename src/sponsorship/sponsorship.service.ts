import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSponsorshipDto } from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sponsorship } from './entities/sponsorship.entity';
import { Repository } from 'typeorm';
import { Partner } from 'src/partners/entities/partner.entity';
import { Program } from 'src/programs/entities/program.entity';

@Injectable()
export class SponsorshipService {

  constructor(
    @InjectRepository(Sponsorship) private sponsorshipRepository: Repository<Sponsorship>,
    @InjectRepository(Partner) private partnerRepository: Repository<Partner>,
    @InjectRepository(Program) private programsRepository: Repository<Program>
  ) { }

  async create(createSponsorshipDto: CreateSponsorshipDto) {
    const { partnerId, programId, ...rest } = createSponsorshipDto

    const partner = await this.partnerRepository.findOne({ where: { id: partnerId } })
    if (!partner) {
      throw new NotFoundException(`partner with ID ${partnerId} not found`);
    }

    const p = await this.programsRepository.findOne({ where: { id: programId } })
    if (!p) {
      throw new NotFoundException(`Program not found`)
    }

    const sponsorship = this.sponsorshipRepository.create({
      ...rest,
      partner,
      program: p
    })

    try {
      return await this.sponsorshipRepository.save(sponsorship)
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An unexpected error occurred while creating this record.');
    }
  }

  async findAll() {
    return await this.sponsorshipRepository.find()
  }

  async findOne(id: number) {
    return await this.sponsorshipRepository.findOne({ where: { id } })
  }

  async update(id: number, updateSponsorshipDto: UpdateSponsorshipDto) {
    await this.sponsorshipRepository.update(id, updateSponsorshipDto)
    return await this.findOne(id)
  }

  async remove(id: number) {
    await this.sponsorshipRepository.delete(id)
    return { deleted: true }
  }
}
