import { TestCases } from './testcases.interface';

export interface Variables {
  zephyrURL: string;
  jiraURL: string;
  jiraApiToken: string;
  zephyrApiToken: string;
  projectKey: string;
  testCycleName: string;
  defaultJiraDisplayName: string;
  jiraDisplayName: string;
  testCasesArray: TestCases;
}

export const defaultVariables: Variables = {
  jiraURL: undefined,
  zephyrURL: undefined,
  jiraApiToken: undefined,
  zephyrApiToken: undefined,
  jiraDisplayName: undefined,
  projectKey: undefined,
  defaultJiraDisplayName: undefined,
  testCasesArray: undefined,
  testCycleName: undefined,
};
