---
title: "React event inside map function"
date: "2017-09-04T23:46:37.121Z"
---

在使用React 渲染列表的时候，我们一般的操作如下

```

render(){
  const {array} = this.props
  return (
    <div>
      {
        array.map(item => 
            <p key={item.id}>{item.name}</p>
        )
      }
    </div> 
  )
}

```

如果我们给渲染的item添加事件，代码如下：


```

constructor(props){
  super(props)
  this.onClick = this.onClick.bind(this)
}

onClick(value){
  console.log(value)
}


render(){
  const {array} = this.props
  return (
    <div>
      {
        array.map(item => 
            <p key={item.id} onClick={() => this.onClick(item.id)}>{item.name}</p>
        )
      }
    </div> 
  )
}
```

或者

```

constructor(props){
  super(props)
}

onClick(value){
  console.log(value)
}


render(){
  const {array} = this.props
  return (
    <div>
      {
        array.map(item => 
            <p key={item.id} onClick={this.onClick.bind(this,item.id)}>{item.name}</p>
        )
      }
    </div> 
  )
}
```


我们分析一下：

第一种方式，在onClick的时候使用匿名函数，每次点击都产生一个新的匿名函数，如果array有10000个数据，那么将产生10000个匿名函数。
第二种方式，bind() 会创建一个绑定了作用域的函数实例。于是，内存中存储了几乎一样的函数的一万个拷贝，这是一种巨大的浪费

所以我们在最第一种方式的基础上做一下改造

```

constructor(props){
  super(props)
  this.onClick = this.onClick.bind(this)
}

onClick(event){
  const {id} = event.target
  console.log(id)
}


render(){
  const {array} = this.props
  return (
    <div>
      {
        array.map(item => 
            <p key={item.id} id={item.id} onClick={this.onClick}>{item.name}</p>
        )
      }
    </div> 
  )
}
```

我们在构造方法中bind一次，每一个循环的p 都维护onClick的点击处理事件 this.onClick 根据每一个p上的props id 传递id，这样只产生了一个onClick函数


我们也可以利用ES2017 中的Class properties 


```

onClick = (event) => {
  const {id} = event.target
  console.log(id)
}


render(){
  const {array} = this.props
  return (
    <div>
      {
        array.map(item => 
            <p key={item.id} id={item.id} onClick={this.onClick}>{item.name}</p>
        )
      }
    </div> 
  )
}

```
