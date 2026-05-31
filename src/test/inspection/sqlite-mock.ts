export interface MockSQLiteDatabase {
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
}

export function createMockSQLiteDatabase(): MockSQLiteDatabase {
  return {
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    runAsync: jest.fn(),
    withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => {
      await callback();
    }) as jest.Mock,
  };
}
