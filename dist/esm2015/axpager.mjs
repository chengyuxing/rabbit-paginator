const ContentType = {
    JSON: 'application/json',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    FORM_DATA: 'multipart/form-data'
};

/**
 * Base on XMLHttpRequest default implementation.
 */
class XMLHttpRequestAdapter {
    request(url, pageParams, option) {
        return new Promise((resolve, reject) => {
            if (this.xhr && this.xhr.readyState !== 4) {
                this.xhr.abort();
            }
            this.xhr = new XMLHttpRequest();
            this.xhr.responseType = 'json';
            Object.keys(option.headers).forEach(k => {
                this.xhr.setRequestHeader(k, option.headers[k]);
            });
            option.before(this.xhr);
            this.xhr.onload = function () {
                if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                    resolve(this.response);
                    return;
                }
                reject(this.status + ': ' + (this.statusText || 'request failed.'));
            };
            if (option.timeout && option.timeout >= 0) {
                this.xhr.timeout = option.timeout;
                this.xhr.ontimeout = function () {
                    reject('408: request timeout, request wait time > ' + this.timeout);
                };
            }
            this.xhr.onerror = function () {
                reject(this.status + ": " + (this.statusText || 'server error.'));
            };
            const method = (option.method || 'GET').toUpperCase();
            if (method === 'GET') {
                const req = Object.assign({}, option.data, pageParams);
                const suffix = url.includes('?') ? '&' : '?';
                const searchUrl = url + suffix + new URLSearchParams(req);
                this.xhr.open(method, searchUrl, true);
                this.xhr.send();
                return;
            }
            if (method === 'POST') {
                this.xhr.open(method, url, true);
                if (option.data instanceof FormData) {
                    const fd = new FormData();
                    option.data.forEach((v, k) => fd.set(k, v));
                    Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                    this.xhr.send(fd);
                    return;
                }
                const contentType = option.headers['Content-Type'] || ContentType.URL_ENCODED;
                if (contentType === ContentType.FORM_DATA) {
                    const fd = new FormData();
                    Object.keys(option.data).forEach(k => fd.set(k, option.data[k]));
                    Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                    this.xhr.send(fd);
                    return;
                }
                const req = Object.assign({}, option.data, pageParams);
                if (contentType === ContentType.URL_ENCODED) {
                    this.xhr.send(new URLSearchParams(req));
                    return;
                }
                if (contentType === ContentType.JSON) {
                    this.xhr.send(JSON.stringify(req));
                    return;
                }
                this.xhr.abort();
                reject('Not support Content-Type: ' + contentType);
            }
            reject('Not support ' + method + ' method.');
        });
    }
}

// noinspection JSUnresolvedReference
/**
 * default page init config.
 */
const defaultPageConfig = {
    itemsPerPageLabel: '每页条数 ',
    firstPageLabel: '第一页',
    previousPageLabel: '上一页',
    nextPageLabel: '下一页',
    lastPageLabel: '最后一页',
    hidePageSize: false,
    showFirstLastButtons: true,
    showPageSizeOptions: true,
    initPageNumber: 1,
    initPageSize: 10,
    pageSizeOptions: [10, 15, 30],
    ajaxAdapter: new XMLHttpRequestAdapter(),
    getRangeLabel: (page, size, pages, length) => `第${page}/${pages}页，共${length}条`,
    getPageParams: (page, size) => ({ page: page, size: size }),
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
    before: init => void (0),
    success: (data, pageEvent, requestData) => void (0),
    error: error => void (0),
    finish: () => void (0),
    filter: (item, requestData) => true
};
const icons = {
    fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
    backward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
    forward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
    fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
};
/**
 * create html element
 * @param tagName tag name
 * @param attributes attributes
 */
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
const updateCurrentPage = Symbol('updateCurrentPage');
/**
 * paginator support ajax request and static array data paging.
 */
