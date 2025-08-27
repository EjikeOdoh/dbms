import { PartialType } from '@nestjs/mapped-types';
import { CreateVolunteerParticipationDto } from './create-volunteer-participation.dto';

export class UpdateVolunteerParticipationDto extends PartialType(
  CreateVolunteerParticipationDto,
) {}
