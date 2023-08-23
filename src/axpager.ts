import {PageConfig} from "./config/page-config";
import {RequestInitOption, RequestOption} from "./config/request-option";
import {PageEvent} from "./config/page-event";
import {XMLHttpRequestAdapter} from "./ajax/adapters/xml-http-request-adapter";

// noinspection JSUnresolvedReference
/**
 * default page init config.
 */
const defaultPageConfig: PageConfig = {
    itemsPerPageLabel: '每页条数',
    firstPageLabel: '第一页',
    previousPageLabel: '上一页',
    nextPageLabel: '下一页',
    lastPageLabel: '最后一页',
    hidePageSize: false,
    showFirstLastButtons: true,
    showPageSizeOptions: true,
    pageSizeOptions: [10, 15, 30],
    ajaxAdapter: new XMLHttpRequestAdapter(),
    getRangeLabel: (page, size, pages, length) => `第${page}/${pages}页，共${length}条`,
    getPageParams: (page, size) => ({page: page, size: size}),
    getPagedResource: response => ({data: response.data, length: response.pager.recordCount}),
    changes: (pageEvent, eventTarget) => void (0),
};
/**
 * default request paging option.
 */
const defaultRequestOption: RequestOption = {
    method: 'GET',
    data: {},
    headers: {},
    timeout: -1,
    before: init => void (0),
    success: (data, pageEvent, requestData) => void (0),
    error: error => void 0,
    finish: () => void (0),
    filter: (item, requestData) => true
}

const icons = {
    fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
    backward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
    forward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
    fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
};

export const createElement = (tagName: string, attributes: { [index: string]: any } = {}): HTMLElement => {
    const e = document.createElement(tagName);
    Object.keys(attributes).forEach(a => {
        e[a] = attributes[a];
    });
    return e;
};

const initDomElements = Symbol('initDomElements');
const updateActionStatus = Symbol('updateActionStatus');
const updateRangeLabel = Symbol('updateRangeLabel');
const updateCurrentPage = Symbol('updateCurrentPage');

/**
 * paginator support ajax request and static array data paging.
 */
export class axpager {
    private container!: HTMLElement;
    private config: PageConfig = {};
    private target: string | any[];
    private readonly actions!: {
        btnLast: HTMLButtonElement;
        btnNext: HTMLButtonElement;
        btnPrev: HTMLButtonElement;
        btnFirst: HTMLButtonElement;
        selectPageSize: HTMLSelectElement;
    };
    private readonly labels!: {
        itemsPerPageLabel: HTMLSpanElement;
        rangeLabel: HTMLSpanElement
    };
    private readonly panels!: {
        actionsPanel: HTMLDivElement;
        pageSizePanel: HTMLDivElement;
    };
    private previousPage: number = 1;
    private currentPage: number = 1;
    private length: number = 0;
    private size: number = 0;
    private option: RequestOption;
    private disabled = false;

