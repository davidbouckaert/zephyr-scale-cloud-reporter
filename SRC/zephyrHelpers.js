"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.softAssert = exports.createNewTestrun = exports.updateTestResult = exports.getAllTestcases = exports.init = void 0;
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-console */
var supertest_1 = require("supertest");
var chai_1 = require("chai");
var variables_interface_1 = require("./interfaces/variables.interface");
/**
 * This function checks the value of all the keys in an object, if the value is **undefined** an error is logged.
 * @param {object} obj the object to check
 * @param {string} msg the name of the function calling this (used for error logging)
 */
var validateObjectValues = function (obj, msg) {
    var paramsUndefined = Object.values(obj).includes(undefined);
    if (paramsUndefined) {
        console.log(obj);
        throw new Error("ERROR: [".concat(msg, "] one, or more, parameter(s) value is UNDEFINED"));
    }
};
/**
 * This function makes a HTTP call to get an array with all the projects
 * @param zephyrConfig
 * @returns
 */
var getProjects = function (zephyrConfig) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, supertest_1["default"])(zephyrConfig.zephyrURL)
                .get('/rest/tests/1.0/project')
                .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass)
                .expect(200)];
    });
}); };
/**
 * This function loops over the array returned from getProjects and looks for a certain name, then returns the ID.
 * @param {ZephyrConfig} zephyrConfig
 */
var getProjectsId = function (zephyrConfig) { return __awaiter(void 0, void 0, void 0, function () {
    var projectsResponse;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getProjects(zephyrConfig)];
            case 1:
                projectsResponse = _b.sent();
                return [2 /*return*/, (_a = projectsResponse.body.find(function (project) { return project.name === zephyrConfig.zephyrProjectName; })) === null || _a === void 0 ? void 0 : _a.id];
        }
    });
}); };
/**
 * This function makes a HTTP call to lookup a specific jira user
 * @param zephyrConfig
 * @returns
 */
var getJiraUser = function (zephyrConfig) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, supertest_1["default"])(zephyrConfig.zephyrURL)
                .get("/rest/api/2/user?username=".concat(zephyrConfig.jiraUsername))
                .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass)
                .expect(200)];
    });
}); };
/**
 * This function returns the Key from any jira user object.
 * @param {ZephyrConfig} zephyrConfig
 */
var getJiraUserId = function (zephyrConfig) { return __awaiter(void 0, void 0, void 0, function () {
    var jiraUsersResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(process.env.jiraUser === 'Jenkins')) return [3 /*break*/, 1];
                return [2 /*return*/, zephyrConfig.defaultJiraId];
            case 1: return [4 /*yield*/, getJiraUser(zephyrConfig)];
            case 2:
                jiraUsersResponse = _a.sent();
                return [2 /*return*/, jiraUsersResponse.body.key];
        }
    });
}); };
var getEnvironments = function (zephyrConfig, projectId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, supertest_1["default"])(zephyrConfig.zephyrURL)
                .get("/rest/tests/1.0/project/".concat(projectId, "/environments"))
                .set('jira-project-id', projectId)
                .auth(zephyrConfig.zephyrUser, zephyrConfig.zephyrPass)];
    });
}); };
var getEnvironmentId = function (zephyrConfig, projectId) { return __awaiter(void 0, void 0, void 0, function () {
    var environmentResponse;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getEnvironments(zephyrConfig, projectId)];
            case 1:
                environmentResponse = _b.sent();
                return [2 /*return*/, (_a = environmentResponse.body.find(function (env) { return env.name === zephyrConfig.environment; })) === null || _a === void 0 ? void 0 : _a.id];
        }
    });
}); };
var variables = variables_interface_1.defaultVariables;
/**
 * This function sets a range of variables the Zephyr module uses
 * @param {ZephyrConfig} zephyrConfig
 */
