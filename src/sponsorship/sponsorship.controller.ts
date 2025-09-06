import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SponsorshipService } from './sponsorship.service';
import {
  CreateSponsorshipDto,
  CreateSponsorshipResponseDto,
  GetAllSponsorshipDto,
} from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('sponsorship')
export class SponsorshipController {
  constructor(private readonly sponsorshipService: SponsorshipService) {}

  @Post()
  @ApiOperation({ summary: 'Add sponsorship' })
  @ApiBody({ type: CreateSponsorshipDto })
  @ApiOkResponse({ type: CreateSponsorshipResponseDto })
  @ApiConflictResponse({ example: `This sponsorship already exists.` })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while creating this record.`,
  })
  create(@Body() createSponsorshipDto: CreateSponsorshipDto) {
    return this.sponsorshipService.create(createSponsorshipDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sponsorships' })
  @ApiOkResponse({ type: [GetAllSponsorshipDto] })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while getting sponsorships.`,
  })
  findAll() {
    return this.sponsorshipService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sponsorship' })
  @ApiOkResponse({ type: GetAllSponsorshipDto })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while getting this sponsorship.`,
  })
  findOne(@Param('id') id: string) {
    return this.sponsorshipService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sponsorship' })
  @ApiBody({ type: CreateSponsorshipDto })
  @ApiOkResponse({ type: GetAllSponsorshipDto })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while getting this sponsorship.`,
  })
  update(
    @Param('id') id: string,
    @Body() updateSponsorshipDto: UpdateSponsorshipDto,
  ) {
    return this.sponsorshipService.update(+id, updateSponsorshipDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: `Delete sponsorship` })
  @ApiOkResponse({
    type: DeleteResponseDto,
  })
  @ApiInternalServerErrorResponse({
    example: `An unexpected error occurred while deleting this sponsorship.`,
  })
  remove(@Param('id') id: string) {
    return this.sponsorshipService.remove(+id);
  }
}
