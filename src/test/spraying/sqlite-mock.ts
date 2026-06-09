export interface MockSprayingSQLiteDatabase {
  execAsync: jest.Mock;
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
}

export function createMockSprayingSQLiteDatabase(): MockSprayingSQLiteDatabase {
  return {
    execAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
  };
}
