import {PageConfig} from "./config/page-config";
import {axpager, createElement} from "./axpager";

/**
 * init a new paginator instance.
 */
const init: (container: HTMLElement, config: PageConfig) => axpager = axpager.init;

export {
    axpager as Paginator,
    init,
    createElement
};

export * from "./config/page-event";
export * from "./config/page-config";
export * from "./config/request-option";

