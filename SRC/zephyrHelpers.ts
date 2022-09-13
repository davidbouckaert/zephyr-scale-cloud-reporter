/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
import request from 'supertest';
import { expect, assert } from 'chai';
import { ZephyrConfig } from './interfaces/zephyr-config.interface';
import { defaultVariables, Variables } from './interfaces/variables.interface';
import { Project } from './interfaces/project.interface';
import { Environment } from './interfaces/environment.interface';
import { TestCase } from './interfaces/testcases.interface';
import { TestResultDetails } from './interfaces/test-result-details.interface';
import { TestResultBody } from './interfaces/update-test-result-body.interface';
import { SoftAssert } from './interfaces/soft-assert.interface';
import { JiraUser } from './interfaces/jira-user.interface';
import { Response } from './interfaces/response.interface';
import { NewTestResult } from './interfaces/new-test-result.interface';

/**
 * This function checks the value of all the keys in an object, if the value is **undefined** an error is logged.
 * @param {object} obj the object to check
 * @param {string} msg the name of the function calling this (used for error logging)
 */
const validateObjectValues = (obj: { [key: string]: any }, msg: string) => {
  const paramsUndefined = Object.values(obj).includes(undefined);

  if (paramsUndefined) {
    console.log(obj);
    throw new Error(
      `ERROR: [${msg}] one, or more, parameter(s) value is UNDEFINED`
    );
  }
};

/**
 * This function makes a HTTP call to get an array with all the projects
 * @param zephyrConfig
 * @returns
 */
const getProjects = async (
  zephyrConfig: ZephyrConfig
): Promise<Response<Project[]>> =>
  request(zephyrConfig.zephyrURL)
    .get('/rest/tests/1.0/project')
    .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass)
    .expect(200);

/**
 * This function loops over the array returned from getProjects and looks for a certain name, then returns the ID.
 * @param {ZephyrConfig} zephyrConfig
 */
const getProjectsId = async (
  zephyrConfig: ZephyrConfig
): Promise<string | undefined> => {
  const projectsResponse: Response<Project[]> = await getProjects(zephyrConfig);
  return projectsResponse.body.find(
    (project) => project.name === zephyrConfig.zephyrProjectName
  )?.id;
};

/**
 * This function makes a HTTP call to lookup a specific jira user
 * @param zephyrConfig
 * @returns
 */
const getJiraUser = async (
  zephyrConfig: ZephyrConfig
): Promise<Response<JiraUser>> =>
  request(zephyrConfig.zephyrURL)
    .get(`/rest/api/2/user?username=${zephyrConfig.jiraUsername}`)
    .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass)
    .expect(200);

/**
 * This function returns the Key from any jira user object.
 * @param {ZephyrConfig} zephyrConfig
 */
const getJiraUserId = async (zephyrConfig: ZephyrConfig): Promise<string> => {
  const jiraUsersResponse: Response<JiraUser> = await getJiraUser(zephyrConfig);
  return jiraUsersResponse.body.key;
};

const getEnvironments = async (
  zephyrConfig: ZephyrConfig,
  projectId: string
): Promise<Response<Environment[]>> =>
  request(zephyrConfig.zephyrURL)
    .get(`/rest/tests/1.0/project/${projectId}/environments`)
    .set('jira-project-id', projectId)
    .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass);

const getEnvironmentId = async (
  zephyrConfig: ZephyrConfig,
  projectId: string
): Promise<number> => {
  const environmentResponse: Response<Environment[]> = await getEnvironments(
    zephyrConfig,
    projectId
  );
  return environmentResponse.body.find(
    (env) => env.name === zephyrConfig.environment
  )?.id;
};

const variables: Variables = defaultVariables;

/**
 * This function sets a range of variables the Zephyr module uses
 * @param {ZephyrConfig} zephyrConfig
 */
export async function init(zephyrConfig: ZephyrConfig) {
  validateObjectValues(zephyrConfig, 'init');
  const projectId: string = await getProjectsId(zephyrConfig);

  variables.url = zephyrConfig.zephyrURL;
  variables.username = zephyrConfig.zephyrUser;
  variables.folderName = zephyrConfig.zephyrFolderName;
  variables.password = zephyrConfig.zephyrPass;
  variables.environment = zephyrConfig.environment;
  variables.projectName = zephyrConfig.zephyrProjectName;
  variables.projectId = projectId;
  variables.envId = await getEnvironmentId(zephyrConfig, projectId);
  variables.jirauser = zephyrConfig.jiraUsername;
  variables.defaultJiraId = zephyrConfig.defaultJiraId;
  variables.jiraUserId = await getJiraUserId(zephyrConfig);
}

