/**
 * page event.
 */
export interface PageEvent {
    previousPage: number;
    page: number;
    size: number;
    pages: number;
    start: number;
    end: number;
    length: number;
}