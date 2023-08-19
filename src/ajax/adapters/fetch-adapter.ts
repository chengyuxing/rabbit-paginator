import {ContentType, AjaxAdapter} from "../ajax-adapter";
import {RequestInitOption} from "../../config/request-option";

/**
 * Based on fetch api adapter.
 */
export class FetchAdapter implements AjaxAdapter {
    request(url: string, pageParams: {}, option: RequestInitOption): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const method = (option.method || 'GET').toUpperCase();
            let searchUrl = url;

            const initOption: RequestInit = {
                method: option.method,
                headers: option.headers,
            };

            if (method === 'GET') {
                const req = Object.assign({}, option.data, pageParams);
                const suffix = url.includes('?') ? '&' : '?';
                searchUrl = searchUrl + suffix + new URLSearchParams(req as {});
            } else if (method === 'POST') {
                if (option.data instanceof FormData) {
                    const fd = new FormData();
                    option.data.forEach((v, k) => fd.set(k, v));
                    Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                    initOption.body = fd;
                } else {
                    const contentType = option.headers['Content-Type'] || ContentType.URL_ENCODED;
                    if (contentType === ContentType.FORM_DATA) {
                        const fd = new FormData();
                        Object.keys(option.data).forEach(k => fd.set(k, option.data[k]));
                        Object.keys(pageParams).forEach(k => fd.set(k, pageParams[k]));
                        initOption.body = fd;
                    } else {
                        const req = Object.assign({}, option.data, pageParams);
                        if (contentType === ContentType.URL_ENCODED) {
                            initOption.body = new URLSearchParams(req as {});
                        } else if (contentType === ContentType.JSON) {
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