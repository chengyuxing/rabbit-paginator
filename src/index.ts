import {xpager, createElement} from "./xpager";
import {PageConfig} from "./types/page-config";

/**
 * init a new paginator instance.
 */
const init: (container: HTMLElement, config: PageConfig) => xpager = xpager.init;

export {
    xpager as paginator,
    init,
    createElement
};