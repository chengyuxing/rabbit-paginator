# x-paginator

A useful paginator support ajax request paging and static array data paging.

## Installation

### ES2015 via npm

```shell
npm install axpager
```

### Web via script link

```html

<script src="dist/axpager.umd.js"></script>
```

### Themes

```html

<link rel="stylesheet" href="dist/themes/axpager.theme.light.css">
```

## Usage

### ES2015

```javascript
import {Paginator} from 'axpager';
```

### UMD

```javascript
const {Paginator} = axpager;
```

### Example
```javascript
const data = new Array(145);
const pager = Paginator.init(document.getElementById('pager'));
// pager.ajax()
// pager.resource()
pager.of(data, {
    success: (list, event) => {
        // ...
    }
});
```