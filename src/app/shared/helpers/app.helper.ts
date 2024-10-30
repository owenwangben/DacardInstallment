export default class AppHelper {
    static get Is_App(): boolean {
        return navigator.userAgent.startsWith('sinopac://');
    }

    static get Is_Android(): boolean {
        return this.OsType?.toUpperCase() === 'ANDROID';
    }

    static get Is_iOS(): boolean {
        const OsTypeList = ['IOS', 'IPADOS'];
        return this.OsType && OsTypeList.includes(this.OsType?.toUpperCase());
    }

    static get Is_Web(): boolean {
        return this.OsType?.toUpperCase() == 'WEB';
    }

    static get OsType(): string {
        if (this.Is_App) {
            const url = new URL(navigator.userAgent);
            return url.searchParams.get("osType");
        }
        return 'Web';
    }
}
