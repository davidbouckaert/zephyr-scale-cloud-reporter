import { TestCase } from './testcases.interface';

export interface Variables {
  url: string;
  username: string;
  password: string | undefined;
  environment: string | undefined;
  jirauser: string;
  projectName: string;
  projectId: string;
  defaultJiraId: string;
  jiraUserId: string;
  envId: number;
  testCasesArray: TestCase[];
  folderName?: string; // er is niet altijd een folder
}

export const defaultVariables: Variables = {
  url: undefined,
  username: undefined,
  password: undefined,
  environment: undefined,
  jirauser: undefined,
  projectName: undefined,
  projectId: undefined,
  defaultJiraId: undefined,
  jiraUserId: undefined,
  envId: undefined,
  testCasesArray: undefined,
};
