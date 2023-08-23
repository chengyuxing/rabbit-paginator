(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.axpager = {}));
})(this, (function (exports) { 'use strict';

    var ContentType = {
        JSON: 'application/json',
        URL_ENCODED: 'application/x-www-form-urlencoded',
        FORM_DATA: 'multipart/form-data'
    };

    /**
     * Base on XMLHttpRequest default implementation.
     */
    var XMLHttpRequestAdapter = /** @class */ (function () {
        function XMLHttpRequestAdapter() {
        }
        XMLHttpRequestAdapter.prototype.request = function (url, pageParams, option) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (_this.xhr && _this.xhr.readyState !== 4) {
                    _this.xhr.abort();
                }
                _this.xhr = new XMLHttpRequest();
                _this.xhr.responseType = 'json';
                Object.keys(option.headers).forEach(function (k) {
                    _this.xhr.setRequestHeader(k, option.headers[k]);
                });
                option.before(_this.xhr);
                _this.xhr.onload = function () {
                    if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                        resolve(this.response);
                        return;
                    }
                    reject(this.status + ': ' + (this.statusText || 'request failed.'));
                };
                if (option.timeout && option.timeout >= 0) {
                    _this.xhr.timeout = option.timeout;
                    _this.xhr.ontimeout = function () {
                        reject('408: request timeout, request wait time > ' + this.timeout);
                    };
                }
                _this.xhr.onerror = function () {
                    reject(this.status + ": " + (this.statusText || 'server error.'));
                };
                var method = (option.method || 'GET').toUpperCase();
                if (method === 'GET') {
                    var req = Object.assign({}, option.data, pageParams);
                    var suffix = url.includes('?') ? '&' : '?';
                    var searchUrl = url + suffix + new URLSearchParams(req);
                    _this.xhr.open(method, searchUrl, true);
                    _this.xhr.send();
                    return;
                }
                if (method === 'POST') {
                    _this.xhr.open(method, url, true);
                    if (option.data instanceof FormData) {
                        var fd_1 = new FormData();
                        option.data.forEach(function (v, k) { return fd_1.set(k, v); });
                        Object.keys(pageParams).forEach(function (k) { return fd_1.set(k, pageParams[k]); });
                        _this.xhr.send(fd_1);
                        return;
                    }
                    var contentType = option.headers['Content-Type'] || ContentType.URL_ENCODED;
                    if (contentType === ContentType.FORM_DATA) {
                        var fd_2 = new FormData();
                        Object.keys(option.data).forEach(function (k) { return fd_2.set(k, option.data[k]); });
                        Object.keys(pageParams).forEach(function (k) { return fd_2.set(k, pageParams[k]); });
                        _this.xhr.send(fd_2);
                        return;
                    }
                    var req = Object.assign({}, option.data, pageParams);
                    if (contentType === ContentType.URL_ENCODED) {
                        _this.xhr.send(new URLSearchParams(req));
                        return;
                    }
                    if (contentType === ContentType.JSON) {
                        _this.xhr.send(JSON.stringify(req));
                        return;
                    }
                    _this.xhr.abort();
                    reject('Not support Content-Type: ' + contentType);
                }
                reject('Not support ' + method + ' method.');
            });
        };
        return XMLHttpRequestAdapter;
    }());

    // noinspection JSUnresolvedReference
    /**
     * default page init config.
     */
    var defaultPageConfig = {
        itemsPerPageLabel: '每页条数',
        firstPageLabel: '第一页',
        previousPageLabel: '上一页',
        nextPageLabel: '下一页',
        lastPageLabel: '最后一页',
        hidePageSize: false,
        showFirstLastButtons: true,
        showPageSizeOptions: true,
        initPageNumber: 1,
        pageSizeOptions: [10, 15, 30],
        ajaxAdapter: new XMLHttpRequestAdapter(),
        getRangeLabel: function (page, size, pages, length) { return "\u7B2C".concat(page, "/").concat(pages, "\u9875\uFF0C\u5171").concat(length, "\u6761"); },
        getPageParams: function (page, size) { return ({ page: page, size: size }); },
        getPagedResource: function (response) { return ({ data: response.data, length: response.pager.recordCount }); },
        changes: function (pageEvent, eventTarget) { return void (0); },
    };
    /**
     * default request paging option.
     */
    var defaultRequestOption = {
        method: 'GET',
        data: {},
        headers: {},
        timeout: -1,
        before: function (init) { return void (0); },
        success: function (data, pageEvent, requestData) { return void (0); },
        error: function (error) { return void (0); },
        finish: function () { return void (0); },
        filter: function (item, requestData) { return true; }
    };
    var icons = {
        fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
        backward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
        forward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
        fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="axp-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
    };
    var createElement = function (tagName, attributes) {
        if (attributes === void 0) { attributes = {}; }
        var e = document.createElement(tagName);
        Object.keys(attributes).forEach(function (a) {
            e[a] = attributes[a];
        });
        return e;
    };
    var initDomElements = Symbol('initDomElements');
    var updateActionStatus = Symbol('updateActionStatus');
    var updateRangeLabel = Symbol('updateRangeLabel');
    var updateCurrentPage = Symbol('updateCurrentPage');
    /**
     * paginator support ajax request and static array data paging.
     */
    var axpager = /** @class */ (function () {
        /**
         * paginator.
         * @param container container element
         * @param config config
         */
        function axpager(container, config) {
            var _this = this;
            this.config = {};
            this.previousPage = 1;
            this.currentPage = 1;
            this.length = 0;
            this.size = 0;
            this.disabled = false;
            this.container = container;
            this.config = Object.assign({}, defaultPageConfig, config);
            this.currentPage = this.config.initPageNumber || 1;
            this.size = this.config.pageSizeOptions[0] || 10;
            this.actions = {
                selectPageSize: createElement('SELECT', {
                    className: 'axp-select axp-size-options',
                    disabled: true
                }),
                btnFirst: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.firstPageLabel,
                    innerHTML: "".concat(icons.fastBackward, "<span class=\"axp-btn-touch-target\"></span>"),
                    className: 'axp-btn',
                    disabled: true
                }),
                btnPrev: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.previousPageLabel,
                    innerHTML: "".concat(icons.backward, "<span class=\"axp-btn-touch-target\"></span>"),
                    className: 'axp-btn',
                    disabled: true
                }),
                btnNext: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.nextPageLabel,
                    innerHTML: "".concat(icons.forward, "<span class=\"axp-btn-touch-target\"></span>"),
                    className: 'axp-btn',
                    disabled: true
                }),
                btnLast: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.lastPageLabel,
                    innerHTML: "".concat(icons.fastForward, "<span class=\"axp-btn-touch-target\"></span>"),
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
            this.panels.actionsPanel.addEventListener('click', function (e) {
                if (_this.disabled) {
                    return;
                }
                var target = e.target;
                if (target == null)
                    return;
                if (target.className === 'axp-btn-touch-target') {
                    target = target.parentElement;
                }
                if (target == null || target.disabled) {
                    return;
                }
                var actions = _this.actions;
                var matched = true;
                _this.previousPage = _this.currentPage;
                switch (target) {
                    case actions.btnFirst:
                        _this.currentPage = 1;
                        break;
                    case actions.btnPrev:
                        _this.currentPage = _this.currentPage > 1 ? _this.currentPage - 1 : 1;
                        break;
                    case actions.btnNext:
                        var next = _this.currentPage + 1;
                        var pageCount = _this.pages;
                        _this.currentPage = next > pageCount ? pageCount : next;
                        break;
                    case actions.btnLast:
                        _this.currentPage = _this.pages;
                        break;
                    default:
                        matched = false;
                        break;
                }
                if (matched) {
                    _this.config.changes(_this.pageEvent, target);
                    _this.of(_this.target, _this.option);
                }
            });
            this.actions.selectPageSize.addEventListener('change', function (e) {
                if (_this.disabled) {
                    return;
                }
                var select = e.target;
                if (select.disabled) {
                    return;
                }
                _this.previousPage = _this.currentPage;
                _this.size = +select.value || 10;
                var newPages = _this.pages;
                if (_this.currentPage > newPages) {
                    _this.currentPage = newPages;
                }
                _this.config.changes(_this.pageEvent, e.target);
                _this.of(_this.target, _this.option);
            });
            this[initDomElements]();
        }
        Object.defineProperty(axpager.prototype, "pages", {
            /**
             * total pages.
             */
            get: function () {
                if (this.length <= 1) {
                    return 1;
                }
                var num = this.length / this.size;
                if (num <= 1) {
                    return 1;
                }
                var int = Math.floor(num);
                if (int === num) {
                    return int;
                }
                return int + 1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(axpager.prototype, "pageParams", {
            /**
             * ajax paging request page params.
             */
            get: function () {
                return this.config.getPageParams(this.currentPage, this.size);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(axpager.prototype, "pageEvent", {
            /**
             * page event.
             */
            get: function () {
                var end = this.currentPage * this.size;
                return {
                    previousPage: this.previousPage,
                    page: this.currentPage,
                    size: this.size,
                    start: (this.currentPage - 1) * this.size,
                    end: end > this.length ? this.length : end,
                    pages: this.pages,
                    length: this.length
                };
            },
            enumerable: false,
            configurable: true
        });
        /**
         * init a new paginator instance.
         * @param container container element
         * @param config config
         * @return xpager paginator
         */
        axpager.init = function (container, config) {
            return new axpager(container, config);
        };
        /**
         * ajax request paging.
         * @param url url
         * @param option option
         */
        axpager.prototype.ajax = function (url, option) {
            var _this = this;
            if (this.disabled) {
                return;
            }
            if (!(typeof url === 'string')) {
                throw Error('Request url is required.');
            }
            this.target = url;
            this.option = Object.assign({}, defaultRequestOption, option);
            var initOption = {
                method: this.option.method,
                data: this.option.data,
                headers: this.option.headers,
                timeout: this.option.timeout,
                before: this.option.before
            };
            this.config.ajaxAdapter.request(this.target, this.pageParams, initOption)
                .then(function (response) {
                var _a = _this.config.getPagedResource(response), data = _a.data, length = _a.length;
                _this[updateCurrentPage](length);
                var pageEvent = _this.pageEvent;
                _this.option.success(data, pageEvent, _this.option.data);
                _this[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
                _this[updateRangeLabel]();
            }).catch(this.option.error)
                .finally(this.option.finish);
        };
        /**
         * static array data paging.
         * @param data array
         * @param option option
         */
        axpager.prototype.resource = function (data, option) {
            var _this = this;
            if (this.disabled) {
                return;
            }
            if (!(data instanceof Array)) {
                throw Error('data must be an Array.');
            }
            this.target = data;
            this.option = Object.assign({}, defaultRequestOption, option);
            this.option.before(null);
            var filteredResource = this.target.filter(function (item) { return _this.option.filter(item, _this.option.data); });
            this[updateCurrentPage](filteredResource.length);
            var pageEvent = this.pageEvent;
            var pagedResource = filteredResource.slice(pageEvent.start, pageEvent.end);
            this.option.success(pagedResource, pageEvent, this.option.data);
            this[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
            this[updateRangeLabel]();
            this.option.finish();
        };
        /**
         * request paging.
         * @param target url or static array data
         * @param option option
         */
        axpager.prototype.of = function (target, option) {
            if (typeof target === 'string') {
                this.ajax(target, option);
                return;
            }
            if (target instanceof Array) {
                this.resource(target, option);
                return;
            }
            throw Error(target + ' can not be paging.');
        };
        /**
         * refresh current page's data.
         */
        axpager.prototype.refresh = function () {
            this.of(this.target, this.option);
        };
        /**
         * goto target page number.
         * @param page target page number
         */
        axpager.prototype.goto = function (page) {
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
                var pageCount = this.pages;
                this.currentPage = page > pageCount ? pageCount : page;
            }
            this.refresh();
        };
        /**
         * disable all actions (select and buttons).
         * @param isDisable is disable all actions
         */
        axpager.prototype.disable = function (isDisable) {
            this.disabled = isDisable;
            if (this.disabled) {
                Object.values(this.actions).forEach(function (a) { return a.disabled = true; });
                return;
            }
            this[updateActionStatus](this.currentPage, this.pages, this.length);
        };
        /**
         * update current page by length, avoid current page &gt; total pages occurs display empty result.
         * @param length result length
         */
        axpager.prototype[updateCurrentPage] = function (length) {
            this.length = length;
            var pageCount = this.pages;
            this.currentPage = this.currentPage > pageCount ? pageCount : this.currentPage;
        };
        /**
         * init pager dom elements by config.
         */
        axpager.prototype[initDomElements] = function () {
            var _this = this;
            this.container.innerHTML = '<div class="ax-pager"></div>';
            this.actions.selectPageSize.innerHTML = this.config.pageSizeOptions.map(function (num) { return "<option value=\"".concat(num, "\">").concat(num, "</option>"); }).join('');
            this.labels.itemsPerPageLabel.innerHTML = this.config.itemsPerPageLabel + (this.config.showPageSizeOptions ? '' : this.config.pageSizeOptions[0] || 10);
            // page size panel
            [this.labels.itemsPerPageLabel,
                (this.config.showPageSizeOptions ? this.actions.selectPageSize : null)
            ].filter(function (e) { return e !== null; })
                .forEach(function (e) { return _this.panels.pageSizePanel.appendChild(e); });
            // range actions panel
            [this.labels.rangeLabel,
                (this.config.showFirstLastButtons ? this.actions.btnFirst : null),
                this.actions.btnPrev,
                this.actions.btnNext,
                (this.config.showFirstLastButtons ? this.actions.btnLast : null)
            ].filter(function (e) { return e !== null; })
                .forEach(function (e) { return _this.panels.actionsPanel.appendChild(e); });
            // container
            [(this.config.hidePageSize ? null : this.panels.pageSizePanel),
                this.panels.actionsPanel
            ].filter(function (e) { return e !== null; })
                .forEach(function (e) { return _this.container.firstElementChild.appendChild(e); });
        };
        /**
         * update range label text.
         */
        axpager.prototype[updateRangeLabel] = function () {
            this.labels.rangeLabel.innerHTML = this.config.getRangeLabel(this.currentPage, this.size, this.pages, this.length);
        };
        /**
         * update actions status.
         * @param page current page
         * @param pages total pages
         * @param length result length
         */
        axpager.prototype[updateActionStatus] = function (page, pages, length) {
            if (this.disabled) {
                return;
            }
            var disableFirstPrev = page <= 1;
            var disableNextLast = pages <= 1 || page === pages;
            var firstPrevClz = "axp-btn".concat(disableFirstPrev ? '' : ' axp-ripple-btn');
            var nextLastClz = "axp-btn".concat(disableNextLast ? '' : ' axp-ripple-btn');
            this.actions.selectPageSize.disabled = length <= 0;
            this.actions.btnFirst.disabled = disableFirstPrev;
            this.actions.btnFirst.className = firstPrevClz;
            this.actions.btnPrev.disabled = disableFirstPrev;
            this.actions.btnPrev.className = firstPrevClz;
            this.actions.btnNext.disabled = disableNextLast;
            this.actions.btnNext.className = nextLastClz;
            this.actions.btnLast.disabled = disableNextLast;
            this.actions.btnLast.className = nextLastClz;
        };
        return axpager;
    }());

    /**
     * Based on fetch api adapter.
     */
    var FetchAdapter = /** @class */ (function () {
        function FetchAdapter() {
        }
        FetchAdapter.prototype.request = function (url, pageParams, option) {
            return new Promise(function (resolve, reject) {
                var method = (option.method || 'GET').toUpperCase();
                var searchUrl = url;
                var initOption = {
                    method: option.method,
                    headers: option.headers,
                };
                if (method === 'GET') {
                    var req = Object.assign({}, option.data, pageParams);
                    var suffix = url.includes('?') ? '&' : '?';
                    searchUrl = searchUrl + suffix + new URLSearchParams(req);
                }
                else if (method === 'POST') {
                    if (option.data instanceof FormData) {
                        var fd_1 = new FormData();
                        option.data.forEach(function (v, k) { return fd_1.set(k, v); });
                        Object.keys(pageParams).forEach(function (k) { return fd_1.set(k, pageParams[k]); });
                        initOption.body = fd_1;
                    }
                    else {
                        var contentType = option.headers['Content-Type'] || ContentType.URL_ENCODED;
                        if (contentType === ContentType.FORM_DATA) {
                            var fd_2 = new FormData();
                            Object.keys(option.data).forEach(function (k) { return fd_2.set(k, option.data[k]); });
                            Object.keys(pageParams).forEach(function (k) { return fd_2.set(k, pageParams[k]); });
                            initOption.body = fd_2;
                        }
                        else {
                            var req = Object.assign({}, option.data, pageParams);
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
                    .then(function (response) {
                    if (response.ok) {
                        response.json().then(resolve);
                        return;
                    }
                    reject(response.status + ': ' + (response.statusText || 'request failed.'));
                }).catch(reject);
            });
        };
        return FetchAdapter;
    }());

    /**
     * init a new paginator instance.
     */
    var init = axpager.init;

    exports.ContentType = ContentType;
    exports.FetchAdapter = FetchAdapter;
    exports.Paginator = axpager;
    exports.XMLHttpRequestAdapter = XMLHttpRequestAdapter;
    exports.createElement = createElement;
    exports.init = init;

}));
