'use strict';
const request = require('supertest');
const { expect, assert } = require('chai');

/**
 * This function sets a range of variables the Zephyr module uses
 * @param {object} params zephyrURL,zephyrUser,zephyrPass,jiraUser,zephyrProjectName, environment
 */
async function setVars(params) {
  validateObjectValues(params, 'setVars');
  const {
    zephyrURL,
    zephyrUser,
    zephyrPass,
    jiraUsername,
    zephyrProjectName,
    zephyrFolderName,
    environment,
    defaultJiraId,
  } = params;
  (variables.changeURL = zephyrURL),
    (variables.changeUsername = zephyrUser),
    (variables.changeFolderName = zephyrFolderName),
    (variables.changePassword = zephyrPass),
    (variables.changeEnvironment = environment),
    (variables.changeProjectName = zephyrProjectName),
    (variables.changeProjectId = await getProjectsId()),
    (variables.changeEnvId = await getEnvID()),
    (variables.changeJira_username = jiraUsername),
    (variables.changeDefaultJiraId = defaultJiraId),
    (variables.changeJiraUserId = await getJiraUserIdByUsername());
}

const variables = {
  _url: '',
  set changeURL(url) {
    this._url = url;
  },
  get getURL() {
    return this._url;
  },
  _username: '',
  set changeUsername(username) {
    this._username = username;
  },
  get getUsername() {
    return this._username;
  },
  _password: '',
  set changePassword(password) {
    this._password = password;
  },
  get getPassword() {
    return this._password;
  },
  _environment: '',
  set changeEnvironment(environment) {
    this._environment = environment;
  },
  get getEnvironment() {
    return this._environment;
  },
  _jira_user: '',
  set changeJira_username(jira_username) {
    this._jira_username = jira_username;
  },
  get getJira_username() {
    return this._jira_username;
  },
  _projectName: '',
  set changeProjectName(projectName) {
    this._projectName = projectName;
  },
  get getProjectName() {
    return this._projectName;
  },
  _projectId: '',
  set changeProjectId(projectId) {
    this._projectId = projectId;
  },
  get getProjectId() {
    return this._projectId;
  },
  _defaultJiraId: '',
  set changeDefaultJiraId(defaultJiraId) {
    this._defaultJiraId = defaultJiraId;
  },
  get getDefaultJiraId() {
    return this._defaultJiraId;
  },
  _folderName: '',
  set changeFolderName(folderName) {
    this._folderName = folderName;
  },
  get getFolderName() {
    return this._folderName;
  },
  _jiraUserId: '',
  set changeJiraUserId(jiraUserId) {
    this._jiraUserId = jiraUserId;
  },
  get getJiraUserId() {
    return this._jiraUserId;
  },
  _envId: '',
  set changeEnvId(envId) {
    this._envId = envId;
  },
  get getEnvId() {
    return this.envId;
  },
};

/**
 * Makes a REST call to the Zephyr API, passing the name and familyname in the query parameters.
 * Expecting the response to include the userId
 * @returns
 */
// async function getJiraUserIdByName() {
//   let id;
//   try {
//     if (!variables.getJira_user.firstName) throw new Error('firstname');
//   } catch (error) {
//     console.log(`[getJiraIdByName] Please pass your ${error}`);
//     return;
//   }
//   await request(variables.getURL)
//     .get(
//       `/rest/api/2/user/search?_=1652790599789&username=${variables.getJira_user.firstName}+${variables.getJira_user.lastName}`
//     )
//     .auth(variables.getUsername, variables.getPassword)
//     .expect(200)
//     .then((res) => {
//       try {
//         id = res.body[0].key;
//       } catch (error) {
//         console.log(
//           `ERROR: [getJiraUserIdByName] No Jira user found with the name of: ${variables.getJira_user.firstName} ${variables.getJira_user.lastName}.`
//         );
//         console.log('INFO: Setting Jira user to "default Jira user"');
//         id = variables.getDefaultJiraId;
//       }
//     });
//   return id;
// }

async function getJiraUserIdByUsername() {
  let id;
  try {
    if (!variables.getJira_username) throw new Error('username');
  } catch (error) {
    console.log(`[getJiraIdByName] Please pass your ${error}`);
    return;
  }
  await request(variables.getURL)
    .get(`/rest/api/2/user?username=${variables.getJira_username}`)
    .auth(variables.getUsername, variables.getPassword)
    .expect(200)
    .then((res) => {
      try {
        id = res.body.key;
      } catch (error) {
        console.log(
          `ERROR: [getJiraUserIdByUsername] No Jira user found with username: ${variables.getJira_username}`
        );
        console.log('INFO: Setting Jira user to "default Jira user"');
        id = variables.getDefaultJiraId;
      }
    });
  return id;
}

