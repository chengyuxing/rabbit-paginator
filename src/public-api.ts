import {PageConfig} from "./config/page-config";
import {axpager, createElement} from "./axpager";
import {XMLHttpRequestAdapter} from "./ajax/adapters/xml-http-request-adapter";
import {FetchAdapter} from "./ajax/adapters/fetch-adapter";

/**
 * init a new paginator instance.
 */
const init: (container: HTMLElement, config: PageConfig) => axpager = axpager.init;

export {
    axpager as Paginator,
    init,
    createElement,
    XMLHttpRequestAdapter,
    FetchAdapter
};

export * from "./config/page-event";
export * from "./config/page-config";
export * from "./config/request-option";
export * from "./ajax/ajax-adapter";
