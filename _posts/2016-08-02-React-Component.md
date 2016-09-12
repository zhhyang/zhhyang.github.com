---
layout: post
title: "React之组件的三种创建方式"
category: React
tags: 
 - React
---

最近在学习React.js，入门实例教程是学习的阮一峰的博客：[React 入门实例教程](http://www.ruanyifeng.com/blog/2015/03/react.html)

# 下面说的是React 三种创建组建的方式

1. React.createClass({})
    
```

import React from 'react';

var HelloMessage = React.createClass({
  render: function() {
    return <h1>Hello {this.props.name}</h1>;
  }
});

ReactDOM.render(
  <HelloMessage name="John" />,
  document.getElementById('example')
);

```
    
2. Class 方式
    
```
import React, {Component, PropTypes} from 'react';

class HelloMessage extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {name} = this.props;
        return (
            <div>
                {name}
            </div>
        )
    }
};

HelloMessage.propTypes = {
    name:PropTypes.string.isRequired
};

export default HelloMessage;




ReactDOM.render(
  <HelloMessage name="John" />,
  document.getElementById('example')
);

```


3. React 在V0.14版本推出了新的实例创建方式 Stateless functional components

```
// A functional component using an ES2015 (ES6) arrow function:
var Aquarium = (props) => {
  var fish = getFish(props.species);
  return <Tank>{fish}</Tank>;
};

// Or with destructuring and an implicit return, simply:
var Aquarium = ({species}) => (
  <Tank>
    {getFish(species)}
  </Tank>
);

Then use: <Aquarium species="rainbowfish" />

```
    
# 分析
1. Stateless更适合简单显示组件
2. Class 方式更符合ES2015的使用习惯，复杂组件推荐使用此种写法
3. createClass比较古老的书写方式
