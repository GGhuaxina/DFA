# DFA
### 敏感词过滤
### e.g.
```js
let ts = new SWF();
// or built your own dataset by ts.builtSWL(filePath) 
ts.builtSWL();   
 
let res = test.filter('fuckFUCK');
console.log(res);   // '********'
```
