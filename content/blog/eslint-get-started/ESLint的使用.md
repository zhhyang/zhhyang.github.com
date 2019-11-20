---
title: "ESLint的使用"
date: "2015-05-06T23:46:37.121Z"
---


> ESLint是一个语法规则和代码风格的检查工具，可以用来保证写出语法正确、风格统一的代码。

首先，安装ESLint

    $ npm i -g eslint

然后，安装Airbnb语法规则。

    $ npm i -g eslint-config-airbnb

最后，在项目的根目录下新建一个.eslintrc文件，配置ESLint。

    {
      "extends": "eslint-config-airbnb"
    }

现在就可以检查，当前项目的代码是否符合预设的规则。

index.js文件的代码如下。

    
    var unusued = 'I have no purpose!';
    
    function greet() {
        var message = 'Hello, World!';
        alert(message);
    }
    
    greet();
    
    
使用ESLint检查这个文件。

    $ eslint index.js
    index.js
      1:5  error  unusued is defined but never used                 no-unused-vars
      4:5  error  Expected indentation of 2 characters but found 4  indent
      5:5  error  Expected indentation of 2 characters but found 4  indent
    
    ✖ 3 problems (3 errors, 0 warnings)
    
    
上面代码说明，原文件有三个错误，一个是定义了变量，却没有使用，另外两个是行首缩进为4个空格，而不是规定的2个空格。
