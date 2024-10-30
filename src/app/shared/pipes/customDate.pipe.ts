import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
    transform(value: string,mark: string = '/'): string {
        const pattern = /(\d{4})(\d{2})(\d{2})/
        const [year, month, day] = value.match(pattern).slice(1)

        return [year, month, day].join(mark)
    }
}
