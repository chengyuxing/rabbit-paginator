import {PageEvent} from "./page-event";

/**
 * ajax paging method.
 */
export type Method = 'get' | 'post' | 'GET' | 'POST';

/**
 * paging request option.
 */
export interface RequestOption {
    method?: Method,
    data?: {} | FormData,
    headers?: {},
    timeout?: number,
    before?: (xhr: XMLHttpRequest) => void,
    success: (data: any[], pageEvent: PageEvent) => void,
    error?: (error: Error) => void,
    finish?: () => void,
    filter?: (item: any) => boolean
}