import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum AuditOutcome {
  Success = 'Success',
  Failure = 'Failure',
  Denied = 'Denied',
}

/**
 * Append-only, taxonomy-aligned audit record.
 *
 * NOTE: no `name:` overrides on @Column() here. For MongoDB, TypeORM does
 * NOT rename the stored document field the way it does for SQL column
 * names - it always writes using the property name. Adding `name:` here
 * silently does nothing to the actual document, but WILL get used to
 * build indexes, causing indexes to point at a field that never gets
 * written (see the E11000 dup-key-on-null bug this caused previously).
 * Keep property names and document field names identical.
 */
@Entity('audit_logs')
@Index(['eventType', 'timestampUtc'])
@Index(['actorUserId', 'timestampUtc'])
@Index(['sessionId', 'timestampUtc'])
export class SecurityLog {
  /** Mongo's own document id. Not what the rest of the app refers to -
   * see `eventId` below for the application-level identifier. */
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  eventType: string;

  @Column()
  timestampUtc: Date;

  @Column({ nullable: true })
  actorUserId?: string;

  @Column({ nullable: true })
  actorRoleAtTime?: string;

  @Column({ nullable: true })
  actorDisplayName?: string;

  @Column({ nullable: true })
  sourceIp?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  targetResourceType?: string;

  @Column({ nullable: true })
  targetResourceId?: string;

  @Column({ type: 'enum', enum: AuditOutcome })
  actionOutcome: AuditOutcome;

  @Column({ nullable: true })
  changedFields?: string[];

  @Column({ nullable: true, select: false })
  encryptedValueDelta?: string;

  @Column({ nullable: true })
  fileHash?: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ nullable: true })
  fileSize?: string;

  @Column({ nullable: true })
  mimeType?: string;

  @Column({ nullable: true })
  denialReason?: string;

  @Column({ nullable: true })
  geolocation?: string;

  @Column({ nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ nullable: true })
  previousIntegrityHash?: string;

  @Column()
  logIntegrityHash: string;
}