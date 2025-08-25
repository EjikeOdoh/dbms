import { Injectable } from '@nestjs/common';
import { CreateSponsorshipDto } from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';

@Injectable()
export class SponsorshipService {
  create(createSponsorshipDto: CreateSponsorshipDto) {
    return 'This action adds a new sponsorship';
  }

  findAll() {
    return `This action returns all sponsorship`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sponsorship`;
  }

  update(id: number, updateSponsorshipDto: UpdateSponsorshipDto) {
    return `This action updates a #${id} sponsorship`;
  }

  remove(id: number) {
    return `This action removes a #${id} sponsorship`;
  }
}
