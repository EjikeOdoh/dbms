export const AuditEvent = {
  LoginSuccess: 'AUTH-001', LoginFailure: 'AUTH-002', AccountLockout: 'AUTH-003', MfaChallenge: 'AUTH-004', PasswordChange: 'AUTH-005', Logout: 'AUTH-006', SessionExpiry: 'AUTH-007', NewDevice: 'AUTH-008', ConcurrentSession: 'AUTH-009',
  RoleChange: 'AUTHZ-001', AccessDenied: 'AUTHZ-002', AdminLifecycle: 'AUTHZ-003', PrivilegeEscalation: 'AUTHZ-004',
  RecordView: 'DATA-001', RecordSearch: 'DATA-002', BulkExport: 'DATA-003', SingleExport: 'DATA-004', ReportGenerated: 'DATA-005',
  RecordCreated: 'MOD-001', RecordUpdated: 'MOD-002', SensitiveFieldUpdated: 'MOD-003', RecordDeleted: 'MOD-004', BulkImport: 'MOD-005',
  FileUploaded: 'FILE-001', FileDownloaded: 'FILE-002', FileDeleted: 'FILE-003',
  SessionStart: 'SESS-001', SessionEnd: 'SESS-002', Heartbeat: 'SESS-003',
  UserProvisioned: 'SYS-001', UserDeprovisioned: 'SYS-002', ApplicationError: 'SYS-007',
} as const;
export type AuditEventType = (typeof AuditEvent)[keyof typeof AuditEvent];
