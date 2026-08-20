const test = require('node:test');
const assert = require('node:assert/strict');
const { UnauthorizedException } = require('@nestjs/common');
const { AuthGuard } = require('../dist/auth/guard/auth.guard.js');

test('rethrows session validation errors with their original message', async () => {
  const sessionService = {
    validate: async () => {
      throw new UnauthorizedException('Session expired due to inactivity.');
    },
  };

  const guard = new AuthGuard(
    {
      verifyAsync: async () => ({ sessionId: 'session-123' }),
    },
    {
      getAllAndOverride: () => false,
    },
    {
      get: () => 'test-secret',
    },
    sessionService,
  );

  const request = {
    headers: {
      authorization: 'Bearer test-token',
    },
  };

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  };

  await assert.rejects(
    () => guard.canActivate(context),
    (error) => {
      assert.ok(error instanceof UnauthorizedException);
      assert.equal(error.message, 'Session expired due to inactivity.');
      return true;
    },
  );
});
