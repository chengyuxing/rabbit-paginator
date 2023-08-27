import {PageEvent} from "./page-event";
import {AjaxAdapter} from "../ajax/ajax-adapter";

/**
 * paging data format.
 */
export interface PagedData {
    data: any;
    length: number;
}

/**
 * page numbers container element type.
 */
export type PageNumbersType = 'button' | 'select';

/**
 * paginator init config.
 */
export interface PageConfig {
    itemsPerPageLabel?: string;
    hidePageSize?: boolean;
    showPageSizeOptions?: boolean;
    showFirstLastButtons?: boolean;
    initPageNumber?: number;
    initPageSize?: number;
    pageSizeOptions?: number[];
    pageRadius?: number;
    pageNumbersType?: PageNumbersType;
    /**
     * range label content callback.
     * @param page current page
     * @param size page size
     * @param pages total pages
     * @param length total data length
     */
    getRangeLabel?: (page: number, size: number, pages: number, length: number) => string;
    firstPageLabel?: string;
    previousPageLabel?: string;
    nextPageLabel?: string;
    lastPageLabel?: string;
    /**
     * ajax paging adapter.
     * @see XMLHttpRequestAdapter
     * @see FetchAdapter
     */
    ajaxAdapter?: AjaxAdapter;
    /**
     * get necessary ajax request page params.
     */
    getPageParams?: (page: number, size: number) => {};
    /**
     * ajax response paging data adapter.
     * @param response
     */
    getPagedResource?: (response: any) => PagedData;
    /**
     * paging action changes callback.
     * @param pageEvent page event
     * @param eventTarget action target element
     */
    changes?: (pageEvent: PageEvent, eventTarget: EventTarget) => void;
}