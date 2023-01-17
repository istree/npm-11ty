const common = require("./common");
const util = require('@istree/util');
const { DateTime } = require("luxon");

let filterMap = {
    // Object
    keys,

    // Array
    slice,
    concat,
    filter,

    // String
    normalize,
    removeHyphen,

    // Date Time
    dateTime,

    // Sort
    sort,
    sortByProp,

    // Group By
    groupBy,

    // Domain Logic
    tagList,
    defaultTitle,
    defaultPageTitle,

    // Debug
    print,
    printCollections,
};

// Basic

// Object
function keys(obj) {
    return Object.keys(obj);
}

// Array slice
function slice(target) {
    let params = Array.prototype.slice.call(arguments, 1);
    return Array.prototype.slice.apply(target, params);
}

// Array concat
function concat(str) {
    let params = Array.prototype.slice.call(arguments, 1);
    return String.prototype.concat.apply(str, params)
}

// Array filter
function filter(collections, propPath, condition, value) {
    let result = collections.filter( function(item) {
        let propValue = common.valuePath(item, propPath);
        return eval("'"+propValue + "' " + condition + " '" + value + "'");
    });
    return result;
}

// String
function normalize(str) {
    return str.normalize('NFC');
}

function removeHyphen(dateObj) {
    return dateObj.toString().replaceAll('-', ' ');
}

// Date Time
function dateTime(value, format) {
    return DateTime.fromJSDate(value).toFormat(format);
}

// Complex

// Sort collections
function sort(collections) {
    let compareFunction = new Intl.Collator('en').compare;
    let copied = collections.slice()
    copied.sort(compareFunction);
    return copied;
}

// Sort collections form properties
function sortByProp(collections, propPath) {
    let compareFunction = new Intl.Collator('en').compare;
    let copied = collections.slice();
    copied.sort( function(a,b) {
        return common.comparePath(propPath, a, b, compareFunction);
    });
    return copied;
}

// Group By
function groupBy(target, prop, filter /* params */) {
    let filterParams = Array.prototype.slice.call(arguments, 3);
    let result = common.groupedList();
    target.map( function(item) {
        let propValue = common.valuePath(item, prop);
        if (util.notUndefined(propValue)) {
            propValue = applyFilter(filterMap, filter, [propValue].concat(filterParams) );
            result.push(propValue, item)
        }
    });
    // printGroupedList(groupedList);
    return result.data;
}

function applyFilter(filterMap, filter, params) {
    if (util.isOwnProperty(filterMap, filter)) {
        return filterMap[filter].apply(null, params);
    }
}

// Domain Logic
function tagList(collections) {
    return keys(collections);
}

function defaultTitle(title, fileSlug) {
    return title ? title : removeHyphen( normalize(fileSlug) );
}

function defaultPageTitle(page) {
    let pageDataTitle = page.data ? page.data.title : undefined;
    return defaultTitle(pageDataTitle, page.fileSlug);
}

// debug
function print(target) {
    console.log('print:');
    console.log(target);
}

function printCollections(target) {
    console.log('- collection keys ');
    util.forObject( target, function(tag, key) {
        console.log(key);
    });
    console.log('- end collection keys ');

    util.forObject( target, function(tag, key) {
        console.log(key+":");
        tag.map(function(tagItem) {
            let assignedTagItem = Object.assign({}, tagItem)
            assignedTagItem.template = "";
            assignedTagItem._templateContent = "";
            assignedTagItem.templateContent = "";
            assignedTagItem.frontMatter = "";
            assignedTagItem.inputContent = "";
            console.log(assignedTagItem);
        });
    });
}

function printGroupedList(groupedList) {
    groupedList.data.map( function(item) {
        console.log('item group name');
        console.log(item.name);
        item.values.map( function(value) {
            console.log('value.date');
            console.log(value.data.page);
        });
    });
}

module.exports = filterMap;
