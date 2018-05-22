export module Utils {
    export function isEmpty(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    export function mergeObjects(obj1, obj2) {
        const mergedObj = {};

        for (const key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (obj2[key] !== undefined) {
                    mergedObj[key] = obj2[key];
                } else {
                    mergedObj[key] = obj1[key];
                }
            }
        }

        return mergedObj;
    }
}
