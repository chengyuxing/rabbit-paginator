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
    getRangeLabel: (page: number, size: number, pages: number, length: number) => `第${page}/${pages}页，共${length}条`,
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
    success: (data, pageEvent) => void (0),
    error: error => void 0,
    finish: () => void (0),
    filter: item => true
}

const icons = {
    fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
    backward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
    forward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
    fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
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
                className: 'mat-select mat-size-options',
                disabled: true
            }) as HTMLSelectElement,
            btnFirst: createElement('BUTTON', {
                type: 'button',
                title: this.config.firstPageLabel,
                innerHTML: `${icons.fastBackward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnPrev: createElement('BUTTON', {
                type: 'button',
                title: this.config.previousPageLabel,
                innerHTML: `${icons.backward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnNext: createElement('BUTTON', {
                type: 'button',
                title: this.config.nextPageLabel,
                innerHTML: `${icons.forward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }) as HTMLButtonElement,
            btnLast: createElement('BUTTON', {
                type: 'button',
                title: this.config.lastPageLabel,
                innerHTML: `${icons.fastForward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }) as HTMLButtonElement,
        };

        this.labels = {
            itemsPerPageLabel: createElement('SPAN', {
                className: 'mat-label mat-items-per-page'
            }) as HTMLSpanElement,
            rangeLabel: createElement('SPAN', {className: 'mat-label mat-range'}) as HTMLSpanElement
        };

        this.panels = {
            pageSizePanel: createElement('DIV', {className: 'mat-page-size'}) as HTMLDivElement,
            actionsPanel: createElement('DIV', {className: 'mat-range-actions'}) as HTMLDivElement
        };

        this.container.addEventListener('click', e => {
            let target = e.target as HTMLButtonElement;
            if (target == null) return;
            if (target.className === 'mat-btn-touch-target') {
                target = target.parentElement as HTMLButtonElement;
            }
            if (target.disabled) {
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
            this.previousPage = this.currentPage;
            this.size = +(e.target as HTMLSelectElement).value || 10;
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
     * total pages count.
     */
    get pages(): number {
        const num = this.length / this.size;
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
                this.length = length;
                const pageEvent = this.pageEvent;
                this.option.success(data, pageEvent);
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
        if (!(data instanceof Array)) {
            throw Error('data must be an Array.');
        }
        this.target = data;
        this.option = Object.assign({}, defaultRequestOption, option);
        this.length = this.target.length;
        this.option.before(null);
        const filteredResource = this.target.filter(item => this.option.filter(item));
        const pageEvent = this.pageEvent;
        const pagedResource = filteredResource.slice(pageEvent.start, pageEvent.end);
        this.option.success(pagedResource, pageEvent);
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

    [initDomElements]() {
        this.container.innerHTML = '<div class="rabbit-pager"></div>';

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

    [updateRangeLabel]() {
        this.labels.rangeLabel.innerHTML = this.config.getRangeLabel(this.currentPage, this.size, this.pages, this.length);
    }

    [updateActionStatus](page: number, pages: number, length: number) {
        const a = page === 1;
        const b = pages === 1 || page === pages;

        const ra = `mat-btn${a ? '' : ' mat-ripple-btn'}`;
        const rb = `mat-btn${b ? '' : ' mat-ripple-btn'}`;

        this.actions.selectPageSize.disabled = length === 0;

        this.actions.btnFirst.disabled = a;
        this.actions.btnFirst.className = ra;
        this.actions.btnPrev.disabled = a;
        this.actions.btnPrev.className = ra;

        this.actions.btnNext.disabled = b;
        this.actions.btnNext.className = rb;
        this.actions.btnLast.disabled = b;
        this.actions.btnLast.className = rb;
    }
}