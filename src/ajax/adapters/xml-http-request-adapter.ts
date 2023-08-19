import {ContentType, AjaxAdapter} from "../ajax-adapter";
import {RequestInitOption} from "../../config/request-option";

/**
 * Base on XMLHttpRequest default implementation.
 */
export class XMLHttpRequestAdapter implements AjaxAdapter {
    private xhr: XMLHttpRequest;

    request(url: string, pageParams: {}, option: RequestInitOption): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                reject(this.status + ': request failed, ' + this.statusText);
            };
            if (option.timeout && option.timeout >= 0) {
                this.xhr.timeout = option.timeout;
                this.xhr.ontimeout = function () {
                    reject('408: request timeout, request wait time > ' + this.timeout);
                };
            }
            const method = (option.method || 'GET').toUpperCase();
            if (method === 'GET') {
                const req = Object.assign({}, option.data, pageParams);
                const suffix = url.includes('?') ? '&' : '?';
                const searchUrl = url + suffix + new URLSearchParams(req as {});
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