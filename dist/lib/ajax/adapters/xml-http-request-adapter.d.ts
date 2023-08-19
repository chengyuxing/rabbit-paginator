import { AjaxAdapter } from "../ajax-adapter";
import { RequestInitOption } from "../../config/request-option";
/**
 * Base on XMLHttpRequest default implementation.
 */
export declare class XMLHttpRequestAdapter implements AjaxAdapter {
    private xhr;
    request(url: string, pageParams: {}, option: RequestInitOption): Promise<any>;
}
