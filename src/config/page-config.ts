import {PageEvent} from "./page-event";

/**
 * paging data format.
 */
export interface PagedData {
    data: any;
    length: number;
}

/**
 * paginator init config.
 */
export interface PageConfig {
    itemsPerPageLabel?: string,
    hidePageSize?: boolean,
    showPageSizeOptions?: boolean,
    showFirstLastButtons?: boolean,
    pageSizeOptions?: number[],
    /**
     * range label content callback.
     * @param page current page
     * @param size page size
     * @param length total data length
     */
    getRangeLabel?: (page: number, size: number, length: number) => string,
    firstPageLabel?: string,
    previousPageLabel?: string,
    nextPageLabel?: string,
    lastPageLabel?: string,
    /**
     * ajax response paging data adapter.
     * @param response
     */
    getPagedResource?: (response: any) => PagedData,
    /**
     * paging action changes callback.
     * @param pageEvent page event
     * @param eventTarget action target element
     */
    changes?: (pageEvent: PageEvent, eventTarget: EventTarget) => void
}