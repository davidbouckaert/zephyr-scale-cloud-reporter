/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
import request from 'supertest';
import { expect, assert } from 'chai';
import { ZephyrConfig } from './interfaces/zephyr-config.interface';
import { defaultVariables, Variables } from './interfaces/variables.interface';
import { Environments } from './interfaces/environments.interface';
import { Statuses } from './interfaces/statuses.interface';
import { TestCycles } from './interfaces/testcycles.interface';
import { Folders } from './interfaces/folders.interface';
import { TestCases } from './interfaces/testcases.interface';
import { SoftAssert } from './interfaces/soft-assert.interface';
import { JiraAccount } from './interfaces/jiraAccount.interface';

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

const variables: Variables = defaultVariables;

/**
 * This function sets a range of variables the Zephyr module uses
 * @param {ZephyrConfig} zephyrConfig
 */
export async function init(zephyrConfig: ZephyrConfig) {
  validateObjectValues(zephyrConfig, 'init');
  variables.zephyrURL = zephyrConfig.zephyrURL;
  variables.jiraURL = zephyrConfig.jiraURL;
  variables.zephyrApiToken = zephyrConfig.zephyrApiToken;
  variables.jiraApiToken = zephyrConfig.jiraApiToken;
  variables.projectKey = zephyrConfig.zephyrProjectKey;
  variables.defaultJiraDisplayName = zephyrConfig.defaultJiraDisplayName;
  variables.jiraDisplayName = zephyrConfig.jiraDisplayName;
}

const getJiraAccounts = async () => {
  let accounts;
  await request(variables.jiraURL)
    .get(`/rest/api/2/user/search?query&maxResults=2000`)
    .set('Authorization', `Basic ${variables.jiraApiToken}`)
    .then((res) => {
      accounts = res.body;
    });
  return accounts;
};

const getJiraAccountId = async (): Promise<string> => {
  //TODO wat als de displayName niet gevonden is?
  const allAccounts: JiraAccount[] = await getJiraAccounts(); // return de value van de key 'accountId' voor elke folder waar de value van de key 'displayName' gelijk is aan de naam die we zoeken
  return allAccounts.find(
    (account) => account.displayName === variables.jiraDisplayName
  ).accountId;
};

const getEnvironmentNames = async (): Promise<Environments> => {
  let environments;
  await request(variables.zephyrURL)
    .get(`/environments?projectKey=${variables.projectKey}`)
    .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
    .then((res) => {
      environments = JSON.parse(res.text);
    });
  return environments;
};

export const logEnvironmentNames = async () => {
  const allEnvironments: Environments = await getEnvironmentNames();
  allEnvironments.values.forEach((env) =>
    console.log(`Available environment: ${env.name}`)
  );
};

const getTestCases = async (folderName: string): Promise<TestCases> => {
  let testcases;
  try {
    const folder_id = await getFolderId(folderName);
    await request(variables.zephyrURL)
      .get(
        `/testcases?maxResults=1000&projectKey=${variables.projectKey}&folderId=${folder_id}`
      )
      .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
      .then((res) => {
        testcases = JSON.parse(res.text);
      });
    return testcases;
  } catch (err) {
    console.log(`ERROR [getTestCases] - ${err}`);
  }
};

const getTestCaseKey = async (folderName: string, testCaseName: string) => {
  //TODO what if no match if found for this specific testcasename/folder
  let key;
  const allTestCases: TestCases = await getTestCases(folderName); // return de value van de key 'key' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken

  allTestCases.values.forEach((testCase) => {
    if (testCase.name === testCaseName) {
      key = testCase.key;
    }
  });
  return key;
};

const getFolders = async (): Promise<Folders> => {
  let folders;
  try {
    await request(variables.zephyrURL)
      .get(`/folders?maxResults=500&projectKey=${variables.projectKey}`)
      .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
      .then((res) => {
        folders = JSON.parse(res.text);
      });
    return folders;
  } catch (err) {
    console.log(`ERROR [getFolders] - ${err}`);
  }
};

const getFolderId = async (folderName: string) => {
  let id;
  const allFolders = await getFolders(); // return de value van de key 'id' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken
  allFolders.values.forEach((folder) => {
    if (folder.name === folderName) {
      id = folder.id;
    }
  });
  if (id === undefined)
    console.log(
      `ERROR [getFolderId] - No folder found for name: ${folderName}`
    );
  return id;
};

const getTestCycles = async (): Promise<TestCycles> => {
  let testcycles;
  try {
    await request(variables.zephyrURL)
      .get(`/testcycles?maxResults=500&projectKey=${variables.projectKey}`)
      .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
      .then((res) => {
        testcycles = JSON.parse(res.text);
      });
    return testcycles;
  } catch (err) {
    console.log(`ERROR [getTestCycles] - ${err}`);
  }
};

