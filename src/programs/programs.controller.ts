import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, CreateProgramResponseDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @ApiOperation({summary:`Add a program`})
  @ApiBody({type: CreateProgramDto})
  @ApiOkResponse({type: CreateProgramResponseDto})
  @ApiConflictResponse({example:`This program already exists.`})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while creating this program.`})
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programsService.create(createProgramDto);
  }

  @Get()
  @ApiOperation({summary:`Get all programs`})
  @ApiOkResponse({type: [CreateProgramResponseDto]})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while fetching all programs.`})
  findAll() {
    return this.programsService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:`Get a program`})
  @ApiOkResponse({type: CreateProgramResponseDto})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while fetching this program.`})
  findOne(@Param('id') id: string) {
    return this.programsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({summary:`Update program`})
  @ApiBody({type: CreateProgramDto})
  @ApiOkResponse({type: CreateProgramResponseDto})
  @ApiConflictResponse({example:`This program already exists.`})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while updating this program.`})
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programsService.update(+id, updateProgramDto);
  }

  @Delete(':id')
  @ApiOperation({summary:`Delete a program`})
  @ApiOkResponse({type: DeleteResponseDto})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while deleting this program.`})
  remove(@Param('id') id: string) {
    return this.programsService.remove(+id);
  }
}
