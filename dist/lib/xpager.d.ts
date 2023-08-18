import { PageConfig } from "./config/page-config";
import { RequestOption } from "./config/request-option";
import { PageEvent } from "./config/page-event";
export declare const createElement: (tagName: string, attributes?: {
    [index: string]: any;
}) => HTMLElement;
declare const initDomElements: unique symbol;
declare const updateActionStatus: unique symbol;
declare const updateRangeLabel: unique symbol;
/**
 * paginator support ajax request and static array data paging.
 * @author chengyuxingo@gmail.com
 */
export declare class xpager {
    private container;
    private config;
    private target;
    private readonly actions;
    private readonly labels;
    private readonly panels;
    private previousPage;
    private currentPage;
    private length;
    private size;
    private option;
    private xhr;
    /**
     * paginator.
     * @param container container element
     * @param config config
     */
    constructor(container: HTMLElement, config?: PageConfig);
    /**
     * total pages count.
     */
    get pages(): number;
    /**
     * ajax paging request page params.
     */
    get pageParams(): {
        page: number;
        size: number;
    };
    /**
     * page event.
     */
    get pageEvent(): PageEvent;
    /**
     * init a new paginator instance.
     * @param container container element
     * @param config config
     * @return xpager paginator
     */
    static init(container: HTMLElement, config?: PageConfig): xpager;
    [initDomElements](): void;
    /**
     * ajax request paging.
     * @param url url
     * @param option option
     */
    ajax(url: String, option?: RequestOption): void;
    /**
     * static array data paging.
     * @param data array
     * @param option option
     */
    resource(data: any[], option?: RequestOption): void;
    /**
     * request paging.
     * @param target url or static array data
     * @param option option
     */
    of(target: String | any[], option?: RequestOption): void;
    /**
     * refresh current page's data.
     */
    refresh(): void;
    [updateRangeLabel](): void;
    [updateActionStatus](page: number, pages: number, length: number): void;
}
export {};
