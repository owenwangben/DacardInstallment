// https://www.30secondsofcode.org/articles/s/javascript-await-timeout
export class Timeout {
    private static ids = [];

    public static set(delay: number, reason: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const id = setTimeout(() => {
                if (reason === undefined) resolve();
                else reject(reason);
                this.clear(id);
             }, delay);
            this.ids.push(id);
        });
    }

    public static wrap(promise: Promise<any>, delay: number, reason: string): Promise<any> {
        return Promise.race([promise, this.set(delay, reason)]);
    }

    private static clear(...ids): void {
        this.ids = this.ids.filter(id => {
            if (ids.includes(id)) {
                clearTimeout(id);
                return false;
            }
            return true;
        });
    };
}
