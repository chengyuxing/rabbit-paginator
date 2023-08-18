import { xpager, createElement } from "./xpager";
import { PageConfig } from "./types/page-config";
/**
 * init a new paginator instance.
 */
declare const init: (container: HTMLElement, config: PageConfig) => xpager;
export { xpager as paginator, init, createElement };
