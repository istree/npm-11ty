const common = require("./common");
const util = require('@istree/util');
const { DateTime } = require("luxon");

let filterMap = {
    // Object
    keys,

    // Array
    reverse,
    slice,
    concat,
    prepend,
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
    groupByExt,
    eachName,
    eachValues,

    // Domain Logic
    tagList,
    defaultTitle,
    defaultPageTitle,

    // Debug
    print,
    printCollections,

    // Util
    init
};

let eleventyConfig = {};

// Basic

// Object
function keys(obj) {
    return Object.keys(obj);
}

// Array reverse
function reverse(target) {
    let copied = target.slice();
    const params = util.params(arguments, 1);
    return Array.prototype.reverse.apply(copied, params);
}

// Array slice
function slice(target) {
    let params = util.params(arguments, 1);
    return Array.prototype.slice.apply(target, params);
}

// Array concat
function concat(str) {
    let params = util.params(arguments, 1);
    return String.prototype.concat.apply(str, params);
}

// Array prepend
function prepend(str) {
    let params = util.params(arguments, 1);
    return String.prototype.concat.apply(params.join(''), [str]);
}

// Array filter
function filter(collections, propPath, condition, value) {
    let result = collections.filter( function(item) {
        let propValue = common.valuePath(item, propPath);
        return eval(stringSequence(propValue) + condition + stringSequence(value) );
    });
    return result;
}

function stringSequence(value) {
    return util.isString(value)
    ? "'" + value + "'"
    : value;
}

// String
function normalize(str) {
    return str.normalize('NFC');
}

function removeHyphen(dateObj) {
    return dateObj.toString().replaceAll('-', ' ');
}

// Date Time
function dateTime(value, format, toNumber) {
    let result = DateTime.fromJSDate(value).toFormat(format);
    return toNumber ? Number(result) : result;
}

// Complex

// Sort collections
function sort(collections) {
    let compareFunction = new Intl.Collator('en').compare;
    let copied = collections.slice();
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
function groupBy(target, prop, propFilter /* params */) {
    let propFilterParams = util.params(arguments, 3);

    let action = function(target) {
        return groupByProp(target, prop, propFilter, propFilterParams);
    }

    return groupByStart( target, action);
}

function groupByExt(target, propMethod, sortMethod) {
    let sortMethodParamsList = util.params(arguments, 2);

    let action = function(target) {
        return groupByPropAndSort(target, propMethod, sortMethodParamsList);
    }

    return groupByStart( target, action);
}

function groupByStart(target, action) {
    if ( util.isUndefined(target.grouped) ) {
        let result = action(target); // new group
        result.grouped = true; // initialize grouped flag
        return result;
    } else {
        applyToLeafNodes(target, "values", action);
        return target;
    }
}

function eachName(target) {
    let filterParamsList = util.params(arguments, 1);
    let action = function(name) {
        return applyEachFilters(name, filterParamsList);
    }
    applyToLeafNodes(target, "name", action);
    return target;
}

function eachValues(target) {
    let filterParamsList = util.params(arguments, 1);
    let action = function(values) {
        return applyEachFilters(values, filterParamsList);
    }
    applyToLeafNodes(target, "values", action);
    return target;
}

function applyEachFilters(target, filterParamsList) {
    let result = target;
    for( let x = 0; x < filterParamsList.length; x++) {
        let filterParamsString = filterParamsList[x];
        let filterParams = eval(filterParamsString);
        let filter = filterParams[0];
        let params = util.params(filterParams, 1);
        result = applyFilter(filter, [result].concat(params));
    }
    return result;
}

function applyToLeafNodes(target, key, action) {
    for( let x = 0; x < target.length; x++ ){
        let item = target[x];
        if ( util.notUndefined(item[key]) ) {
            let result = applyToLeafNodes(item[key], key, action);
            if ( util.notUndefined(result)) {
                item[key] = result;
            }
        }  else {
            return action(target);
        }
    }

    return undefined; // parents return undefined;
}

function groupByPropAndSort(target, propMethodParams, sortMethodParamsList) {
    let  result = [];

    let propMethod = eval(propMethodParams);
    if (util.notUndefined(propMethod)) {
        result = applyGroupBy(target, propMethod);
    }

    result = applyEachFilters(result, sortMethodParamsList);
    return result;
}

function groupByProp(target, prop, filter, propFilterParams) {
    let result = common.groupedList();
    target.map( function(item) {
        let propValue = common.valuePath(item, prop);
        if (util.notUndefined(propValue)) {
            propValue = applyFilter(filter, [propValue].concat(propFilterParams) );
            result.push(propValue, item)
        }
    });
    // printGroupedList(groupedList);
    return result.data;
}

function applyGroupBy(target, propMethod) {
    let prop = propMethod[0];
    let propFilter = propMethod[1];
    let propFilterParams = util.params(propMethod, 2);
    return groupByProp(target, prop, propFilter, propFilterParams);
}

function applyFilter(filter, params) {
    let filterAct = getFilter(filter);
    if (util.notUndefined(filterAct)) {
        return filterAct.apply(null, params);
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

// util
function init(config) {
    for(let key in filterMap) {
        if (filterMap[key].name !== init.name) {
            config.addFilter(key, filterMap[key]);
        }
    }

    eleventyConfig = config;
}

function getFilter(filter) {
    return (
    filterMap[filter] ||
    eleventyConfig.getFilter(filter)
    );
}

module.exports = filterMap;
