export interface ZephyrConfig {
  zephyrURL: string;
  zephyrUser: string;
  zephyrPass: string | undefined;
  jiraUsername: string;
  zephyrProjectName: string;
  zephyrFolderName: string;
  environment: string | undefined;
  defaultJiraId: string;
}
