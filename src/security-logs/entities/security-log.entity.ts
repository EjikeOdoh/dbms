import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

export enum AuditOutcome {
  Success = 'Success',
  Failure = 'Failure',
  Denied = 'Denied',
}

/** Append-only, taxonomy-aligned audit record. */
@Entity('audit_logs')
@Index(['eventType', 'timestampUtc'])
@Index(['actorUserId', 'timestampUtc'])
@Index(['sessionId', 'timestampUtc'])
export class SecurityLog {
  @PrimaryColumn('uuid', { name: 'event_id' })
  eventId: string;

  @Column({ name: 'event_type', length: 16 })
  eventType: string;

  @CreateDateColumn({ name: 'timestamp_utc', type: 'timestamptz', precision: 3 })
  timestampUtc: Date;

  @Column({ name: 'actor_user_id', nullable: true, type: 'varchar' })
  actorUserId?: string;

  @Column({ name: 'actor_role_at_time', nullable: true })
  actorRoleAtTime?: string;

  @Column({ name: 'actor_display_name', nullable: true })
  actorDisplayName?: string;

  @Column({ name: 'source_ip', nullable: true, length: 64 })
  sourceIp?: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent?: string;

  @Column({ name: 'session_id', nullable: true, type: 'uuid' })
  sessionId?: string;

  @Column({ name: 'target_resource_type', nullable: true })
  targetResourceType?: string;

  @Column({ name: 'target_resource_id', nullable: true })
  targetResourceId?: string;

  @Column({ name: 'action_outcome', type: 'enum', enum: AuditOutcome })
  actionOutcome: AuditOutcome;

  @Column({ name: 'changed_fields', nullable: true, type: 'jsonb' })
  changedFields?: string[];

  @Column({ name: 'encrypted_value_delta', nullable: true, type: 'text', select: false })
  encryptedValueDelta?: string;

  @Column({ name: 'file_hash', nullable: true, length: 128 })
  fileHash?: string;

  @Column({ name: 'file_name', nullable: true, type: 'text' })
  fileName?: string;

  @Column({ name: 'file_size', nullable: true, type: 'bigint' })
  fileSize?: string;

  @Column({ name: 'mime_type', nullable: true })
  mimeType?: string;

  @Column({ name: 'denial_reason', nullable: true, type: 'text' })
  denialReason?: string;

  @Column({ nullable: true })
  geolocation?: string;

  @Column({ name: 'metadata', nullable: true, type: 'jsonb' })
  metadata?: Record<string, unknown>;

  @Column({ name: 'previous_integrity_hash', nullable: true, length: 71 })
  previousIntegrityHash?: string;

  @Column({ name: 'log_integrity_hash', length: 71 })
  logIntegrityHash: string;
}