const getTestCycleKey = async (testCycleName: string) => {
  //TODO what if the test case isn't part of the test cycle?
  //! blijkbaar is dit geen probleem.
  let key;
  const allTestCycles = await getTestCycles(); // return de value van de key 'key' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken
  allTestCycles.values.forEach((testCylce) => {
    if (testCylce.name === testCycleName) {
      key = testCylce.key;
    }
  });
  if (key === undefined)
    console.log(
      `ERROR [getFolderId] - No test cylce found for name: ${testCycleName}`
    );
  return key;
};

const getStatusNames = async (): Promise<Statuses> => {
  let statusNames;
  await request(variables.zephyrURL)
    .get(`/statuses?projectKey=${variables.projectKey}`)
    .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
    .then((res) => {
      statusNames = JSON.parse(res.text);
    });
  return statusNames;
};

export const logStatusNames = async () => {
  const allStatuses = await getStatusNames();
  allStatuses.values.forEach((status) =>
    console.log(`Available status: ${status.name}`)
  );
};

export const createNewTestExecution = async (
  status: boolean,
  environmentName: string,
  folderName: string,
  testCaseName: string,
  testCycleName: string
): Promise<void> => {
  let statusName: string;
  if (status === false) {
    statusName = 'Fail';
  } else if (status === true) {
    statusName = 'Pass';
  } else {
    console.log(
      'ERROR [createNewTestExecution] please enter a valid test status'
    );
  }
  const payload = {
    projectKey: variables.projectKey,
    testCaseKey: await getTestCaseKey(folderName, testCaseName),
    testCycleKey: await getTestCycleKey(testCycleName),
    statusName,
    environmentName,
    executedById: await getJiraAccountId(),
  };
  await request(variables.zephyrURL)
    .post(`/testexecutions`)
    .set('Authorization', `Bearer ${variables.zephyrApiToken}`)
    .send(payload)
    .then((res) => {
      const responseObj = JSON.parse(res.text);
      if (res.statusCode !== 201) {
        console.log(`ERROR [createNewTestExecution] ${responseObj.message}`);
      } else {
        console.log(
          `INFO [createNewTestExecution] - Succesfully create a new test execution\nID:${responseObj.id}\nURL:${responseObj.self}`
        );
      }
    });
};

/**
 * Assert and capture errors.
 * While a normal failing assert would stop the code from running, the soft-assert can continue
 * And throws errors only if .assertAll() is called.
 */
export const softAssert: SoftAssert = {
  failedAsserts: [],
  equals(value: any, condition: any): boolean {
    if (value === undefined || condition === undefined) {
      console.log(
        'ERROR [equals] please provide the value and condition arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    try {
      expect(value).equal(condition);
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
    }
    return assertPassed;
  },
  notEquals(value: any, condition: any): boolean {
    if (value === undefined || condition === undefined) {
      console.log(
        'ERROR [notEquals] please provide the value and condition arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    try {
      expect(value).not.equal(condition);
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
    }
    return assertPassed;
  },
  deepEquals(value: any, condition: any): boolean {
    if (value === undefined || condition === undefined) {
      console.log(
        'ERROR [deepEquals] please provide the value and condition arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    try {
      expect(value).deep.equal(condition);
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
    }
    return assertPassed;
  },
  includes(sample: any, pattern: any): boolean {
    if (sample === undefined || pattern === undefined) {
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
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
      }
    } else {
      try {
        expect(sample).deep.include(pattern);
        assertPassed = true;
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
      }
    }
    return assertPassed;
  },
  notIncludes(sample: any, pattern: any): boolean {
    if (sample === undefined || pattern === undefined) {
      console.log(
        'ERROR [notIncludes] please provide the sample and pattern arguments'
      );
      process.exit(1);
    }
    let assertPassed = false;
    if (Array.isArray(sample) === true && Array.isArray(pattern) === true) {
      console.log('sample is object or array');
      try {
        expect(sample).not.include.members(pattern);
        assertPassed = true;
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
      }
    } else {
      try {
        expect(sample).not.deep.include(pattern);
        assertPassed = true;
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
      }
    }
    return assertPassed;
  },
  isUndefined(value: any): boolean {
    let assertPassed = false;
    try {
      expect(value).equal(undefined);
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
    }
    return assertPassed;
  },
  isNull(value: any): boolean {
    let assertPassed = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(value).to.be.null;
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
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
        'ERROR [objectHasAllKeys] please provide the sample and pattern arguments'
      );
      process.exit(1);
    }
    if (Array.isArray(arrayWithKeys) !== true) {
      console.log(
        'ERROR [objectHasAllKeys] please pass an array as the arguments for "arrayWithKeys"'
      );
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
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
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
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
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
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
      }
    }
    if (typeof value === 'number') {
      try {
        expect(value).not.be.null;
      } catch (error) {
        const e: any = error;
        this.failedAsserts.push(e);
        assertPassed = false;
      }
    }
    return assertPassed;
  },
  isOneOf(arr: [], value: any): boolean {
    let assertPassed = false;
    if (!value) {
      console.log('ERROR [isOneOf] please pass an argument');
      process.exit(1);
    }
    try {
      expect(value).to.be.oneOf(arr);
      assertPassed = true;
    } catch (error) {
      const e: any = error;
      this.failedAsserts.push(e);
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