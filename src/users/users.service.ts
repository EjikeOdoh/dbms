import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

import { passHash } from 'src/utils/hash';
import { StaffService } from 'src/staff/staff.service';
import { VolunteersService } from 'src/volunteers/volunteers.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private staffService: StaffService,
    private volunteerService: VolunteersService
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password, staffId, volunteerId, ...rest } = createUserDto;
    let defaultPassword: string

    if (!password) {
      defaultPassword = "password"
    } else {
      defaultPassword = password
    }

    const hashedPass = await passHash(defaultPassword);

    const newUser = this.usersRepository.create({
      ...rest,
      password: hashedPass,
    });

    if (staffId) {
      const staff = await this.staffService.findOne(staffId);
      if (!staff) throw new NotFoundException('Staff not found');
      newUser.staff = staff;
    } else if (volunteerId) {
      const volunteer = await this.volunteerService.findOne(volunteerId);
      if (!volunteer) throw new NotFoundException('Volunteer not found');
      newUser.volunteer = volunteer;
    }

    try {
      return await this.usersRepository.save(newUser);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('This user already exists.');
      }
      throw new InternalServerErrorException('An error occurred while creating this user');
    }
  }


  findAll() {
    return this.usersRepository.find({
      relations: ['staff', 'volunteer'],
      select: {
        id: true,
        role: true,
        email: true,
        firstName: true,
        lastName: true,
        staff: {
          firstName: true,
          lastName: true
        },
        volunteer: {
          firstName: true,
          lastName: true
        }
      }
    }
    );
  }

  async findByName(email: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.mfaSecret', 'user.mfaPendingSecret', 'user.failedLoginAttempts', 'user.failedLoginWindowStartedAt', 'user.lockoutUntil'])
      .where('user.email = :email', { email })
      .getOne();
    if (!user) throw new NotFoundException(`User with email "${email}" not found`);
    return user;
  }

  async findForMfa(id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.mfaSecret', 'user.mfaPendingSecret'])
      .where('user.id = :id', { id })
      .getOne();
  }

  async saveMfaEnrollment(id: number, pendingSecret: string) {
    await this.usersRepository.update(id, { mfaPendingSecret: pendingSecret });
  }

  async enableMfa(id: number, secret: string) {
    await this.usersRepository.update(id, {
      mfaSecret: secret,
      mfaPendingSecret: null,
      mfaEnabled: true,
    });
  }

  async disableMfa(id: number) {
    await this.usersRepository.update(id, {
      mfaSecret: null,
      mfaPendingSecret: null,
      mfaEnabled: false,
    });
  }

  async registerFailedLogin(id: number, maxAttempts: number, windowMinutes: number, lockoutMinutes: number) {
    const user = await this.findByIdForSecurity(id);
    if (!user) return undefined;
    const now = new Date();
    const withinWindow = user.failedLoginWindowStartedAt && now.getTime() - user.failedLoginWindowStartedAt.getTime() <= windowMinutes * 60_000;
    const attempts = withinWindow ? user.failedLoginAttempts + 1 : 1;
    const locked = attempts >= maxAttempts;
    await this.usersRepository.update(id, {
      failedLoginAttempts: locked ? 0 : attempts,
      failedLoginWindowStartedAt: locked ? null : (withinWindow ? user.failedLoginWindowStartedAt : now),
      lockoutUntil: locked ? new Date(now.getTime() + lockoutMinutes * 60_000) : null,
    });
    return locked;
  }

  async resetLoginFailures(id: number) {
    await this.usersRepository.update(id, { failedLoginAttempts: 0, failedLoginWindowStartedAt: null, lockoutUntil: null });
  }

  private findByIdForSecurity(id: number) {
    return this.usersRepository.createQueryBuilder('user')
      .addSelect(['user.failedLoginAttempts', 'user.failedLoginWindowStartedAt', 'user.lockoutUntil'])
      .where('user.id = :id', { id }).getOne();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['staff', 'volunteer'],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: false,
        role: true,
        staff: {
          id: true,
          staffId: true,
          firstName: true,
          lastName: true,
          startDate: true,
          endDate: true,
          address: true,
          phone: true,
          email: true,
          location: true,
          role: true,
          active: true,
          skillSet: true,
          cpName1: true,
          cpRel1: true,
          cpPhone1: true,
          cpName2: true,
          cpRel2: true,
          cpPhone2: true,
        },
        volunteer: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          active: true,
          startDate: true,
          endDate: true,
          address: true,
          location: true,
          email: true,
          phone: true,
          skillSet: true,
          cpName1: true,
          cpRel1: true,
          cpPhone1: true,
          cpName2: true,
          cpRel2: true,
          cpPhone2: true,
        },
      },
    });

    if (!user) throw new NotFoundException(`User with email "${id}" not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['staff', 'volunteer'] });
    if (!user) throw new NotFoundException('User not found');

    const { password, staffId, volunteerId, ...rest } = updateUserDto;

    // Update simple fields
    Object.assign(user, rest);

    // Hash password if provided
    if (password) {
      user.password = await passHash(password);
    }

    // Update staff or volunteer relation
    if (staffId) {
      const staff = await this.staffService.findOne(staffId);
      if (!staff) throw new NotFoundException('Staff not found');
      user.staff = staff;
      user.volunteer = null;
    } else if (volunteerId) {
      const volunteer = await this.volunteerService.findOne(volunteerId);
      if (!volunteer) throw new NotFoundException('Volunteer not found');
      user.volunteer = volunteer;
      user.staff = null;
    }

    const updatedUser = this.usersRepository.save(user);
    delete (await updatedUser).password
    return updatedUser
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    if (user.staff) {
      await this.staffService.update(user.staff.id, { hasAccount: false });
    } else if (user.volunteer) {
      await this.volunteerService.update(user.volunteer.id, { hasAccount: false });
    }
    await this.usersRepository.delete(id)

    return { delele: true }
  }
}
