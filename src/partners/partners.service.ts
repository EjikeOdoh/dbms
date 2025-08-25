import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from './entities/partner.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner) private partnerRepository: Repository<Partner>,
    private readonly cloudinaryService: CloudinaryService
  ) { }
  async create(createPartnerDto: CreatePartnerDto) {
    const partner = this.partnerRepository.create(createPartnerDto)
    try {
      return await this.partnerRepository.save(partner)
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('This partner already exists.');
      }
      throw new InternalServerErrorException('An unexpected error occurred while creating this program.');
    }
  }

  async findAll() {
    return await this.partnerRepository.find({
      select: ['id', 'name', 'logoUrl', 'isActive']
    })
  }

  async findOne(id: number) {
    return await this.partnerRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePartnerDto: UpdatePartnerDto) {
    try {
      const { logoPublicId } = await this.findOne(id)
      await this.partnerRepository.update(id, updatePartnerDto)
      await this.cloudinaryService.deleteImage(logoPublicId)

    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while updating this partner record')

    }
  }

  async remove(id: number) {
    try {
      await this.partnerRepository.delete(id);
      return { deleted: true };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('An error occurred while deleting this partner record')
    }
  }
}
