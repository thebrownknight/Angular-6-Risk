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

    export function formatDate(inputDate, withTime = false) {
        if (inputDate === null || inputDate === undefined || inputDate === '') {
            return;
        }

        const months = ['January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            year = inputDate.getFullYear(),
            month = months[inputDate.getMonth()],
            date = inputDate.getDate(),
            hour = inputDate.getHours(),
            min = inputDate.getMinutes(),
            sec = inputDate.getSeconds();

        let formattedDate = month + ', ' + date + ' ' + year;
        if (withTime) {
            formattedDate += ' ' + hour + ':' + min;
        }

        return formattedDate;
    }

    export function deepCopy<T>(o: T): T {
        return JSON.parse(JSON.stringify(o));
    }
}
