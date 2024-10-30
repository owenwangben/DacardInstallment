export default class dataTranslateHelper {
    static dataTranslate(data) {
        let newData = data;
        if (typeof data !== 'object') {
            newData = JSON.parse(data);
        }
        return newData;
    }
}