/**
 * This function will get all testcases for a certain project and add them to variables.testCasesArray
 * @returns {void}
 */
export const getAllTestcases = async (): Promise<void> => {
  await request(variables.url)
    .get(`/rest/tests/1.0/project/${variables.projectId}/testcases`)
    .auth(variables.username, variables.password)
    .expect(200)
    .then((res) => {
      variables.testCasesArray = res.body.testCases;
    });
};

const filterTestcase = async (
  testcaseFolderName: string,
  testcaseName: string
): Promise<TestCase> => {
  const filteredTestcase: TestCase = variables.testCasesArray.find(
    (testcase: TestCase) =>
      testcaseFolderName === testcase.folder?.name &&
      testcaseName === testcase.name
  );
  if (filteredTestcase === undefined) {
    console.log(
      `ERROR: [filterTestcase] No testcase found with name: ${testcaseName}, in folder: ${testcaseFolderName}`
    );
    process.exit(1);
  }
  return filteredTestcase;
};

/**
 * Creating the test result 'entry' in the test run context.
 * @param {*} testcaseId
 * @returns
 */
const createTestResult = async (testcaseId: number): Promise<number> => {
  let testrun: Response<NewTestResult>;

  const testrunPayload = {
    testCaseId: testcaseId,
    assignedTo: variables.jiraUserId,
    environmentId: variables.envId,
  };

  const jsonTestRunPayload = JSON.stringify(testrunPayload);

  await request(variables.url)
    .post('/rest/tests/1.0/testresult')
    .set('content-Length', Buffer.byteLength(jsonTestRunPayload).toString())
    .set('content-Type', 'application/json;charset=UTF-8')
    .set('jira-project-id', variables.projectId)
    .auth(variables.username, variables.password)
    .send(jsonTestRunPayload)
    .then((res) => {
      expect(res.statusCode).eq(201);
      testrun = res;
    });

  return testrun.body.id;
};

/**
 * Updating the test result 'entry' with the passed/failed status, based on the 'test run id'
 * @param {object} params  testrunId, status (passed or failed)
 */
export const updateTestResult = async (
  testResultDetails: TestResultDetails
) => {
  const { testRunId, testStatus } = testResultDetails;
  const now = new Date();
  const jsonDate = now.toJSON();
  let status;

  validateObjectValues(testResultDetails, 'updateTestResult');

  switch (testStatus) {
    case true:
      status = 10166; // todo hardcoded: need method for these
      break;
    case false:
      status = 10167;
      console.log('> WARNING: test restult status = "failed"');
      break;
    default:
      status = 10167;
      console.log('> WARNING: test restult status = "default(failed)"');
      break;
  }

  const payload: TestResultBody[] = [
    {
      id: testRunId,
      testResultStatusId: status,
      userKey: variables.jiraUserId,
      executionDate: jsonDate,
      actualStartDate: jsonDate,
    },
  ];

  const jsonPayload: string = JSON.stringify(payload);

  await request(variables.url)
    .put('/rest/tests/1.0/testresult')
    .auth(variables.username, variables.password)
    .set('content-Length', Buffer.byteLength(jsonPayload).toString())
    .set('content-Type', 'application/json;charset=UTF-8')
    .set('jira-project-id', variables.projectId)
    .send(jsonPayload)
    .then((res) => {
      expect(res.statusCode).eq(200);
    });
};

/**
 * This function creates a new test run and resturns the testrun ID
 * @param {string} testcaseFolderName name of the folder the testcase is in
 * @param {string} testcaseName name of the testcase
 * @returns {number} testrun ID
 */
export const createNewTestrun = async (
  testcaseFolderName: string,
  testcaseName: string
): Promise<number> => {
  // searching for the correct test case (using the test name and folder name).
  const filteredTestcase: TestCase = await filterTestcase(
    testcaseFolderName,
    testcaseName
  );

  // create test run & collect testrun ID.
  const testrunId: number = await createTestResult(filteredTestcase.id);
  return testrunId;
};

