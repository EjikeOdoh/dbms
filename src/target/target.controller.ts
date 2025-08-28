import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TargetService } from './target.service';
import { CreateTargetDto, CreateTargetResponseDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { DeleteResponseDto } from 'src/common.dto';

@ApiBearerAuth('JWT-auth')
@Controller('target')
export class TargetController {
  constructor(private readonly targetService: TargetService) { }

  @Post()
  @ApiOperation({ summary: `Set yearly target` })
  @ApiBody({ type: CreateTargetDto })
  @ApiOkResponse({ type: CreateTargetResponseDto })
  @ApiConflictResponse({ example: `This target already exists.` })
  @ApiInternalServerErrorResponse({ example: `An unexpected error occurred while creating this target` })
  async create(@Body() createTargetDto: CreateTargetDto) {
    return await this.targetService.create(createTargetDto);
  }

  @Get()
  @ApiOperation({summary:`Fetch all targets`})
  @ApiOkResponse({type: [CreateTargetResponseDto]})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while getting targets.`})
  async findAll() {
    return await this.targetService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary:`Fetch yearly target`})
  @ApiOkResponse({type: CreateTargetResponseDto})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while getting this target.`})
  async findOne(@Param('id') id: string) {
    return await this.targetService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: `Update yearly target` })
  @ApiBody({ type: CreateTargetDto, required: false })
  @ApiOkResponse({ type: CreateTargetResponseDto })
  @ApiInternalServerErrorResponse({ example: `An unexpected error occurred while updating this target.` })
  update(@Param('id') id: string, @Body() updateTargetDto: UpdateTargetDto) {
    return this.targetService.update(+id, updateTargetDto);
  }

  @Delete(':id')
  @ApiOperation({summary:`Delete yearly target`})
  @ApiOkResponse({type: DeleteResponseDto})
  @ApiInternalServerErrorResponse({example:`An unexpected error occurred while deleting this target.`})
  remove(@Param('id') id: string) {
    return this.targetService.remove(+id);
  }
}
