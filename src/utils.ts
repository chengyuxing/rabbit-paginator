/**
 * create html element
 * @param tagName tag name
 * @param attributes attributes
 */
export const createElement = (tagName: string, attributes: { [index: string]: any } = {}): HTMLElement => {
    const e = document.createElement(tagName);
    Object.keys(attributes).forEach(a => {
        e[a] = attributes[a];
    });
    return e;
};

/**
 * parse object to URLSearchParams.
 * @param obj
 */
export const toURLSearchParams = (obj: any): URLSearchParams => {
    const search = new URLSearchParams();
    if (!obj) {
        return search;
    }
    Object.keys(obj).forEach(k => {
        search.set(k, obj[k]);
    });
    return search;
};