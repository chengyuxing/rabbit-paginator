# ajax-paginator

A useful paginator supports ajax request and static array data paging.

## Installation

**ES2015 via npm**

```shell
npm install axpager
```

**Web via script link**

```html
<script src="dist/axpager.umd.js"></script>
```

**Themes**

```html
<link rel="stylesheet" href="dist/themes/axpager.theme.light.css">
```

## Usage

**ES2015**

```javascript
import {Paginator} from 'axpager';
```

**UMD**

```javascript
const {Paginator} = axpager;
```

### **Example**

Rewrite function `PageConfig#getPagedResource`  to adapt  **ajax request paging** if  your response data format cannot match `{data: any[], length: number}` :

```javascript
// Bulit-in default implementation.
getPagedResource: response => ({data: response.data, length: response.pager.recordCount})
```

```javascript
const paginator = Paginator.init(document.getElementById('pager'), {
  getPagedResource: // adapt response data for ajax
});
// paginator.ajax(url, requestOption)
// paginator.resource(array, requestOption)
paginator.of(url | array, {
    success: (list, event, req) => {
        // ...
    }
});
```

**Ajax request paging**

```javascript
const paginator = Paginator.init(document.getElementById('pager'));
paginator.of('http://localhost:8080/users', {
  data:{
    username: 'jack'
  },
  before: init => {
    // send cookie to server
    // default xhr: init.withCredentials = true;
    // fetch api: init.credentials = 'include'
  },
  success: (list, event, req) => {
    // GET: actually request url: 'http://localhost:8080/users?page=1&size=10&username=jack'
  },
  error: err => {
    
  }
});
```

**Array data paging**

```javascript
const paginator = Paginator.init(document.getElementById('pager'));
paginator.of([1,2,3,4,5,6,7,8,9], {
  data: {
    num: 5
  },
  success: (list, event, req) => {
    // list: [5]
    // req: {num: 5}
  },
  filter: (item, req) => {
    // item: each num of array.
    // req: {num: 5}
    return item === req.num;
  }
});
```

