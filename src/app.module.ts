import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StudentsModule } from './students/students.module';
import { ProgramsModule } from './programs/programs.module';
import { GradesModule } from './grades/grades.module';
import { ParticipationModule } from './participation/participation.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StaffModule } from './staff/staff.module';
import { TargetModule } from './target/target.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { VolunteerParticipationModule } from './volunteer-participation/volunteer-participation.module';
import { PartnersModule } from './partners/partners.module';
import { SponsorshipModule } from './sponsorship/sponsorship.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TagModule } from './tag/tag.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './security-logs/audit.interceptor';
import { AuditExceptionFilter } from './security-logs/audit-exception.filter';
import { SecurityLogsModule } from './security-logs/security-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:configService.get<string>("DB_HOST"),
        port:configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_DATABASE"),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        autoLoadEntities: true,
        synchronize: true,
        // logging: true,
        ssl: false
      }),
    }),
TypeOrmModule.forRootAsync({
  name: 'audit',
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mongodb',
    url: configService.get<string>('MONGO_DB'),
    autoLoadEntities: true,
    synchronize: true,
  }),
}),
    StudentsModule,
    ProgramsModule,
    GradesModule,
    ParticipationModule,
    UploadsModule,
    AuthModule,
    UsersModule,
    StaffModule,
    TargetModule,
    VolunteersModule,
    VolunteerParticipationModule,
    PartnersModule,
    SponsorshipModule,
    CloudinaryModule,
    TagModule,
    SecurityLogsModule
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: AuditExceptionFilter },
  ],
})
export class AppModule { }

