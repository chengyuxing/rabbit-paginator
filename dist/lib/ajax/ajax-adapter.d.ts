import { RequestInitOption } from "../config/request-option";
export declare const ContentType: {
    JSON: string;
    URL_ENCODED: string;
    FORM_DATA: string;
};
/**
 * ajax request adapter.
 */
export interface AjaxAdapter {
    /**
     * request method, resolve response and reject exception.
     */
    request(url: string, pageParams: {}, reqOption: RequestInitOption): Promise<any>;
}
