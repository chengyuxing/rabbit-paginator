import { AjaxAdapter } from "../ajax-adapter";
import { RequestInitOption } from "../../config/request-option";
/**
 * Based on fetch api adapter.
 */
export declare class FetchAdapter implements AjaxAdapter {
    private controller;
    private timeoutId;
    request(url: string, pageParams: {}, option: RequestInitOption): Promise<any>;
}
