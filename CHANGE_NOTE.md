# change note

## 1.2.4

- Fixed error when more than one axpager instance doing ajax request at same time.
- **PageConfig#ajaxAdapter** field type change to `Function` .

## 1.2.3

- Improved default ajax Request paging implementation **form-urlencode** compatibility.
- Improved default compatibility for Chrome minimum version >= 49.
- Improved default ajax request paging query params type `FormData` for Chrome minimum version >= 50.

## 1.2.2

- **FetchAdapter** support property RequestInitOption#`timeout`.
- **FetchAdapter** timeout depends on **AbortController**, require Chrome version >= 66.

## 1.2.1

- Fixed bug when PageConfig#initPageNumber < 1.
- Improved paging action to make them more secure.

## 1.2.0

- Fixed page number buttons type default `submit`, changed to `button` .
- Version 1.2.0 released.

## 1.1.3

- Remove unnecessary css class `axp-ripple-btn` .
- Instance method disable(boolean) optimized.

## 1.1.2

- New property: PageConfig#pageRadius.
- New property: PageConfig#pageNumbersType.
- Support show page numbers action element if `PageConfig#pageRadius > 1` .
- Support button and select element of page numbers.
- Update PageEvent#previousPage of actions optimized.
- Update themes.
- Update example.
- Some optimized.

## 1.1.1

- New Property: PageConfig#initPageSize.

## 1.1.0

- New Property: PageConfig#initPageNumber.
- New instance method: goto(page: number).
- Update instance method: disable(true) will be stop actions events, actions dom and paging action.

## 1.0.5

- Container style class `rabbit-pager` change to `ax-pager`.
- New instance method: `disable(isDisable: boolean)`.
- Action `page size options` assert `disabled` attribute.
- Update example.
- Themes optimized.

## 1.0.4

- Fixed empty array occurs pages and page properties value = 0
- Style class prefix mat change to rbt.

## 1.0.3

- Paging result optimized, avoid current page > totals page occurs display empty result.
- Actions click event scope optimized.

## 1.0.2

- Fixed array data paging **RequestOption**#filter not working bug.
- **RequestOption**#filter support next param requestData.
- **RequestOption**#success support next param requestData.

## 1.0.1

- Fixed methods **ajax** and **of** 1st arg `instanceof` cannot match `String` type bug.
- Support `AjaxAdapter` for custom http request paging implementation.
- Fixed `pages` calc not correct if `length` is odd.
- Support overrides custom request page params by **PageConfig**#getPageParams.
- Built-in ajax adapter implementation: `XMLHttpRequestAdapter` `FetchAdapter`
- Fixed `FetchAdapter` cannot catch server error.
- Fixed `XMLHttpRequestAdapter` cannot catch server error.
- Optimized error message when server error.

## 1.0.0

- 1.0.0 released.