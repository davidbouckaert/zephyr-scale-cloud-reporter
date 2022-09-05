## What is ZH?

ZH, or zephyr helpers is a Node JS framework that implements test suites with [Zephyr scale](https://marketplace.atlassian.com/apps/1213259/zephyr-scale-test-management-for-jira?tab=overview&hosting=cloud) for Jira.

It uses a soft-assert function to absorb failing assertions and translate them to a true/false value.

## Installing

[![npm version](https://badge.fury.io/js/@dbouckaert%2Fzh.svg)](https://badge.fury.io/js/@dbouckaert%2Fzh)

Install ZH for Mac, Linux, or Windows

```bash
npm install @dbouckaert/zh --save-dev
```

## License

[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/cypress-io/cypress/blob/master/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

## Getting started

Include the module into your test suite.
`const zh = require('@dbouckaert/zh')`

### Initiation

The first thing you'll want to do is to call the function `setVars()`
It populates the framework with critical information.
One option is to do this inside of the `before` block.

Secondly use the function `getAllTestCases()` to create an array with all the existing test cases in your Zephyr project - and store the result in an array.

```js
before(async function () {
  // FIRST: setting variables for zephyrHelpers (without the project ID)
  await zephyrHelpers.setVars({
    zephyrURL: 'https://<url.to.your.jira.env>',
    zephyrUser: credentials.zephyrUser,
    zephyrPass: credentials.zephyrPassword,
    jiraUser: { firstName: 'name', lastName: 'lastName' },
    zephyrProjectName: projectName,
    zephyrFolderName: folderName,
    environment: process.env.ENV,
    defaultJiraId: 'JIRAUSER23600',
  });
  // SECOND: filter all testcases, looking for a match based on our project ID
  testcaseArray = await zephyrHelpers.getAllTestcases();
});
```

_Note: don't store clear text passwords in your repository._

### Example use case

Explenation:
There are 2 variables defined to store the result of the GET call: `payloadResult` & `responseCodeResult`.
A varable `testName` is created that holds the exact name of the test case in Zephyr Scale.
Another variable `testrunId` is being created, it's value is set by calling the function `createNewTestrun`, 2 parameters are passed (as an object):

- testcaseArray: the test case array (from our before block)
- name: the test case name

Then the REST call is executed, and afterwards (.then) the value of `payloadResult` & `responseCodeResult` are being set.
Using the `softAssert` method:

- `responseCodeResult` `softAssert.equals()` is comparing if two parameters are an exact match and returns `true` or `false`.
- `payloadResult` `softAssert.includes()` is checking if the value of parameter 'B' is included in parameter 'A' and returns `true` or `false`.

Next up: calling the `updateTestResult()` function. This sends the result over to Zephyr Scale, making it visible in the test case (tab executions).

Finally: calling the `softAssert.assertAll()` function. This function checks if any error were absorbed during the soft-asserts. If there are, the errors are logged in the console, and the test runner will mark the test as failed.
_**Note: your CI system will also mark the job/run as failed**_

```js
it('Call /users without authorisation header', async function () {
  let payloadResult, responseCodeResult;
  const testName = 'GET /users without authorisation header (Sad flow)';
  const testrunId = await zephyrHelpers.createNewTestrun({
    testcaseArray: testcaseArray,
    name: testName,
  });

  await request(baseURL)
    .get(
      `/users?id=${getUser.id}&userIdentification=${getUser.userIdentification}&username=${getUser.username}`
    )
    .then((res) => {
      responseCodeResult = zephyrHelpers.softAssert.equals(res.statusCode, 401);
      payloadResult = zephyrHelpers.softAssert.includes(
        res.body.error,
        'Unauthorized'
      );
    });

  zephyrHelpers.updateTestResult({
    testRunId: testrunId,
    testStatus: payloadResult && responseCodeResult,
  });
  await zephyrHelpers.softAssert.assertAll();
});
```
