import {RequestInitOption} from "../config/request-option";

export const ContentType = {
    JSON: 'application/json',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    FORM_DATA: 'multipart/form-data'
};

/**
 * ajax paging adapter.
 */
export interface AjaxAdapter {

    /**
     * request method, resolve response and reject exception.
     */
    request(url: string, pageParams: {}, reqOption: RequestInitOption): Promise<any>;
}