import { BaseResponse } from "../services/webapi.service";
import Swal from "sweetalert2";

export default class ServiceHelper {
    static get ApplicationName(): string {
        return 'DACARD';
    }
    static get SessionId(): string {
        return localStorage.getItem('ServiceHelper.SessionId');
    }
    static set SessionId(value: string) {
        localStorage.setItem('ServiceHelper.SessionId', value);
    }
    static get ClientIp(): string {
        return localStorage.getItem('ServiceHelper.ClientIp');
    }
    static set ClientIp(value: string) {
        localStorage.setItem('ServiceHelper.ClientIp', value);
    }

    static showError(message: string) {
        // https://sweetalert2.github.io/#dismiss-handle
        Swal.fire({
            text: message, icon: 'error', confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }

	static ifSuccess(response: BaseResponse<any>, showError = true): boolean {
		if (response.ResultCode !== '00') {
			if (showError) {
                this.showError(response.ResultMessage);
			}
			return false;
		}
		return true;
	}
}
