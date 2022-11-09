export interface SoftAssert {
  failedAsserts: string[];
  equals: any;
  deepEquals: any;
  notEquals: any;
  includes: any;
  notIncludes: any;
  isUndefined: any;
  isNull: any;
  objectHasAllKeys: any;
  isEmptyObject: any;
  hasLength: any;
  assertAll: any;
  isOneOf: any;
}
