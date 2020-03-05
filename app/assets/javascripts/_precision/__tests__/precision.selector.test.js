const ko = require("knockout");
const _ = require("lodash");
require("../precision.selector.coffee");
const ObjectItemModel = global.Precision.models.ObjectItemModel;

// Set global dependencies
Object.assign(global, { ko, _ })

describe("ObjectItemModel", () => {
  const objectItemModelInstance = new ObjectItemModel({}, {}, {});

  test("should sanitize full path to file", () => {
    expect(objectItemModelInstance.sanitizeFilePath()).toEqual(undefined);
    expect(objectItemModelInstance.sanitizeFilePath(null)).toEqual(null);
    expect(objectItemModelInstance.sanitizeFilePath("")).toEqual("");
    expect(objectItemModelInstance.sanitizeFilePath("/")).toEqual("/");
    expect(objectItemModelInstance.sanitizeFilePath("a")).toEqual("a");
    expect(objectItemModelInstance.sanitizeFilePath("/a/")).toEqual("/a");
    expect(objectItemModelInstance.sanitizeFilePath("/a/b")).toEqual("/a/b");
    expect(objectItemModelInstance.sanitizeFilePath("/a/b/")).toEqual("/a/b");
    expect(objectItemModelInstance.sanitizeFilePath("a/b/")).toEqual("a/b");
  });

});
