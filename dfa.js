var fs = require('fs');
// 创建敏感词库哈希表
var map = {};

/**
 * 创建树节点
 * @param {String，汉字} word 
 * @param {Number, 0:继续  1:结束} flag 
 * @param {Object, 孩子节点集} nodes 
 * @return {Object, 树节点} node
 */
function tNode(word,flag,nodes) {
    var node = {};
    node.word = word || '';
    flag < 0 ? node.flag = 0 : node.flag = 1;
    node.nodes = nodes || {};
    return node;
}

/**
 * 构建树结构，并添加敏感语句
 * @param {String, 敏感语句} sentences 
 */
function addWord(sentences) {
    var len = sentences.length;
    // 英文全部范化成小写
    sentences = sentences.toLowerCase();

    // 初始化根节点
    var rootNode = sentences.charAt(0);
    // 单个词情况
    if(len===1){
        map[rootNode] = tNode(rootNode,1,{});
        return ;
    }

    if(!map[rootNode])
        map[rootNode] = tNode(rootNode,0,{});

    var _map = map[rootNode]; 
    for(var i=1; i<len; i++) {
        var _pre = sentences.charAt(i-1);
        var _cur = sentences.charAt(i);
        // 构建树结构
        var _node = tNode(_cur,i-len+1,{});
        _map.nodes[_cur] = _node;
        _map = _map.nodes[_cur];
    }
}

/**
 * 过滤敏感词，并替换成 *
 * @param {String, 待过滤语句} sentence 
 */
function filter(sentence) {
    var len = sentence.length;
    var _map = map;
    sentence = sentence.toLowerCase().split('');

    for(var i=0; i<len; i++) {
        var w = sentence[i];
        // 判断首词是否在敏感词map中
        if(_map[w]) {
            // 状态转移
            var curMap = _map[w];
            for(var j=i+1; j<len; ) {
                // 下一个词
                var nw = sentence[j];
                if(curMap.nodes[nw]) {
                    // 判断状态是否结束
                    if(curMap.nodes[nw].flag === 1) {
                        for(i;i<=j;i++)
                            sentence[i] = '*';

                        // 从j位置开始重新匹配
                        i = j;
                        break;
                    }else{
                        curMap = curMap.nodes[nw];
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

// 将敏感词库导入并建立树结构
var fs = require("fs");
function bulitSW(filePath) {
    var data = fs.readFileSync(filePath);
    // linux环境下则需改为 .split('\n')
    var datas = data.toString().split('\r\n');
    for(var w=0, len=datas.length; w<len; w++) 
        addWord(datas[w]);
}

bulitSW('./sw.txt');