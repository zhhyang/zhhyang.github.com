---
layout: post
title: "React服务端渲染如何读取登录状态"
category: React
tags: 
 - React
 - SSR 
 - Auth
---

在使用React构建应用的过程中，如何判断当前的登录状态，是每个应用都要遇到的问题，而Client端渲染，常用的JWT模式，对于token的保存，一般都是保存在localStorage中，而在服务端渲染中，是没有localStorage的定义的

```javascript
 typeof localStorage === 'undefined' // true

```
既然我们无法从localStorage中获取数据，那么我们只能从Cookie中获取


```javascript
    //after login 
    cookie.save('token', token)
```


在服务端渲染的express应用中，我们要引入 [cookie-parser模块](https://github.com/expressjs/cookie-parser)

```javascript
const express = require('express')
const cookieParser = require('cookie-parser') ;
const serverRender = require('./server.js')

const app = express()

app.use(cookieParser())

//other codes  

app.get('*', function (req, res, next) {
    serverRender.default(req, res);
})
app.listen(port, function(err) {
    if (err) {
        console.error(err)
    } else {
        console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
    }
})
```



```jsx harmony
import React from 'react'
import { renderToString } from 'react-dom/server'
import { RouterContext, match, createMemoryHistory } from 'react-router'
import configureStore from '../store/configureStore'
import routes from '../routes'

export default function render (req, res) {
  const token = req.cookies['token'] // get token from req.cookies
  let initStore = {}
  if (token && isExp(token)) { // token 存在并且是有效未超时的
    initStore = {user: {token: token}}
  }
  const history = createMemoryHistory()
  const store = configureStore(initStore, history)

  match({routes: routes(store), location: req.url}, (error, redirectLocation, renderProps) => {
    // other codes 
  })

}
```


上述代码中关键的部分就是express应用中使用cookie-parse模块把cookie放到req.cookies中，在请求中再从req.cookies中获取token，
这时候校验token是否有效。有效则把token存放到初始的store中

下一步则是在路由中添加登录验证钩子


```jsx harmony

import React from 'react'
import { Route, IndexRoute } from 'react-router'
import { redirectToLogin, redirectToBack,isExp } from './utils/userUtils'
import { isClient } from './utils'
import App from './containers/App'
import Login from './views/login'
import Index from './views/Index'
import NotFound from './components/NotFound'
import Mine from './views/Mine'

export default (store) => {

  const serverRequireAuth = (nextState, replace) => {

    const {user: {token}} = store.getState()
    if (!token || !isExp(token)) {
      replace('/login')
    }
  }

  const serverRedirectAuth = (nextState, replace) => {
    const {user: {token}} = store.getState()
    if (token && isExp(token)) {
      replace('/')
    }
  }
  //客户端渲染和服务端渲染的校验方式可能会不同
  const requireAuth = isClient() ? redirectToLogin : serverRequireAuth
  const redirectAuth = isClient() ? redirectToBack : serverRedirectAuth

  return (
    <Route path="/" component={App}>
      <IndexRoute component={Index}/>
      <Route path="/login" component={Login} onEnter={redirectAuth}/>
      <Route path="mine" component={Mine} onEnter={requireAuth}/>
      <Route path="*" component={NotFound}/>
    </Route>
  )
}

```
客户端判断登录状态的函数

```js
import jwtDecode from 'jwt-decode'
import moment from 'moment'
import { getCookie, setCookie, removeCookie} from './authService'

const getInfoFromToken = (token) => {
  return jwtDecode(token)
}

function checkTokenExpDiff (token) {
  let tokenPayload = getInfoFromToken(token)
  let expiry = moment.unix(tokenPayload.exp)
  return expiry.diff(moment(), 'seconds')
}
/**
 * 是否登录
 * token 存在，并且有效期 > 0秒
 * @returns {boolean} 已经登录返回true，否则返回false
 */
const isLogin = function () {
  const apiToken = getCookie('token')
  return apiToken && isExp(apiToken)
}
/**
 *
 * @param apiToken
 * @return {boolean} token有效返回true，否则返回false
 */
const isExp = function (apiToken) {
  return checkTokenExpDiff(apiToken) > 0
}


const redirectToBack = (nextState, replace) => {
  //已经登录则不进入
  if (isLogin()) {
    replace('/')
  }
}
const redirectToLogin = (nextState, replace) => {
  if (!isLogin()) {
    replace('/login')
  }
}

export {
  redirectToLogin,
  redirectToBack,
}

```