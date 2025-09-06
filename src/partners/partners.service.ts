import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Sponsorship } from 'src/sponsorship/entities/sponsorship.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner) private partnerRepository: Repository<Partner>,
    @InjectRepository(Sponsorship)
    private sponsorshipRepo: Repository<Sponsorship>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  async create(createPartnerDto: CreatePartnerDto) {
    const partner = this.partnerRepository.create(createPartnerDto);
    try {
      return await this.partnerRepository.save(partner);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This partner already exists.');
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating this program.',
      );
    }
  }

  async findAll() {
    return await this.partnerRepository.find({
      select: ['id', 'name', 'logoUrl', 'isActive'],
    });
  }

  async findOne(id: number) {
    const partner = await this.partnerRepository.findOne({ where: { id } });
    const sponsorships = await this.sponsorshipRepo
      .createQueryBuilder('sponsorship')
      .leftJoinAndSelect('sponsorship.program', 'program')
      .select([
        'sponsorship.id AS id',
        'sponsorship.year AS year',
        'sponsorship.amount AS amount',
        'sponsorship.currency AS currency',
        'sponsorship.inKindDonation AS inKindDonation',
        'program.program As program',
      ])
      .where('sponsorship.partnerId = :partnerId', { partnerId: id })
      .orderBy('sponsorship.year', 'DESC')
      .getRawMany();
    return { ...partner, sponsorships };
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    try {
      const { logoPublicId } = await this.partnerRepository.findOne({
        where: { id },
      });
      await this.partnerRepository.update(id, updatePartnerDto);
      await this.cloudinaryService.deleteImage(logoPublicId);
      return await this.findOne(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while updating this partner record',
      );
    }
  }

  async remove(id: number) {
    try {
      await this.partnerRepository.delete(id);
      return { deleted: true };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An error occurred while deleting this partner record',
      );
    }
  }
}