Above examples both are default [PageConfig](#PageConfig) and [RequestOption](#RequestOption). 

Get into `dist/example/index.html` demo preview.

## Constructor

**Paginator**(container: HTMLElement, config?: [PageConfig](#PageConfig))

**Static method**: **init**(container: HTMLElement, config?: [PageConfig](#PageConfig))

### Instance properties

- **pages** `readonly`

  Total pages.

- **pageParams** `readonly`

  Ajax paging request page params.

- **pageEvent** `readonly`

  Paging event data.

### Instance methods

- **ajax**(url: string, option?: [RequestOption](#RequestOption))

  Ajax request paging.

- **resource**(data: any[], option?: [RequestOption](#RequestOption))

  Static array data paging.

- **of**(target: string | any[], option?: [RequestOption](#RequestOption))

  Request paging, **ajax** or **resource** will be called depends on target type.

- **refresh**()

  Refresh current page's data.
  
- **disable**(isDisable: boolean)

  If true disable all actions (select, buttons, actions events and paging action).
  
- **goto**(page: number)

  Goto target page number.

## Configuration

### PageConfig

#### Properties 

- **itemsPerPageLabel** `optional`

  Items per page lebel text, default `每页条数` .

- **hidePageSize** `optional`

  Hide page size panel( items per page babel and page size options), default `false` .

- **showPageSizeOptions** `optional`

  Show page size options, default `true` .

- **showFirstLastButtons** `optional`

  Show first and last button, default `true` .

- **initPageNumber** `optional`

  Instance init page number, default `1` .

- **initPageSize** `optional`

- Instance init page size, default `pageSizeOptions[0]` or `10` . 

- **pageSizeOptions** `optional`

  Page size options, default `[10, 15, 30]` .

- **pageRadius** `optional`

  Half of page numbers length, default `0` .

  ```typescript
  // current page: 5
  // 2
  [3, 4, 5, 6]
  // 3
  [2, 3, 4, 5, 6, 7]
  ```

- **pageNumbersType** `optional`

  Page numbers element type, default `button` , support `select` , working when `pageRadius > 1` .

  ```typescript
  // pageRadius: 2
  
  // select example:
  // |< < [ ] > >|
  //      [3]
  //      [4]
  //      [5]
  //      [6]
  
  // button example:
  // |< < (3) (4) (5) (6) > >|
  ```

- **firstPageLabel** `optional`

  First page button title text, default `第一页` .

- **previousPageLabel** `optional`

  Previous page button title text, default `上一页` .

- **nextPageLabel** `optional`

  Next page button title text, default `下一页` .

- **lastPageLabel** `optional`

  Last page button title text, default `最后一页` .

#### Methods

- **ajaxAdapter** `optional` `ajax`

  Ajax request adapter, custom ajax request implementation, default:

  ```typescript
  () => new XMLHttpRequestAdapter()
  ```

- **getRangeLabel** `optional`

  Get range label text, default:

  ```typescript
  (page: number, size: number, pages: number, length: number) => `第${page}/${pages}页，共${length}条`
  ```

- **getPageParams** `optional` `ajax`

  Get necessary ajax request page params, default:

  ```typescript
  (page: number, size: number) => ({page: page, size: size})
  ```

- **getPagedResource** `optional` `ajax`

  Get custom paged resource format from ajax request response, default:

  ```typescript
  (response: any) => ({data: response.data, length: response.pager.recordCount})
  ```

- **changes** `optional`

  Before paging action request changes callback, default:

  ```typescript
  (pageEvent, eventTarget) => void (0)
  ```

### RequestOption

#### Properties

- **method** `optional` `ajax` `init`

  AJAX request method, default `GET`, support `POST` .

- **data** `optional` `init`

  Request params such as query parameters from form, default `{}`, support `{}` and `FormData`, data will be parsed:

  - **GET**: `{}` -> `form-urlencode`

  - **POST**: 

    `{}` -> `form-urlencode` (default)

    `{}` -> `json` (`Content-Type` : `application/json`)

    `{}` -> `FormData` (`Content-Type` : `multipart/form-data`)

    `FormData` -> `FormData`

- **headers** `optional` `ajax` `init`

  Http headers.

- **timeout** `optional` `ajax` `init`

  Ajax request timeout, default `-1` .

#### Methods

- **before** `optional` `init`

  Before request paging callback, default:

  ```typescript
  (init: XMLHttpRequest | RequestInit | any) => void (0)
  ```

- **success**

  Paging request success callback, default:

  ```typescript
  (data: any[], pageEvent: PageEvent, requestData: {} | FormData | any) => void(0)
  ```

- **error** `optional` `ajax`

  Paging request error callback, default:

  ```typescript
  (error: any) => void(0)
  ```

- **finish** `optional`

  Paging request finished callback, default:

  ```typescript
  () => void(0)
  ```

- **filter** `optional` `resource`

  Static array data paging filter, such as `Array#filter` , default:

  ```typescript
  (item: any, requestData: {} | FormData | any) => true
  ```

### AjaxAdapter

Basic ajax request adapter, built-in:

- **XMLHttpRequestAdapter** ` default`

  Base on XMLHttpRequest default implementation.

- **FetchAdapter**

  Based on fetch api adapter.

#### AjaxAdapter

##### Methods 

- **request**

  ```typescript
  (url: string, pageParams: {}, reqOption: RequestInitOption): Promise<any>
  ```

  Request method, **resolve** response and **reject** exception.

##### Example

```typescript
class MyAdapter implements AjaxAdapter {
	request(url: string, pageParams: {}, reqOption: RequestInitOption): Promise<any> {
      return new Promise((resolve, reject) => {
        fetch(url, option)
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
```