// TODO
/*
[] init functie maken zoals in de andere module
[] tokens verplaatsen naar vault/env-vars
[] try/catch: er wordt veel opgezocht, maar wat als de zoekopdracht niets opleverd?
[] parameters als object voor createNewTestExecution
[] argumenten valideren
[] createNewTestExecution, getJiraAccountId, logStatusNames & logEnvironmentNames exporteren
*/

const request = require('supertest');
const baseURL = 'https://api.zephyrscale.smartbear.com/v2';
const jiraURL = 'https://liantis-test-migratie-9.atlassian.net';
const jiraToken =
  'ZGF2aWQuYm91Y2thZXJ0QGxpYW50aXMuYmU6QVRBVFQzeEZmR0YwUmw4OXFtaVAzbmYtckJ0RmpNZk4yLVVPM0xTTU5hOWo1bXRVQnlrN1hiVV93LVB1VFZETC1oTlJPR2xBS2doS0NyR1huckFfbnZicm9zQ1dWMXdPdDF5Q3EtbFVRbld5eURxT0FjLVIxbXJDMW1fT1dYQmVRbTktNnN6c1NDNUFybWItUkxHWXV3bFlJdWh6c21Zb0pxaEViRXozM3ZEQmItQ2pSblEyODlRPUJERTQ5Mjk1';
const token =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL2xpYW50aXMtdGVzdC1taWdyYXRpZS05LmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjYxMTI4MzIzOGFkNWI2MDA3MDRiYTIzNCJ9fSwiaXNzIjoiY29tLmthbm9haC50ZXN0LW1hbmFnZXIiLCJzdWIiOiJhYjgxMGY5YS04Zjg2LTNhODktYWYzNi01NWQyM2I3NjJhYTAiLCJleHAiOjE3MDk3MjEyMjYsImlhdCI6MTY3ODE4NTIyNn0._8epTrHffpC04FuOH62YhiAGmy8OcgYWCn_Ji5ToVfQ';

/**
 *
 * @param {string} projectKey
 * @param {string} testCaseKey
 * @param {string} testCycleKey
 * @param {string} statusName
 * @param {string} environmentName
 * @param {string} jiraAccountId
 */
const createNewTestExecution = async (
  projectKey,
  testCaseKey,
  testCycleKey,
  statusName,
  environmentName,
  jiraAccountId
) => {
  const payload = {
    projectKey,
    testCaseKey,
    testCycleKey,
    statusName,
    environmentName,
    executedById: jiraAccountId,
  };
  await request(baseURL)
    .post(`/testexecutions`)
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .then((res) => {
      console.log(JSON.parse(res.text));
    });
};

const getTestCases = async (projectKey, folderId) => {
  let testcases;
  await request(baseURL)
    .get(
      `/testcases?maxResults=1000&projectKey=${projectKey}&folderId=${folderId}`
    )
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      testcases = JSON.parse(res.text);
    });
  return testcases;
};
const getTestCaseKey = async (projectKey, folderId, testCaseName) => {
  const allTestCases = await getTestCases(projectKey, folderId); // return de value van de key 'key' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken
  return allTestCases.values.find((testCase) => testCase.name === testCaseName)
    .key;
};

const getFolders = async (projectKey) => {
  let folders;
  await request(baseURL)
    .get(`/folders?maxResults=500&projectKey=${projectKey}`)
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      folders = JSON.parse(res.text);
    });
  return folders;
};

const getFolderId = async (folderName) => {
  const allFolders = await getFolders('ART02DEV08'); // return de value van de key 'id' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken
  return allFolders.values.find((folder) => folder.name === folderName).id;
};

const getTestCycles = async (projectKey) => {
  let testcycles;
  await request(baseURL)
    .get(`/testcycles?maxResults=500&projectKey=${projectKey}`)
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      testcycles = JSON.parse(res.text);
    });
  return testcycles;
};

const getTestCycleKey = async (testCylcleName) => {
  const allTestCycles = await getTestCycles('ART02DEV08'); // return de value van de key 'key' voor elke folder waar de value van de key 'name' gelijk is aan de naam die we zoeken
  return allTestCycles.values.find(
    (testCylce) => testCylce.name === testCylcleName
  ).key;
};

const getJiraAccounts = async () => {
  let accounts;
  await request(jiraURL)
    .get(`/rest/api/2/user/search?query&maxResults=2000`)
    .set('Authorization', `Basic ${jiraToken}`)
    .then((res) => {
      accounts = res.body;
    });
  return accounts;
};

const getJiraAccountId = async (displayName) => {
  //TODO wat als de displayName niet gevonden is?
  const allAccounts = await getJiraAccounts(); // return de value van de key 'accountId' voor elke folder waar de value van de key 'displayName' gelijk is aan de naam die we zoeken
  return allAccounts.find((account) => account.displayName === displayName)
    .accountId;
};

const getStatusNames = async (projectKey) => {
  let statusNames;
  await request(baseURL)
    .get(`/statuses?projectKey=${projectKey}`)
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      statusNames = JSON.parse(res.text);
    });
  return statusNames;
};

const logStatusNames = async (projectKey) => {
  const allStatuses = await getStatusNames(projectKey);
  allStatuses.values.forEach((status) =>
    console.log(`Available status: ${status.name}`)
  );
};

const getEnvironmentNames = async (projectKey) => {
  let environmentNames;
  await request(baseURL)
    .get(`/environments?projectKey=${projectKey}`)
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      environmentNames = JSON.parse(res.text);
    });
  return environmentNames;
};

const logEnvironmentNames = async (projectKey) => {
  const allEnvironments = await getEnvironmentNames(projectKey);
  allEnvironments.values.forEach((status) =>
    console.log(`Available environment: ${status.name}`)
  );
};

const run = async () => {
  const folderId = await getFolderId('Nationaliteiten-controller');
  const testCaseKey = await getTestCaseKey(
    'ART02DEV08',
    folderId,
    'GET /nationaliteiten zonder query parameters (Happy flow)'
  );
  const testCycleKey = await getTestCycleKey(
    'Cycle: nationaliteiten controller'
  );
  const accountId = await getJiraAccountId('David Bouckaert');

  await createNewTestExecution(
    'ART02DEV08',
    testCaseKey,
    testCycleKey,
    'PASS',
    'TEST',
    accountId
  );
};

run();
