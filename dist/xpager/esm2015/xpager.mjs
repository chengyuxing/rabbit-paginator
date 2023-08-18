const ContentType = {
    JSON: 'application/json',
    URL_ENCODED: 'application/x-www-form-urlencoded'
};
// noinspection JSUnresolvedReference
/**
 * default page init config.
 */
const defaultPageConfig = {
    itemsPerPageLabel: '每页条数',
    firstPageLabel: '第一页',
    previousPageLabel: '上一页',
    nextPageLabel: '下一页',
    lastPageLabel: '最后一页',
    hidePageSize: false,
    showFirstLastButtons: true,
    showPageSizeOptions: true,
    pageSizeOptions: [10, 15, 30],
    getRangeLabel: (page, size, length) => `第${page}/${Math.floor(length / size + 1)}页，共${length}条`,
    getPagedResource: response => ({ data: response.data, length: response.pager.recordCount }),
    changes: (pageEvent, eventTarget) => void (0),
};
/**
 * default request paging option.
 */
const defaultRequestOption = {
    method: 'GET',
    data: {},
    headers: {},
    timeout: -1,
    before: xhr => void (0),
    success: (data, pageEvent) => void (0),
    error: error => void 0,
    finish: () => void (0),
    filter: item => true
};
const icons = {
    fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
    backward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
    forward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
    fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
};
const createElement = (tagName, attributes = {}) => {
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
 * @author chengyuxingo@gmail.com
 */
class xpager {
    /**
     * paginator.
     * @param container container element
     * @param config config
     */
    constructor(container, config) {
        this.config = {};
        this.previousPage = 1;
        this.currentPage = 1;
        this.length = 0;
        this.size = 0;
        this.container = container;
        this.container.innerHTML = '<div class="rabbit-pager"></div>';
        this.config = Object.assign({}, defaultPageConfig, config);
        this.size = this.config.pageSizeOptions[0] || 10;
        this.actions = {
            selectPageSize: createElement('SELECT', {
                className: 'mat-select mat-size-options',
                disabled: true
            }),
            btnFirst: createElement('BUTTON', {
                type: 'button',
                title: this.config.firstPageLabel,
                innerHTML: `${icons.fastBackward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }),
            btnPrev: createElement('BUTTON', {
                type: 'button',
                title: this.config.previousPageLabel,
                innerHTML: `${icons.backward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }),
            btnNext: createElement('BUTTON', {
                type: 'button',
                title: this.config.nextPageLabel,
                innerHTML: `${icons.forward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }),
            btnLast: createElement('BUTTON', {
                type: 'button',
                title: this.config.lastPageLabel,
                innerHTML: `${icons.fastForward}<span class="mat-btn-touch-target"></span>`,
                className: 'mat-btn',
                disabled: true
            }),
        };
        this.labels = {
            itemsPerPageLabel: createElement('SPAN', {
                className: 'mat-label mat-items-per-page'
            }),
            rangeLabel: createElement('SPAN', { className: 'mat-label mat-range' })
        };
        this.panels = {
            pageSizePanel: createElement('DIV', { className: 'mat-page-size' }),
            actionsPanel: createElement('DIV', { className: 'mat-range-actions' })
        };
        this.container.addEventListener('click', e => {
            let target = e.target;
            if (target == null)
                return;
            if (target.className === 'mat-btn-touch-target') {
                target = target.parentElement;
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
            this.size = +e.target.value || 10;
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
    get pages() {
        return Math.floor(this.length / this.size) + 1;
    }
    /**
     * ajax paging request page params.
     */
    get pageParams() {
        return {
            page: this.currentPage,
            size: this.size
        };
    }
    /**
     * page event.
     */
    get pageEvent() {
        const end = this.currentPage * this.size;
        return {
            previousPage: this.previousPage,
            page: this.currentPage,
            size: this.size,
            start: (this.currentPage - 1) * this.size,
            end: end > this.length ? this.length : end,
            pages: this.pages,
            length: this.length
        };
    }
    /**
     * init a new paginator instance.
     * @param container container element
     * @param config config
     * @return xpager paginator
     */
    static init(container, config) {
        return new xpager(container, config);
    }
    [initDomElements]() {
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
     * ajax request paging.
     * @param url url
     * @param option option
     */
    ajax(url, option) {
        if (!(url instanceof String)) {
            throw Error('Request url is required.');
        }
        const that = this;
        this.target = url;
        this.option = Object.assign({}, defaultRequestOption, option);
        if (!this.xhr) {
            this.xhr = new XMLHttpRequest();
            Object.keys(this.option.headers).forEach(k => {
                this.xhr.setRequestHeader(k, this.option.headers[k]);
            });
            this.xhr.responseType = 'json';
            this.xhr.addEventListener('load', function () {
                if (this.status === 200) {
                    const { data, length } = that.config.getPagedResource(this.response);
                    that.length = length;
                    const pageEvent = that.pageEvent;
                    that.option.success(data, pageEvent);
                    that[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
                    that[updateRangeLabel]();
                    return;
                }
                that.option.error(new Error(this.status + ': request failed, ' + this.statusText));
            });
            if (this.option.timeout && this.option.timeout >= 0) {
                this.xhr.timeout = this.option.timeout;
                this.xhr.addEventListener('timeout', function () {
                    that.option.error(new Error('408: request timeout, request wait time > ' + this.timeout));
                });
            }
            this.xhr.addEventListener('error', function () {
                that.option.error(new Error('500: request error, ' + this.statusText));
            });
            this.xhr.addEventListener('loadend', function () {
                that.option.finish();
            });
        }
        if (this.xhr.readyState !== 4) {
            this.xhr.abort();
        }
        const method = (this.option.method || 'GET').toLowerCase();
        this.option.before(this.xhr);
        if (method === 'get') {
            const req = Object.assign({}, this.option.data, this.pageParams);
            const suffix = this.target.includes('?') ? '&' : '?';
            const searchUrl = this.target + suffix + new URLSearchParams(req);
            this.xhr.open(method, searchUrl, true);
            this.xhr.send();
            return;
        }
        if (method === 'post') {
            this.xhr.open(method, this.target, true);
            if (this.option.data instanceof FormData) {
                const fd = new FormData();
                this.option.data.forEach((v, k) => fd.set(k, v));
                const pageParams = this.pageParams;
                Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                this.xhr.send(fd);
                return;
            }
            const req = Object.assign({}, this.option.data, this.pageParams);
            const contentType = this.option.headers['Content-Type'] || ContentType.URL_ENCODED;
            if (contentType === ContentType.URL_ENCODED) {
                this.xhr.send(new URLSearchParams(req).toString());
                return;
            }
            if (contentType === ContentType.JSON) {
                this.xhr.send(JSON.stringify(req));
                return;
            }
            throw Error('Not support Content-Type: ' + contentType);
        }
        throw Error('Not support ' + method + ' method.');
    }
    /**
     * static array data paging.
     * @param data array
     * @param option option
     */
    resource(data, option) {
        if (!(data instanceof Array)) {
            throw Error('data must be an Array.');
        }
        this.target = data || [];
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
    of(target, option) {
        if (target instanceof String) {
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
    [updateRangeLabel]() {
        this.labels.rangeLabel.innerHTML = this.config.getRangeLabel(this.currentPage, this.size, this.length);
    }
    ;
    [updateActionStatus](page, pages, length) {
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
    ;
}

/**
 * init a new paginator instance.
 */
const init = xpager.init;

export { createElement, init, xpager as paginator };
//# sourceMappingURL=xpager.mjs.map
