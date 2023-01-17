const util = require("@istree/util");

let common = {
    valuePath,
    groupedList,
    comparePath,
    compareString
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
    let args = path.split('.');
    let abc = args.reduce( function( result, arg) {
        return util.notUndefined(result[arg]) ? result[arg] : undefined;
    }, target);
    return abc;
}

function groupedList() {
    let data = [];

    function isEmpty() {
        return (data.length < 1);
    }

    function push(key, value) {
        get(key).values.push(value);
    }

    function get(key) {
        let item = find(data, key);
        if (util.isUndefined(item)) {
            item = newItem(key);
            data.push(item);
        }
        return item;
    }

    function newItem(key) {
        let item = {};
        item.name = key;
        item.values = [];
        return item;
    }

    function find(data, key) {
        return data.find( item => item.name === key );
    }

    return {
        get,
        push,
        isEmpty,
        data
    }
}

module.exports = common;