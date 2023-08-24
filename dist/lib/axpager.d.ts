import { PageConfig } from "./config/page-config";
import { RequestOption } from "./config/request-option";
import { PageEvent } from "./config/page-event";
/**
 * create html element
 * @param tagName tag name
 * @param attributes attributes
 */
export declare const createElement: (tagName: string, attributes?: {
    [index: string]: any;
}) => HTMLElement;
declare const initDomElements: unique symbol;
declare const updateActionStatus: unique symbol;
declare const updateRangeLabel: unique symbol;
declare const updateCurrentPage: unique symbol;
/**
 * paginator support ajax request and static array data paging.
 */
export declare class axpager {
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
    private disabled;
    /**
     * paginator.
     * @param container container element
     * @param config config
     */
    constructor(container: HTMLElement, config?: PageConfig);
    /**
     * total pages.
     */
    get pages(): number;
    /**
     * ajax paging request page params.
     */
    get pageParams(): {};
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
    static init(container: HTMLElement, config?: PageConfig): axpager;
    /**
     * ajax request paging.
     * @param url url
     * @param option option
     */
    ajax(url: string, option?: RequestOption): void;
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
    of(target: string | any[], option?: RequestOption): void;
    /**
     * refresh current page's data.
     */
    refresh(): void;
    /**
     * goto target page number.
     * @param page target page number
     */
    goto(page: number): void;
    /**
     * disable all actions (select and buttons).
     * @param isDisable is disable all actions
     */
    disable(isDisable: boolean): void;
    /**
     * update current page by length, avoid current page &gt; total pages occurs display empty result.
     * @param length result length
     */
    [updateCurrentPage](length: number): void;
    /**
     * init pager dom elements by config.
     */
    [initDomElements](): void;
    /**
     * update range label text.
     */
    [updateRangeLabel](): void;
    /**
     * update actions status.
     * @param page current page
     * @param pages total pages
     * @param length result length
     */
    [updateActionStatus](page: number, pages: number, length: number): void;
}
export {};
