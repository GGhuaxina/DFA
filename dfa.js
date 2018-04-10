const fs = require('fs');

// create sw hash
let map = {};

class SWF {
    constructor () {}
    /**
     * create tree node
     * @param {String，sensitive words} word 
     * @param {Number, if flag===1, done} flag 
     * @param {Object, childs} nodes 
     * @return {Object, TNode} node
    */
    createTNode (word, flag, nodes) {
        let node = {};
        node.word = word || '';
        flag < 0 ? node.flag = 0 : node.flag = 1;
        node.nodes = nodes || {};
        return node;
    }

    /**
     * add sw in the tree
     * @param {String, sensitive words} sentences 
    */
    addWord (sentences) {
        if(!sentences) return;
        const len = sentences.length;
        sentences = sentences.toLowerCase();
    
        // init rootNode
        const rootNode = sentences.charAt(0);
       
        // just one word
        if(len===1){
            map[rootNode] = this.createTNode(rootNode,1,{});
            return ;
        }
    
        if(!map[rootNode])
            map[rootNode] = this.createTNode(rootNode,0,{});
    
        let _map = map[rootNode]; 

        for(let i=1; i<len; i++) {
            let _pre = sentences.charAt(i-1),
                _cur = sentences.charAt(i),
                _node = this.createTNode(_cur,i-len+1,{});

            _map.nodes[_cur] = _node;
            _map = _map.nodes[_cur];
        }
    }
    builtSWL (filePath) {
        // if users would't built their own libs 
        filePath === void 0 ? filePath = './sw.txt' : 1==1;

        const dataBuf = fs.readFileSync(filePath);

        // Buffer convert to Array , if linux, please use next line 
        // const datas = data.toString().split('\n');
        const datas = dataBuf.toString().split('\r\n');

        datas.forEach((val)=>{
            this.addWord(val);
        });
    }
   
    /**
     * filter and replace it by "*" 
     * @param {String, your sentence} sentence
     * if return -1, mean input error 
    */
    filter (sentence) {
        if(!sentence) return -1;
        const len = sentence.length;
        const m = map;

        // [a-zA-Z] convert to [a-z]
        sentence = sentence.toLowerCase().split('');
    
        for(let i=0; i<len; i++) {
            let w = sentence[i];
            if(m[w]) {
                // state transition
                let curState = m[w];
                for(let j=i+1; j<=len; ) {
                    // next word
                    let nw = sentence[j];
                    
                    //only one word
                    if (curState.nodes === {}){
                        sentence[i] = '*';
                    }
                    
                    if(curState.nodes[nw]) {
                        // if it matches a sensitive word
                        if(curState.nodes[nw].flag === 1) {
                            // replace
                            for(i;i<=j;i++)
                                sentence[i] = '*';
                            // continue to judge until i equals len
                            i = j;
                            break;
                        }else{
                            curState = curState.nodes[nw];
                            j++;
                        }
                    }else {
                        break;
                    }
                }
            }
        }
        return sentence.join('');
    }

}

// example
// let test = new SWF();
// test.builtSWL();
// let res = test.filter('fuck');
// console.log(res);


// test 
/**
 * there are 1065 words and 972 words can be reconized    accuary: 91.27%
 * filter one word use 1ms
 * if a sentence  contains 5654 words , it will use 3ms
 * filter 1065 sentences use 6ms
 */
// let data = fs.readFileSync('./sw.txt').toString().split('\r\n'),
//     str = '';

// for(let i=0, len=data.length; i<len; i++) 
//     str += data[i];

// let test = new SWF();
// test.builtSWL();
// // let counter = 0;
// let start = Date.now();
// // data.forEach((val)=>{
// //     let res = test.filter(val);
// //     if(res[0]!=='*')
// //         counter++;
// // });
// // console.log('all: ',data.length,'| err: ', counter, '| acc: ',(data.length-counter)/data.length);
// let res = test.filter(str);
// let end = Date.now();
// console.log('it spend: ',end-start,'ms');




