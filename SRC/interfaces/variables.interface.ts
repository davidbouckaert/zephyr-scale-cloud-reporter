import { TestCase } from './testcases.interface';

export interface Variables {
  zephyrURL: string;
  jiraURL: string;
  jiraApiToken: string;
  zephyrApiToken: string;
  environment: string | undefined;
  projectKey: string;
  testCycleName: string;
  defaultJiraDisplayName: string;
  jiraDisplayName: string;
  testCasesArray: TestCase[];
  folderName?: string; // er is niet altijd een folder
}

export const defaultVariables: Variables = {
  jiraURL: undefined,
  zephyrURL: undefined,
  jiraApiToken: undefined,
  zephyrApiToken: undefined,
  environment: undefined,
  jiraDisplayName: undefined,
  projectKey: undefined,
  defaultJiraDisplayName: undefined,
  testCasesArray: undefined,
  testCycleName: undefined,
};
