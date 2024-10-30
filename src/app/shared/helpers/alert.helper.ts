import Swal from "sweetalert2";
import { AppWrapper } from "./app.wrapper";

export default class AlertHelper {

    static showErrorAndExitWebView(errMsg: string) {
        const app = new AppWrapper();
        Swal.fire({
            text: errMsg, icon: 'error', confirmButtonText: '確定',
            allowOutsideClick: false,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        }).then(type => {
            if (type.isConfirmed) {
                app.exitWeb();
            }
        });
    }
}
