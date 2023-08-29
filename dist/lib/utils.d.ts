/**
 * create html element
 * @param tagName tag name
 * @param attributes attributes
 */
export declare const createElement: (tagName: string, attributes?: {
    [index: string]: any;
}) => HTMLElement;
/**
 * parse object to URLSearchParams.
 * @param obj
 */
export declare const toURLSearchParams: (obj: any) => URLSearchParams;
