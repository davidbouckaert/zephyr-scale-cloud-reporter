export interface ZephyrConfig {
  zephyrURL: string;
  jiraURL: string;
  zephyrApiToken: string;
  jiraApiToken: string;
  jiraDisplayName: string;
  zephyrFolderName: string;
  zephyrTestCycleName: string;
  environment: string | undefined;
  defaultJiraDisplayName: string;
  zephyrProjectKey: string
}
