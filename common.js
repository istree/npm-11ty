const util = require("@istree/util");

var exports = {
    valuePath : valuePath,
    groupedList : groupedList,
    comparePath : comparePath,
    compareString : compareString
};

function comparePath(path, a, b, compareFunction) {
    return compareFunction(
        valuePath(a, path),
        valuePath(b, path)
    );
}

function compareString(a, b) {
    return ('' + a).localeCompare(b);
}

function valuePath(target, path) {
    var args = path.split('.');
    var abc = args.reduce( function( result, arg) {
        return util.notUndefined(result[arg]) ? result[arg] : undefined;
    }, target);
    return abc;
}

function groupedList() {
    var data = [];

    function isEmpty() {
        return (data.length < 1);
    }

    function push(key, value) {
        get(key).values.push(value);
    }

    function get(key) {
        var item = find(data, key);
        if (util.isUndefined(item)) {
            item = newItem(key);
            data.push(item);
        }
        return item;
    }

    function newItem(key) {
        var item = {};
        item.name = key;
        item.values = [];
        return item;
    }

    function find(data, key) {
        return data.find( item => item.name === key );
    }

    return {
        get: get,
        push: push,
        isEmpty: isEmpty,
        data: data
    }
}

module.exports = exports;