    /**
     * paginator.
     * @param container container element
     * @param config config
     */
    constructor(container: HTMLElement, config?: PageConfig) {
        this.container = container;
        this.config = Object.assign({}, defaultPageConfig, config);
        this.size = this.config.pageSizeOptions[0] || 10;
        this.actions = {
            selectPageSize: createElement('SELECT', {
                className: 'axp-select axp-size-options',
                disabled: true
            }) as HTMLSelectElement,
            btnFirst: createElement('BUTTON', {
                type: 'button',
                title: this.config.firstPageLabel,
                innerHTML: `${icons.fastBackward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnPrev: createElement('BUTTON', {
                type: 'button',
                title: this.config.previousPageLabel,
                innerHTML: `${icons.backward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnNext: createElement('BUTTON', {
                type: 'button',
                title: this.config.nextPageLabel,
                innerHTML: `${icons.forward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnLast: createElement('BUTTON', {
                type: 'button',
                title: this.config.lastPageLabel,
                innerHTML: `${icons.fastForward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }) as HTMLButtonElement,
        };

        this.labels = {
            itemsPerPageLabel: createElement('SPAN', {
                className: 'axp-label axp-items-per-page'
            }) as HTMLSpanElement,
            rangeLabel: createElement('SPAN', {className: 'axp-label axp-range'}) as HTMLSpanElement
        };

        this.panels = {
            pageSizePanel: createElement('DIV', {className: 'axp-page-size'}) as HTMLDivElement,
            actionsPanel: createElement('DIV', {className: 'axp-range-actions'}) as HTMLDivElement
        };

        this.panels.actionsPanel.addEventListener('click', e => {
            if (this.disabled) {
                return;
            }
            let target = e.target as HTMLButtonElement;
            if (target == null) return;
            if (target.className === 'axp-btn-touch-target') {
                target = target.parentElement as HTMLButtonElement;
            }
            if (target == null || target.disabled) {
                return;
            }
            const actions = this.actions;
            let matched = true;
            this.previousPage = this.currentPage;
            switch (target) {
                case actions.btnFirst:
                    this.currentPage = 1;
                    break;
                case actions.btnPrev:
                    this.currentPage = this.currentPage > 1 ? this.currentPage - 1 : 1;
                    break;
                case actions.btnNext:
                    const next = this.currentPage + 1;
                    const pageCount = this.pages;
                    this.currentPage = next > pageCount ? pageCount : next;
                    break;
                case actions.btnLast:
                    this.currentPage = this.pages;
                    break;
                default:
                    matched = false;
                    break;
            }
            if (matched) {
                this.config.changes(this.pageEvent, target);
                this.of(this.target, this.option);
            }
        });

        this.actions.selectPageSize.addEventListener('change', e => {
            if (this.disabled) {
                return;
            }
            const select = e.target as HTMLSelectElement;
            if (select.disabled) {
                return;
            }
            this.previousPage = this.currentPage;
            this.size = +select.value || 10;
            const newPages = this.pages;
            if (this.currentPage > newPages) {
                this.currentPage = newPages;
            }
            this.config.changes(this.pageEvent, e.target);
            this.of(this.target, this.option);
        });

        this[initDomElements]();
    }

    /**
     * total pages.
     */
    get pages(): number {
        if (this.length <= 1) {
            return 1;
        }
        const num = this.length / this.size;
        if (num <= 1) {
            return 1;
        }
        const int = Math.floor(num);
        if (int === num) {
            return int;
        }
        return int + 1;
    }

    /**
     * ajax paging request page params.
     */
    get pageParams() {
        return this.config.getPageParams(this.currentPage, this.size);
    }

    /**
     * page event.
     */
    get pageEvent(): PageEvent {
        const end = this.currentPage * this.size;
        return {
            previousPage: this.previousPage,
            page: this.currentPage,
            size: this.size,
            start: (this.currentPage - 1) * this.size,
            end: end > this.length ? this.length : end,
            pages: this.pages,
            length: this.length
        }
    }

    /**
     * init a new paginator instance.
     * @param container container element
     * @param config config
     * @return xpager paginator
     */
    static init(container: HTMLElement, config?: PageConfig): axpager {
        return new axpager(container, config);
    }

    /**
     * ajax request paging.
     * @param url url
     * @param option option
     */
    ajax(url: string, option?: RequestOption) {
        if (this.disabled) {
            return;
        }
        if (!(typeof url === 'string')) {
            throw Error('Request url is required.');
        }
        this.target = url;
        this.option = Object.assign({}, defaultRequestOption, option);
        const initOption: RequestInitOption = {
            method: this.option.method,
            data: this.option.data,
            headers: this.option.headers,
            timeout: this.option.timeout,
            before: this.option.before
        };
        this.config.ajaxAdapter.request(this.target, this.pageParams, initOption)
            .then(response => {
                const {data, length} = this.config.getPagedResource(response);
                this[updateCurrentPage](length);
                const pageEvent = this.pageEvent;
                this.option.success(data, pageEvent, this.option.data);
                this[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
                this[updateRangeLabel]();
            }).catch(this.option.error)
            .finally(this.option.finish);
    }

    /**
     * static array data paging.
     * @param data array
     * @param option option
     */
    resource(data: any[], option?: RequestOption) {
        if (this.disabled) {
            return;
        }
        if (!(data instanceof Array)) {
            throw Error('data must be an Array.');
        }
        this.target = data;
        this.option = Object.assign({}, defaultRequestOption, option);
        this.option.before(null);
        const filteredResource = this.target.filter(item => this.option.filter(item, this.option.data));
        this[updateCurrentPage](filteredResource.length);
        const pageEvent = this.pageEvent;
        const pagedResource = filteredResource.slice(pageEvent.start, pageEvent.end);
        this.option.success(pagedResource, pageEvent, this.option.data);
        this[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
        this[updateRangeLabel]();
        this.option.finish();
    }

    /**
     * request paging.
     * @param target url or static array data
     * @param option option
     */
    of(target: string | any[], option?: RequestOption) {
        if (typeof target === 'string') {
            this.ajax(target, option);
            return;
        }
        if (target instanceof Array) {
            this.resource(target, option);
            return;
        }
        throw Error(target + ' can not be paging.');
    }

    /**
     * refresh current page's data.
     */
    refresh() {
        this.of(this.target, this.option);
    }

    /**
     * disable all actions (select and buttons).
     * @param isDisable is disable all actions
     */
    disable(isDisable: boolean) {
        this.disabled = isDisable;
        if (this.disabled) {
            Object.values(this.actions).forEach(a => a.disabled = true);
            return;
        }
        this[updateActionStatus](this.currentPage, this.pages, this.length);
    }

    /**
     * update current page by length, avoid current page &gt; total pages occurs display empty result.
     * @param length result length
     */
    [updateCurrentPage](length: number) {
        this.length = length;
        const pageCount = this.pages;
        this.currentPage = this.currentPage > pageCount ? pageCount : this.currentPage;
    }

    /**
     * init pager dom elements by config.
     */
    [initDomElements]() {
        this.container.innerHTML = '<div class="ax-pager"></div>';

        this.actions.selectPageSize.innerHTML = this.config.pageSizeOptions.map(num => `<option value="${num}">${num}</option>`).join('');
        this.labels.itemsPerPageLabel.innerHTML = this.config.itemsPerPageLabel + (this.config.showPageSizeOptions ? '' : this.config.pageSizeOptions[0] || 10);

        // page size panel
        [this.labels.itemsPerPageLabel,
            (this.config.showPageSizeOptions ? this.actions.selectPageSize : null)
        ].filter(e => e !== null)
            .forEach(e => this.panels.pageSizePanel.appendChild(e));

        // range actions panel
        [this.labels.rangeLabel,
            (this.config.showFirstLastButtons ? this.actions.btnFirst : null),
            this.actions.btnPrev,
            this.actions.btnNext,
            (this.config.showFirstLastButtons ? this.actions.btnLast : null)
        ].filter(e => e !== null)
            .forEach(e => this.panels.actionsPanel.appendChild(e));

        // container
        [(this.config.hidePageSize ? null : this.panels.pageSizePanel),
            this.panels.actionsPanel
        ].filter(e => e !== null)
            .forEach(e => this.container.firstElementChild.appendChild(e));
    }

    /**
     * update range label text.
     */
    [updateRangeLabel]() {
        this.labels.rangeLabel.innerHTML = this.config.getRangeLabel(this.currentPage, this.size, this.pages, this.length);
    }

    /**
     * update actions status.
     * @param page current page
     * @param pages total pages
     * @param length result length
     */
    [updateActionStatus](page: number, pages: number, length: number) {
        if (this.disabled) {
            return;
        }
        const disableFirstPrev = page <= 1;
        const disableNextLast = pages <= 1 || page === pages;

        const firstPrevClz = `axp-btn${disableFirstPrev ? '' : ' axp-ripple-btn'}`;
        const nextLastClz = `axp-btn${disableNextLast ? '' : ' axp-ripple-btn'}`;

        this.actions.selectPageSize.disabled = length <= 0;

        this.actions.btnFirst.disabled = disableFirstPrev;
        this.actions.btnFirst.className = firstPrevClz;
        this.actions.btnPrev.disabled = disableFirstPrev;
        this.actions.btnPrev.className = firstPrevClz;

        this.actions.btnNext.disabled = disableNextLast;
        this.actions.btnNext.className = nextLastClz;
        this.actions.btnLast.disabled = disableNextLast;
        this.actions.btnLast.className = nextLastClz;
    }
}