(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.xpager = {}));
})(this, (function (exports) { 'use strict';

    var ContentType = {
        JSON: 'application/json',
        URL_ENCODED: 'application/x-www-form-urlencoded'
    };
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
        pageSizeOptions: [10, 15, 30],
        getRangeLabel: function (page, size, length) { return "\u7B2C".concat(page, "/").concat(Math.floor(length / size + 1), "\u9875\uFF0C\u5171").concat(length, "\u6761"); },
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
        before: function (xhr) { return void (0); },
        success: function (data, pageEvent) { return void (0); },
        error: function (error) { return void 0; },
        finish: function () { return void (0); },
        filter: function (item) { return true; }
    };
    var icons = {
        fastBackward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path></svg>',
        backward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>',
        forward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></svg>',
        fastForward: '<svg viewBox="0 0 24 24" focusable="false" class="mat-icon"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path></svg>',
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
    /**
     * paginator support ajax request and static array data paging.
     * @author chengyuxingo@gmail.com
     */
    var xpager = /** @class */ (function () {
        /**
         * paginator.
         * @param container container element
         * @param config config
         */
        function xpager(container, config) {
            var _this = this;
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
                    innerHTML: "".concat(icons.fastBackward, "<span class=\"mat-btn-touch-target\"></span>"),
                    className: 'mat-btn',
                    disabled: true
                }),
                btnPrev: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.previousPageLabel,
                    innerHTML: "".concat(icons.backward, "<span class=\"mat-btn-touch-target\"></span>"),
                    className: 'mat-btn',
                    disabled: true
                }),
                btnNext: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.nextPageLabel,
                    innerHTML: "".concat(icons.forward, "<span class=\"mat-btn-touch-target\"></span>"),
                    className: 'mat-btn',
                    disabled: true
                }),
                btnLast: createElement('BUTTON', {
                    type: 'button',
                    title: this.config.lastPageLabel,
                    innerHTML: "".concat(icons.fastForward, "<span class=\"mat-btn-touch-target\"></span>"),
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
            this.container.addEventListener('click', function (e) {
                var target = e.target;
                if (target == null)
                    return;
                if (target.className === 'mat-btn-touch-target') {
                    target = target.parentElement;
                }
                if (target.disabled) {
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
                _this.previousPage = _this.currentPage;
                _this.size = +e.target.value || 10;
                var newPages = _this.pages;
                if (_this.currentPage > newPages) {
                    _this.currentPage = newPages;
                }
                _this.config.changes(_this.pageEvent, e.target);
                _this.of(_this.target, _this.option);
            });
            this[initDomElements]();
        }
        Object.defineProperty(xpager.prototype, "pages", {
            /**
             * total pages count.
             */
            get: function () {
                return Math.floor(this.length / this.size) + 1;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(xpager.prototype, "pageParams", {
            /**
             * ajax paging request page params.
             */
            get: function () {
                return {
                    page: this.currentPage,
                    size: this.size
                };
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(xpager.prototype, "pageEvent", {
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
        xpager.init = function (container, config) {
            return new xpager(container, config);
        };
        xpager.prototype[initDomElements] = function () {
            var _this = this;
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
         * ajax request paging.
         * @param url url
         * @param option option
         */
        xpager.prototype.ajax = function (url, option) {
            var _this = this;
            if (!(url instanceof String)) {
                throw Error('Request url is required.');
            }
            var that = this;
            this.target = url;
            this.option = Object.assign({}, defaultRequestOption, option);
            if (!this.xhr) {
                this.xhr = new XMLHttpRequest();
                Object.keys(this.option.headers).forEach(function (k) {
                    _this.xhr.setRequestHeader(k, _this.option.headers[k]);
                });
                this.xhr.responseType = 'json';
                this.xhr.addEventListener('load', function () {
                    if (this.status === 200) {
                        var _a = that.config.getPagedResource(this.response), data = _a.data, length_1 = _a.length;
                        that.length = length_1;
                        var pageEvent = that.pageEvent;
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
            var method = (this.option.method || 'GET').toLowerCase();
            this.option.before(this.xhr);
            if (method === 'get') {
                var req = Object.assign({}, this.option.data, this.pageParams);
                var suffix = this.target.includes('?') ? '&' : '?';
                var searchUrl = this.target + suffix + new URLSearchParams(req);
                this.xhr.open(method, searchUrl, true);
                this.xhr.send();
                return;
            }
            if (method === 'post') {
                this.xhr.open(method, this.target, true);
                if (this.option.data instanceof FormData) {
                    var fd_1 = new FormData();
                    this.option.data.forEach(function (v, k) { return fd_1.set(k, v); });
                    var pageParams_1 = this.pageParams;
                    Object.keys(pageParams_1).forEach(function (k) { return fd_1.set(k, pageParams_1[k]); });
                    this.xhr.send(fd_1);
                    return;
                }
                var req = Object.assign({}, this.option.data, this.pageParams);
                var contentType = this.option.headers['Content-Type'] || ContentType.URL_ENCODED;
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
        };
        /**
         * static array data paging.
         * @param data array
         * @param option option
         */
        xpager.prototype.resource = function (data, option) {
            var _this = this;
            if (!(data instanceof Array)) {
                throw Error('data must be an Array.');
            }
            this.target = data || [];
            this.option = Object.assign({}, defaultRequestOption, option);
            this.length = this.target.length;
            this.option.before(null);
            var filteredResource = this.target.filter(function (item) { return _this.option.filter(item); });
            var pageEvent = this.pageEvent;
            var pagedResource = filteredResource.slice(pageEvent.start, pageEvent.end);
            this.option.success(pagedResource, pageEvent);
            this[updateActionStatus](pageEvent.page, pageEvent.pages, pageEvent.length);
            this[updateRangeLabel]();
            this.option.finish();
        };
        /**
         * request paging.
         * @param target url or static array data
         * @param option option
         */
        xpager.prototype.of = function (target, option) {
            if (target instanceof String) {
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
        xpager.prototype.refresh = function () {
            this.of(this.target, this.option);
        };
        xpager.prototype[updateRangeLabel] = function () {
            this.labels.rangeLabel.innerHTML = this.config.getRangeLabel(this.currentPage, this.size, this.length);
        };
        xpager.prototype[updateActionStatus] = function (page, pages, length) {
            var a = page === 1;
            var b = pages === 1 || page === pages;
            var ra = "mat-btn".concat(a ? '' : ' mat-ripple-btn');
            var rb = "mat-btn".concat(b ? '' : ' mat-ripple-btn');
            this.actions.selectPageSize.disabled = length === 0;
            this.actions.btnFirst.disabled = a;
            this.actions.btnFirst.className = ra;
            this.actions.btnPrev.disabled = a;
            this.actions.btnPrev.className = ra;
            this.actions.btnNext.disabled = b;
            this.actions.btnNext.className = rb;
            this.actions.btnLast.disabled = b;
            this.actions.btnLast.className = rb;
        };
        return xpager;
    }());

    /**
     * init a new paginator instance.
     */
    var init = xpager.init;

    exports.Paginator = xpager;
    exports.createElement = createElement;
    exports.init = init;

}));
