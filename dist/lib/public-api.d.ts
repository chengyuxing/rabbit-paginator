import { PageConfig } from "./config/page-config";
import { xpager, createElement } from "./xpager";
/**
 * init a new paginator instance.
 */
declare const init: (container: HTMLElement, config: PageConfig) => xpager;
export { xpager as Paginator, init, createElement };
export * from "./config/page-event";
export * from "./config/page-config";
export * from "./config/request-option";