/**
 * Assert and capture errors.
 * While a normal failing assert would stop the code from running, the soft-assert can continue
 * And throws errors only if .assertAll() is called.
 */
export const softAssert: SoftAssert = {
  failedAsserts: [],
  equals(value: any, condition: any): boolean {
    if (!value || !condition) {
      console.log(
        'ERROR [includes] please provide the value and condition arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    try {
      expect(value).equal(condition);
      assertPassed = true;
    } catch (error: any) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  includes(sample: any, pattern: any): boolean {
    if (!sample || !pattern) {
      console.log(
        'ERROR [includes] please provide the sample and pattern arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    if (Array.isArray(sample) === true && Array.isArray(pattern) === true) {
      console.log('sample is object or array');
      try {
        expect(sample).include.members(pattern);
        assertPassed = true;
      } catch (error: any) {
        this.failedAsserts.push(error);
      }
    } else {
      try {
        expect(sample).deep.include(pattern);
        assertPassed = true;
      } catch (error: any) {
        this.failedAsserts.push(error);
      }
    }
    return assertPassed;
  },
  isUndefined(value: any): boolean {
    let assertPassed = false;
    try {
      expect(value).equal(undefined);
      assertPassed = true;
    } catch (error: any) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  isNull(value: any): boolean {
    let assertPassed = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(value).to.be.null;
      assertPassed = true;
    } catch (error: any) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  /**
   * @param {object} params object & array
   * @returns true or false
   */
  objectHasAllKeys(
    obj: { [key: string]: any },
    arrayWithKeys: string[]
  ): boolean {
    if (!obj || !arrayWithKeys) {
      console.log(
        'ERROR [includes] please provide the sample and pattern arguments'
      );
      process.exit(1);
    }
    if (Array.isArray(arrayWithKeys) !== true) {
      console.log('please pass an array as the arguments for "arrayWithKeys"');
      process.exit(1);
    }
    if (typeof obj !== 'object' || Array.isArray(obj) === true) {
      console.log(
        'ERROR: [objectHasAllKeys] argument type of argument "obj" is not an object'
      );
      process.exit(1);
    }
    let assertPassed;
    try {
      expect(obj).to.have.all.keys(arrayWithKeys);
      assertPassed = true;
    } catch (error: any) {
      this.failedAsserts.push(error);
      assertPassed = false;
    }
    return assertPassed;
  },
  isEmptyObject(obj: { [key: string]: any }): boolean {
    let assertPassed = false;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) === true) {
      console.log('WARNING [isEmptyObject] "obj" argument is not an object!');
    }
    try {
      expect(Object.keys(obj)).lengthOf(0);
      assertPassed = true;
    } catch (error: any) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  /**
   * Usefull to check e.g. if a propterty in an object has a value
   */
  hasLength(value: any): boolean {
    let assertPassed = false;
    if (!value) {
      console.log('ERROR [hasLength] please pass an argument');
      process.exit(1);
    }
    if (typeof value === 'string' || typeof value === 'object') {
      try {
        expect(value).not.be.empty;
        assertPassed = true;
      } catch (error: any) {
        this.failedAsserts.push(error);
      }
    }
    if (typeof value === 'number') {
      try {
        expect(value).not.be.null;
      } catch (error: any) {
        this.failedAsserts.push(error);
        assertPassed = false;
      }
    }
    return assertPassed;
  },
  /**
   * Use this function at the end of a test to check if any of the soft-asserts failed.
   * Thow an assert.fail if any errors were captured.
   */
  assertAll: async function assertAll(): Promise<void> {
    if (this.failedAsserts.length > 0) {
      const copyOfFailedAsserts: string[] = [...this.failedAsserts];
      this.failedAsserts.length = 0;
      assert.fail(copyOfFailedAsserts.join(', \n'));
    }
  },
};

// module.exports = {
//   getProjectsId,
//   getAllTestcases,
//   filterTestcase,
//   createTestResult,
//   updateTestResult,
//   createNewTestrun,
//   init,
//   getEnvironmentId,
//   getJiraUser,
//   getJiraUserId,
//   softAssert,
// };
