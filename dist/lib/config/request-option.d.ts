import { PageEvent } from "./page-event";
/**
 * ajax paging method.
 */
export type Method = 'get' | 'post' | 'GET' | 'POST';
/**
 * paging request init option.
 */
export interface RequestInitOption {
    method?: Method;
    data?: {} | FormData;
    headers?: {};
    timeout?: number;
    before?: (init: XMLHttpRequest | RequestInit | any) => void;
}
/**
 * paging request option.
 */
export interface RequestOption extends RequestInitOption {
    success: (data: any[], pageEvent: PageEvent) => void;
    error?: (error: any) => void;
    finish?: () => void;
    filter?: (item: any) => boolean;
}
