Clone [Mistreevous Visualiser](https://github.com/nikkorn/mistreevous-visualiser) and place the contents in mistreevous-visualiser/src here.

Modify the first line of `src/libs/mistreevous-visualiser/mode-mdsl.js`:
Change:
```javascript
var ace = require('ace-builds/src-noconflict/ace');
```

To:
```javascript
import * as ace from 'ace-builds/src-noconflict/ace';
```