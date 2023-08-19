# ajax-paginator

A useful paginator support ajax request paging and static array data paging.

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

**Example**

Rewrite function `getPagedResource`  to adapt  **ajax request paging** if  your response data format cannot match `{data: any[], length: number}`:

```javascript
// Bulit-in default implementation.
getPagedResource: response => ({data: response.data, length: response.pager.recordCount})
```

```javascript
const data = new Array(145);
const pager = Paginator.init(document.getElementById('pager'), {
  getPagedResource: // adapt response data
});
// pager.ajax(url, option)
// pager.resource(data, option)
pager.of(url | data, {
    success: (list, event) => {
        // ...
    }
});
```