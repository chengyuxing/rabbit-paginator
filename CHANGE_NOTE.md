# change note

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