/**
 * This function checks the value of all the keys in an object, if the value is **undefined** an error is logged.
 * @param {object} obj the object to check
 */
function validateObjectValues(obj, msg) {
  const paramsUndefined = Object.values(obj).includes(undefined);

  if (paramsUndefined) {
    console.log(obj);
    throw new Error(
      `ERROR: [${msg}] one, or more, parameter(s) value is UNDEFINED`
    );
  }
}

/**
 * This function searches all the projects and looks for a certain name, then returns the ID.
 * @param {string} projectName The name of the project you want the ID for
 */
async function getProjectsId() {
  const projectName = variables.getProjectName;
  let project_Id;
  // get all projects from Zephyr and store those with a matching project-id.
  await request(variables.getURL)
    .get(`/rest/tests/1.0/project`)
    .auth(variables.getUsername, variables.getPassword)
    .expect(200)
    .then((res) => {
      for (const project of res.body) {
        if (project.name === projectName) {
          project_Id = project.id;
        }
      }
    });
  return project_Id;
}

/**
 * This function will get all testcases for a certain project.
 * @returns {array} array with objects
 */
async function getAllTestcases() {
  let allTestcases;
  await request(variables.getURL)
    .get(`/rest/tests/1.0/project/${variables.getProjectId}/testcases`)
    .auth(variables.getUsername, variables.getPassword)
    .expect(200)
    .then(async (res) => {
      allTestcases = res.body.testCases;
    });

  return allTestcases;
}

/**
 * This function looks for a testcase, based on it's name, in an array of testcases
 * @param {array} testcaseArray the array of testcases you want to search
 * @param {string} testcaseName the name of the testcase you want to find
 * @returns {object} returns the matching testcase object
 */
async function filterTestcase(testcaseArray, testcaseName) {
  const folderName = variables.getFolderName;
  let filteredTestcase;
  for (const testcase of testcaseArray) {
    if (testcase.folder) {
      if (
        testcase.folder.name === folderName &&
        testcase.name === testcaseName
      ) {
        filteredTestcase = testcase;
      }
    } else {
      if (testcase.name === testcaseName) {
        filteredTestcase = testcase;
      }
    }
  }
  if (filteredTestcase === undefined) {
    console.log(
      `ERROR: [filterTestcase] No testcase found with name: ${testcaseName}, in folder: ${folderName}`
    );
    process.exit(1);
  }
  return filteredTestcase;
}

/**
 *
 * @param {string} envName DEV, ACC, TST, PROD
 * @returns
 */
async function getEnvID() {
  const environment = variables.getEnvironment;
  let ID, response;
  await request(variables.getURL)
    .get(`/rest/tests/1.0/project/${variables.getProjectId}/environments`)
    .set('jira-project-id', variables.getProjectId)
    .auth(variables.getUsername, variables.getPassword)
    .then((res) => {
      const result = res.body;
      response = result;
      result.forEach((object) => {
        if (object.name === environment) {
          ID = object.id;
        }
      });
    });
  if (ID === undefined) {
    console.log(response);
    throw new Error(`[getEnvID] No ID found for environment: ${environment}`);
  }
  return ID;
}

/**
 * Creating the test result 'entry' in the test run context.
 * @param {*} testcaseId
 * @returns
 */
async function createTestResult(testcaseId) {
  let testrunId;

  const testrunPayload = {
    testCaseId: testcaseId,
    assignedTo: variables.getJiraUserId,
    environmentId: variables.getEnvId,
  };

  const jsonTestRunPayload = JSON.stringify(testrunPayload);
  await request(variables.getURL)
    .post(`/rest/tests/1.0/testresult`)
    .set('content-Length', Buffer.byteLength(jsonTestRunPayload))
    .set('content-Type', 'application/json;charset=UTF-8')
    .set('jira-project-id', variables.getProjectId)
    .auth(variables.getUsername, variables.getPassword)
    .send(jsonTestRunPayload)
    .then((res) => {
      expect(res.statusCode).eq(201);
      testrunId = res.body.id;
    });

  return testrunId;
}

