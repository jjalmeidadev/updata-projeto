import { describe, expect, it, vi } from 'vitest';

describe('aws-clients', () => {
  it('creates S3 and SQS clients using env AWS_REGION', async () => {
    vi.resetModules();

    process.env.AWS_REGION = 'eu-west-1';
    process.env.AWS_S3_BUCKET = 'bucket-1';
    process.env.AWS_SQS_QUEUE_URL = 'queue-url';

    const dotenvConfig = vi.fn();
    const s3Ctor = vi.fn();
    const sqsCtor = vi.fn();

    vi.doMock('dotenv', () => ({
      default: { config: dotenvConfig },
    }));

    vi.doMock('@aws-sdk/client-s3', () => ({
      S3Client: s3Ctor,
    }));

    vi.doMock('@aws-sdk/client-sqs', () => ({
      SQSClient: sqsCtor,
    }));

    await import('../../src/config/aws-clients.ts');

    expect(dotenvConfig).toHaveBeenCalledWith({ path: 'config/.env' });
    expect(s3Ctor).toHaveBeenCalledWith({ region: 'eu-west-1' });
    expect(sqsCtor).toHaveBeenCalledWith({ region: 'eu-west-1' });
  });

  it('falls back to us-east-1 when AWS_REGION is missing', async () => {
    vi.resetModules();

    delete process.env.AWS_REGION;

    const s3Ctor = vi.fn();
    const sqsCtor = vi.fn();

    vi.doMock('dotenv', () => ({
      default: { config: vi.fn() },
    }));

    vi.doMock('@aws-sdk/client-s3', () => ({ S3Client: s3Ctor }));
    vi.doMock('@aws-sdk/client-sqs', () => ({ SQSClient: sqsCtor }));

    await import('../../src/config/aws-clients.ts');

    expect(s3Ctor).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(sqsCtor).toHaveBeenCalledWith({ region: 'us-east-1' });
  });

  it('falls back safely when global process.env is undefined', async () => {
    vi.resetModules();

    const originalProcess = globalThis.process;
    Object.defineProperty(globalThis, 'process', {
      value: { env: undefined },
      configurable: true,
      writable: true,
    });

    const s3Ctor = vi.fn();
    const sqsCtor = vi.fn();

    vi.doMock('dotenv', () => ({
      default: { config: vi.fn() },
    }));

    vi.doMock('@aws-sdk/client-s3', () => ({ S3Client: s3Ctor }));
    vi.doMock('@aws-sdk/client-sqs', () => ({ SQSClient: sqsCtor }));

    try {
      await import('../../src/config/aws-clients.ts');
    } finally {
      Object.defineProperty(globalThis, 'process', {
        value: originalProcess,
        configurable: true,
        writable: true,
      });
    }

    expect(s3Ctor).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(sqsCtor).toHaveBeenCalledWith({ region: 'us-east-1' });
  });
});
