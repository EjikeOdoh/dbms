import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { LoggerMiddleware } from './utils/logger/logger.middleware';
import { AuthController } from './auth/auth.controller';
import { SecurityLogsModule } from './security-logs/security-logs.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './security-logs/audit.interceptor';
import { AuditExceptionFilter } from './security-logs/audit-exception.filter';
import { SecurityLog } from './security-logs/entities/security-log.entity';

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
        url: configService.get<string>('NEON_DB'),
        autoLoadEntities: true,
        synchronize: true,
        // logging: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    // Audit data is intentionally isolated from the operational MIS database.
    // LOG_DB must point to a separate PostgreSQL database/cluster.
    TypeOrmModule.forRootAsync({
      name: 'audit',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('LOGS_DB');
        console.log(url)
        if (!url) throw new Error('LOG_DB must be configured for the audit database');
        return {
          type: 'postgres' as const,
          url,
          autoLoadEntities: true,
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };
      },
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
    SecurityLogsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_FILTER, useClass: AuditExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(AuthController)
  }
}
