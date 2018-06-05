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

    export function formatDate(inputDate) {
        if (inputDate === null || inputDate === undefined || inputDate === '') {
            return;
        }
        
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            year = inputDate.getFullYear(),
            month = months[inputDate.getMonth()],
            date = inputDate.getDate(),
            hour = inputDate.getHours(),
            min = inputDate.getMinutes(),
            sec = inputDate.getSeconds();

        return date + ',' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    }
}
