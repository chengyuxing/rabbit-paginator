import { PageConfig } from "./config/page-config";
import { axpager, createElement } from "./axpager";
/**
 * init a new paginator instance.
 */
declare const init: (container: HTMLElement, config: PageConfig) => axpager;
export { axpager as Paginator, init, createElement };
export * from "./config/page-event";
export * from "./config/page-config";
export * from "./config/request-option";
