export interface TestResultBody {
  id: number;
  testResultStatusId: number;
  userKey: string | undefined;
  executionDate: string;
  actualStartDate: string;
}