function init(zephyrConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var projectId, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    validateObjectValues(zephyrConfig, 'init');
                    return [4 /*yield*/, getProjectsId(zephyrConfig)];
                case 1:
                    projectId = _c.sent();
                    variables.url = zephyrConfig.zephyrURL;
                    variables.username = zephyrConfig.zephyrUser;
                    variables.folderName = zephyrConfig.zephyrFolderName;
                    variables.password = zephyrConfig.zephyrPass;
                    variables.environment = zephyrConfig.environment;
                    variables.projectName = zephyrConfig.zephyrProjectName;
                    variables.projectId = projectId;
                    _a = variables;
                    return [4 /*yield*/, getEnvironmentId(zephyrConfig, projectId)];
                case 2:
                    _a.envId = _c.sent();
                    variables.jirauser = zephyrConfig.jiraUsername;
                    variables.defaultJiraId = zephyrConfig.defaultJiraId;
                    _b = variables;
                    return [4 /*yield*/, getJiraUserId(zephyrConfig)];
                case 3:
                    _b.jiraUserId = _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.init = init;
/**
 * This function will get all testcases for a certain project and add them to variables.testCasesArray
 * @returns {void}
 */
var getAllTestcases = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, supertest_1["default"])(variables.url)
                    .get("/rest/tests/1.0/project/".concat(variables.projectId, "/testcases"))
                    .auth(variables.username, variables.password)
                    .expect(200)
                    .then(function (res) {
                    variables.testCasesArray = res.body.testCases;
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.getAllTestcases = getAllTestcases;
var filterTestcase = function (testcaseFolderName, testcaseName) { return __awaiter(void 0, void 0, void 0, function () {
    var filteredTestcase;
    return __generator(this, function (_a) {
        filteredTestcase = variables.testCasesArray.find(function (testcase) {
            var _a;
            return testcaseFolderName === ((_a = testcase.folder) === null || _a === void 0 ? void 0 : _a.name) &&
                testcaseName === testcase.name;
        });
        if (filteredTestcase === undefined) {
            console.log("ERROR: [filterTestcase] No testcase found with name: ".concat(testcaseName, ", in folder: ").concat(testcaseFolderName));
            process.exit(1);
        }
        return [2 /*return*/, filteredTestcase];
    });
}); };
/**
 * Creating the test result 'entry' in the test run context.
 * @param {*} testcaseId
 * @returns
 */
var createTestResult = function (testcaseId) { return __awaiter(void 0, void 0, void 0, function () {
    var testrun, testrunPayload, jsonTestRunPayload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                testrunPayload = {
                    testCaseId: testcaseId,
                    assignedTo: variables.jiraUserId,
                    environmentId: variables.envId
                };
                jsonTestRunPayload = JSON.stringify(testrunPayload);
                return [4 /*yield*/, (0, supertest_1["default"])(variables.url)
                        .post('/rest/tests/1.0/testresult')
                        .set('content-Length', Buffer.byteLength(jsonTestRunPayload).toString())
                        .set('content-Type', 'application/json;charset=UTF-8')
                        .set('jira-project-id', variables.projectId)
                        .auth(variables.username, variables.password)
                        .send(jsonTestRunPayload)
                        .then(function (res) {
                        (0, chai_1.expect)(res.statusCode).eq(201);
                        testrun = res;
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, testrun.body.id];
        }
    });
}); };
/**
 * Updating the test result 'entry' with the passed/failed status, based on the 'test run id'
 * @param {object} params  testrunId, status (passed or failed)
 */
var updateTestResult = function (testResultDetails) { return __awaiter(void 0, void 0, void 0, function () {
    var testRunId, testStatus, now, jsonDate, status, payload, jsonPayload;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                testRunId = testResultDetails.testRunId, testStatus = testResultDetails.testStatus;
                now = new Date();
                jsonDate = now.toJSON();
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
                payload = [
                    {
                        id: testRunId,
                        testResultStatusId: status,
                        userKey: variables.jiraUserId,
                        executionDate: jsonDate,
                        actualStartDate: jsonDate
                    },
                ];
                jsonPayload = JSON.stringify(payload);
                return [4 /*yield*/, (0, supertest_1["default"])(variables.url)
                        .put('/rest/tests/1.0/testresult')
                        .auth(variables.username, variables.password)
                        .set('content-Length', Buffer.byteLength(jsonPayload).toString())
                        .set('content-Type', 'application/json;charset=UTF-8')
                        .set('jira-project-id', variables.projectId)
                        .send(jsonPayload)
                        .then(function (res) {
                        (0, chai_1.expect)(res.statusCode).eq(200);
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.updateTestResult = updateTestResult;
/**
 * This function creates a new test run and resturns the testrun ID
 * @param {string} testcaseFolderName name of the folder the testcase is in
 * @param {string} testcaseName name of the testcase
 * @returns {number} testrun ID
 */
var createNewTestrun = function (testcaseFolderName, testcaseName) { return __awaiter(void 0, void 0, void 0, function () {
    var filteredTestcase, testrunId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, filterTestcase(testcaseFolderName, testcaseName)];
            case 1:
                filteredTestcase = _a.sent();
                return [4 /*yield*/, createTestResult(filteredTestcase.id)];
            case 2:
                testrunId = _a.sent();
                return [2 /*return*/, testrunId];
        }
    });
}); };
exports.createNewTestrun = createNewTestrun;
/**
 * Assert and capture errors.
 * While a normal failing assert would stop the code from running, the soft-assert can continue
 * And throws errors only if .assertAll() is called.
 */
exports.softAssert = {
    failedAsserts: [],
    equals: function (value, condition) {
        if (value === undefined || condition === undefined) {
            console.log('ERROR [equals] please provide the value and condition arguments');
            process.exit(1);
        }
        var assertPassed = false;
        try {
            (0, chai_1.expect)(value).equal(condition);
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
        }
        return assertPassed;
    },
    includes: function (sample, pattern) {
        if (sample === undefined || pattern === undefined) {
            console.log('ERROR [includes] please provide the sample and pattern arguments');
            process.exit(1);
        }
        var assertPassed = false;
        if (Array.isArray(sample) === true && Array.isArray(pattern) === true) {
            console.log('sample is object or array');
            try {
                (0, chai_1.expect)(sample).include.members(pattern);
                assertPassed = true;
            }
            catch (error) {
                var e = error;
                this.failedAsserts.push(e);
            }
        }
        else {
            try {
                (0, chai_1.expect)(sample).deep.include(pattern);
                assertPassed = true;
            }
            catch (error) {
                var e = error;
                this.failedAsserts.push(e);
            }
        }
        return assertPassed;
    },
    isUndefined: function (value) {
        var assertPassed = false;
        try {
            (0, chai_1.expect)(value).equal(undefined);
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
        }
        return assertPassed;
    },
    isNull: function (value) {
        var assertPassed = false;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            (0, chai_1.expect)(value).to.be["null"];
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
        }
        return assertPassed;
    },
    /**
     * @param {object} params object & array
     * @returns true or false
     */
    objectHasAllKeys: function (obj, arrayWithKeys) {
        if (!obj || !arrayWithKeys) {
            console.log('ERROR [includes] please provide the sample and pattern arguments');
            process.exit(1);
        }
        if (Array.isArray(arrayWithKeys) !== true) {
            console.log('please pass an array as the arguments for "arrayWithKeys"');
            process.exit(1);
        }
        if (typeof obj !== 'object' || Array.isArray(obj) === true) {
            console.log('ERROR: [objectHasAllKeys] argument type of argument "obj" is not an object');
            process.exit(1);
        }
        var assertPassed;
        try {
            (0, chai_1.expect)(obj).to.have.all.keys(arrayWithKeys);
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
            assertPassed = false;
        }
        return assertPassed;
    },
    isEmptyObject: function (obj) {
        var assertPassed = false;
        if (!obj || typeof obj !== 'object' || Array.isArray(obj) === true) {
            console.log('WARNING [isEmptyObject] "obj" argument is not an object!');
        }
        try {
            (0, chai_1.expect)(Object.keys(obj)).lengthOf(0);
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
        }
        return assertPassed;
    },
    /**
     * Usefull to check e.g. if a propterty in an object has a value
     */
    hasLength: function (value) {
        var assertPassed = false;
        if (!value) {
            console.log('ERROR [hasLength] please pass an argument');
            process.exit(1);
        }
        if (typeof value === 'string' || typeof value === 'object') {
            try {
                (0, chai_1.expect)(value).not.be.empty;
                assertPassed = true;
            }
            catch (error) {
                var e = error;
                this.failedAsserts.push(e);
            }
        }
        if (typeof value === 'number') {
            try {
                (0, chai_1.expect)(value).not.be["null"];
            }
            catch (error) {
                var e = error;
                this.failedAsserts.push(e);
                assertPassed = false;
            }
        }
        return assertPassed;
    },
    isOneOf: function (arr, value) {
        var assertPassed = false;
        if (!value) {
            console.log('ERROR [isOneOf] please pass an argument');
            process.exit(1);
        }
        try {
            (0, chai_1.expect)(value).to.be.oneOf(arr);
            assertPassed = true;
        }
        catch (error) {
            var e = error;
            this.failedAsserts.push(e);
        }
        return assertPassed;
    },
    /**
     * Use this function at the end of a test to check if any of the soft-asserts failed.
     * Thow an assert.fail if any errors were captured.
     */
    assertAll: function assertAll() {
        return __awaiter(this, void 0, void 0, function () {
            var copyOfFailedAsserts;
            return __generator(this, function (_a) {
                if (this.failedAsserts.length > 0) {
                    copyOfFailedAsserts = __spreadArray([], this.failedAsserts, true);
                    this.failedAsserts.length = 0;
                    chai_1.assert.fail(copyOfFailedAsserts.join(', \n'));
                }
                return [2 /*return*/];
            });
        });
    }
};