class axpager {
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
        this.disabled = false;
        this.container = container;
        this.config = Object.assign({}, defaultPageConfig, config);
        this.currentPage = this.config.initPageNumber || 1;
        this.size = this.config.pageSizeOptions.includes(this.config.initPageSize) ? this.config.initPageSize : (this.config.pageSizeOptions[0] || 10);
        this.actions = {
            selectPageSize: createElement('SELECT', {
                className: 'axp-select axp-size-options',
                disabled: true
            }),
            btnFirst: createElement('BUTTON', {
                type: 'button',
                title: this.config.firstPageLabel,
                innerHTML: `${icons.fastBackward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }),
            btnPrev: createElement('BUTTON', {
                type: 'button',
                title: this.config.previousPageLabel,
                innerHTML: `${icons.backward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }),
            btnNext: createElement('BUTTON', {
                type: 'button',
                title: this.config.nextPageLabel,
                innerHTML: `${icons.forward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }),
            btnLast: createElement('BUTTON', {
                type: 'button',
                title: this.config.lastPageLabel,
                innerHTML: `${icons.fastForward}<span class="axp-btn-touch-target"></span>`,
                className: 'axp-btn',
                disabled: true
            }),
        };
        this.labels = {
            itemsPerPageLabel: createElement('SPAN', {
                className: 'axp-label axp-items-per-page'
            }),
            rangeLabel: createElement('SPAN', { className: 'axp-label axp-range' })
        };
        this.panels = {
            pageSizePanel: createElement('DIV', { className: 'axp-page-size' }),
            actionsPanel: createElement('DIV', { className: 'axp-range-actions' })
        };
        this.panels.actionsPanel.addEventListener('click', e => {
            if (this.disabled) {
                return;
            }
            let target = e.target;
            if (target == null)
                return;
            if (target.className === 'axp-btn-touch-target') {
                target = target.parentElement;
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
            const select = e.target;
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
    get pages() {
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
        return new axpager(container, config);
    }
    /**
     * ajax request paging.
     * @param url url
     * @param option option
     */
    ajax(url, option) {
        if (this.disabled) {
            return;
        }
        if (!(typeof url === 'string')) {
            throw Error('Request url is required.');
        }
        this.target = url;
        this.option = Object.assign({}, defaultRequestOption, option);
        const initOption = {
            method: this.option.method,
            data: this.option.data,
            headers: this.option.headers,
            timeout: this.option.timeout,
            before: this.option.before
        };
        this.config.ajaxAdapter.request(this.target, this.pageParams, initOption)
            .then(response => {
            const { data, length } = this.config.getPagedResource(response);
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
    resource(data, option) {
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
    of(target, option) {
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
     * goto target page number.
     * @param page target page number
     */
    goto(page) {
        if (this.disabled) {
            return;
        }
        if (typeof page !== 'number') {
            throw Error('page must be number.');
        }
        this.previousPage = this.currentPage;
        if (page < 1) {
            this.currentPage = 1;
        }
        else {
            const pageCount = this.pages;
            this.currentPage = page > pageCount ? pageCount : page;
        }
        this.refresh();
    }
    /**
     * disable all actions (select and buttons).
     * @param isDisable is disable all actions
     */
    disable(isDisable) {
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
    [updateCurrentPage](length) {
        this.length = length;
        const pageCount = this.pages;
        this.currentPage = this.currentPage > pageCount ? pageCount : this.currentPage;
    }
    /**
     * init pager dom elements by config.
     */
    [initDomElements]() {
        this.container.innerHTML = '<div class="ax-pager"></div>';
        this.actions.selectPageSize.innerHTML = this.config.pageSizeOptions.map(num => `<option value="${num}" ${this.size === num ? 'selected' : ''}>${num}</option>`).join('');
        this.labels.itemsPerPageLabel.innerHTML = this.config.itemsPerPageLabel + (this.config.showPageSizeOptions ? '' : this.size);
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
    [updateActionStatus](page, pages, length) {
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

/**
 * Based on fetch api adapter.
 */
class FetchAdapter {
    request(url, pageParams, option) {
        return new Promise((resolve, reject) => {
            const method = (option.method || 'GET').toUpperCase();
            let searchUrl = url;
            const initOption = {
                method: option.method,
                headers: option.headers,
            };
            if (method === 'GET') {
                const req = Object.assign({}, option.data, pageParams);
                const suffix = url.includes('?') ? '&' : '?';
                searchUrl = searchUrl + suffix + new URLSearchParams(req);
            }
            else if (method === 'POST') {
                if (option.data instanceof FormData) {
                    const fd = new FormData();
                    option.data.forEach((v, k) => fd.set(k, v));
                    Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                    initOption.body = fd;
                }
                else {
                    const contentType = option.headers['Content-Type'] || ContentType.URL_ENCODED;
                    if (contentType === ContentType.FORM_DATA) {
                        const fd = new FormData();
                        Object.keys(option.data).forEach(k => fd.set(k, option.data[k]));
                        Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                        initOption.body = fd;
                    }
                    else {
                        const req = Object.assign({}, option.data, pageParams);
                        if (contentType === ContentType.URL_ENCODED) {
                            initOption.body = new URLSearchParams(req);
                        }
                        else if (contentType === ContentType.JSON) {
                            initOption.body = JSON.stringify(req);
                        }
                    }
                }
            }
            option.before(initOption);
            fetch(searchUrl, initOption)
                .then(response => {
                if (response.ok) {
                    response.json().then(resolve);
                    return;
                }
                reject(response.status + ': ' + (response.statusText || 'request failed.'));
            }).catch(reject);
        });
    }
}

/**
 * init a new paginator instance.
 */
const init = axpager.init;

export { ContentType, FetchAdapter, axpager as Paginator, XMLHttpRequestAdapter, createElement, init };
//# sourceMappingURL=axpager.mjs.map