/**
 * Updating the test result 'entry' with the passed/failed status, based on the 'test run id'
 * @param {object} params  testrunId, status (passed or failed)
 */
async function updateTestResult(params) {
  const { testRunId, testStatus } = params;
  const now = new Date();
  const jsonDate = now.toJSON();
  let status;

  validateObjectValues(params, 'updateTestResult');

  switch (testStatus) {
    case true:
      status = 10166;
      break;
    case false:
      status = 10167;
      console.log('> WARNING: test restult status = "failed"');
      break;
  }

  const payload = [
    {
      id: testRunId,
      testResultStatusId: status,
      userKey: variables.getJiraUserId,
      executionDate: jsonDate,
      actualStartDate: jsonDate,
    },
  ];

  const jsonPayload = JSON.stringify(payload);

  await request(variables.getURL)
    .put(`/rest/tests/1.0/testresult`)
    .auth(variables.getUsername, variables.getPassword)
    .set('content-Length', Buffer.byteLength(jsonPayload))
    .set('content-Type', 'application/json;charset=UTF-8')
    .set('jira-project-id', variables.getProjectId)
    .send(jsonPayload)
    .then((res) => {
      expect(res.statusCode).eq(200);
    });
}

/**
 * This function creates a new test run and resturns the testrun ID
 * @param {string} testcaseArray the array with testcases to filter
 * @param {string} name name of the testcase
 * @returns {number} testrun ID
 */
async function createNewTestrun(params) {
  const { testcaseArray, name } = params;
  validateObjectValues(params, 'getTestCaseIdByName');

  // searching for the correct test case (using the test name and folder name).
  const filteredTestcase = await filterTestcase(testcaseArray, name);

  // create test run & collect testrun ID.
  const testrunId = await createTestResult(filteredTestcase.id);
  return testrunId;
}

/**
 * Assert and capture errors.
 * While a normal failing assert would stop the code from running, the soft-assert can continue
 * And throws errors only if .assertAll() is called.
 */
const softAssert = {
  failedAsserts: [],
  equals: function (value, condition) {
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
    } catch (error) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  includes: function (sample, pattern) {
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
      } catch (error) {
        this.failedAsserts.push(error);
      }
    } else {
      try {
        expect(sample).deep.include(pattern);
        assertPassed = true;
      } catch (error) {
        this.failedAsserts.push(error);
      }
    }
    return assertPassed;
  },
  isUndefined: function (value) {
    let assertPassed = false;
    try {
      expect(value).equal(undefined);
      assertPassed = true;
    } catch (error) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  isNull: function (value) {
    let assertPassed = false;
    try {
      expect(value).to.be.null;
      assertPassed = true;
    } catch (error) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  /**
   * @param {object} params object & array
   * @returns true or false
   */
  objectHasAllKeys: function (obj, arrayWithKeys) {
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
      console.log('please pass an object as the arguments for "obj"');
      process.exit(1);
    }
    let assertPassed;
    try {
      expect(obj).to.have.all.keys(arrayWithKeys);
      assertPassed = true;
    } catch (error) {
      this.failedAsserts.push(error);
      assertPassed = false;
    }
    return assertPassed;
  },
  isEmptyObject: function (obj) {
    let assertPassed = false;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj) === true) {
      console.log('WARNING [isEmptyObject] "obj" argument is not an object!');
    }
    try {
      expect(Object.keys(obj)).lengthOf(0);
      assertPassed = true;
    } catch (error) {
      this.failedAsserts.push(error);
    }
    return assertPassed;
  },
  /**
   * Usefull to check e.g. if a propterty in an object has a value
   */
  hasLength: function (value) {
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
        this.failedAsserts.push(error);
      }
    }
    if (typeof value === 'number') {
      try {
        expect(value).not.be.null;
      } catch (error) {
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
  assertAll: async function assertAll() {
    if (this.failedAsserts.length > 0) {
      const copyOfFailedAsserts = [...this.failedAsserts];
      this.failedAsserts.length = 0;
      assert.fail(copyOfFailedAsserts.join(', \n'));
    }
  },
};

module.exports = {
  getProjectsId,
  getAllTestcases,
  filterTestcase,
  createTestResult,
  updateTestResult,
  createNewTestrun,
  setVars,
  getEnvID,
  softAssert,
  getJiraUserIdByUsername,
};
