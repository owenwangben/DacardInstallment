import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cardtype'
})
export class CardTypePipe implements PipeTransform {

    transform(value: string): string {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            throw new Error('not supported');
        }

        switch (value) {
            case "M":
                return "assets/images/icon/icon_master.svg";
            case "V":
                return "assets/images/icon/icon_visa.svg";
            case "J":
                return "assets/images/icon/icon_jcb.svg"
            case "A":
                return ""
            default:
                return ""
        }
    }

}
