---
title: "package.json 字段全解析"
date: "2015-05-06T23:46:37.121Z"
---

## Name
> 必须字段

小提示：

不要在name中包含js, node字样；

这个名字最终会是URL的一部分，命令行的参数，目录名，所以不能以点号或下划线开头；

这个名字可能在require()方法中被调用，所以应该尽可能短；

## Version
> 必须字段。

## Description
> 可选字段，必须是字符串。npm search的时候会用到。

## Keywords
> 可选字段，字符串数组。npm search的时候会用到。

## Homepage
> 可选字段，没有http://等带协议前缀的URL。

## Bugs
> 可选字段，问题追踪系统的URL或邮箱地址；npm bugs用的上。

{ "url" :"http://github.com/owner/project/issues",

 "email" :"project@hostname.com"

}

## License
> 可选字段。

如果是使用一个普遍的license，比如BSD-3-Clause或MIT，直接使用：

{ "license" : "BSD-3-Clause" }
Author, contributors
都是可选字段。author是一个人，contributors是一组人。

Author的格式如下：

{ "name" : "Barney Rubble",
 "email" : "b@rubble.com",
 "url" : "http://barnyrubble.tumblr.com/"
}
这种格式也可以：

"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)"

## Files
> 可选字段，项目包含的一组文件。如果是文件夹，文件夹下的文件也会被包含。如果需要把某些文件不包含在项目中，添加一个”.npmignore”文件。这个文件和”gitignore”类似。

## Main
> 可选字段。这个字段的值是你程序主入口模块的ID。如果其他用户需要你的包，当用户调用require()方法时，返回的就是这个模块的导出（exports）。

## Bin
> 可选字段。很多的包都会有执行文件需要安装到PATH中去。

这个字段对应的是一个Map，每个元素对应一个{ 命令名：文件名 }。

{ "bin" : { "npm" : "./cli.js" } }
Directories
> 用于指示包的目录结构：

Directories.lib

指示库文件的位置。

Directories.bin

和前面的bin是一样的，但如果前面已经有bin，那么这个就无效。

除了以上两个，还有Directories.doc& Directories.man & Directories.example。

## Repository
> 可选字段。用于指示代码存放的位置。

"repository" :
  { "type" : "git"
  , "url" : "http://github.com/npm/npm.git"
  }
 
"repository" :
  { "type" : "svn"
  , "url" : "http://v8.googlecode.com/svn/trunk/"
  }
## Scripts
> 可选字段，object。Key是生命周期事件名，value是在事件点要跑的命令。参考npm-scripts。

## Config
> 可选字段，object。

Config对象中的值在Scripts的整个周期中皆可用，专门用于给Scripts提供配置参数。

## Dependencies
> 可选字段，指示当前包所依赖的其他包。

{ "dependencies" :
  { "foo" : "1.0.0 - 2.9999.9999"
  , "bar" : ">=1.0.2 <2.1.2"
  , "baz" : ">1.0.2 <=2.3.4"
  , "boo" : "2.0.1"
  , "qux" : "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0"
  , "asd" : "http://asdf.com/asdf.tar.gz"
  , "til" : "~1.2"
  , "elf" : "~1.2.3"
  , "two" : "2.x"
  , "thr" : "3.3.x"
  }
}
版本格式可以是下面任一种：

version 完全匹配

>version 大于这个版本

>=version大于或等于这个版本

<version

<=version

~version 非常接近这个版本

^version 与当前版本兼容

1.2.x X代表任意数字，因此1.2.1, 1.2.3等都可以

http://... Unix系统下使用的tarball的URL。

* 任何版本都可以

""任何版本都可以

version1 - version2  等价于 >=version1 <=version2.

range1 || range2 满足任意一个即可

git... Git地址

user/repo

## devDependencies
> 可选字段。如果只需要下载使用某些模块，而不下载这些模块的测试和文档框架，放在这个下面比较不错。

## peerDependencies
> 可选字段。兼容性依赖。如果你的包是插件，适合这种方式。

## bundledDependencies
> 可选字段。发布包时同时打包的其他依赖。

## optionalDependencies
> 可选字段。如果你想在某些依赖即使没有找到，或则安装失败的情况下，npm都继续执行。那么这些依赖适合放在这里。

## Engines
> 可选字段。既可以指定node版本：

{ "engines" : {"node" : ">=0.10.3 <0.12" } }

也可以指定npm版本：

{ "engines" : {"npm" : "~1.0.20" } }

## engineStrick
> 可选字段，布尔值。如果你肯定你的程序只能在制定的engine上运行，设置为true。

## Os
> 可选字段。指定模块可以在什么操作系统上运行：

"os" : [ "darwin","linux" ]

"os" : [ "!win32" ]

CPU
> 可选字段。指定CPU型号。

"cpu" : [ "x64","ia32" ]

"cpu" : [ "!arm","!mips" ]

## preferGlobal
> 可选字段，布尔值。如果你的包是个命令行应用程序，需要全局安装，就可以设为true。

## Private
> 可选字段，布尔值。如果private为true，npm会拒绝发布。这可以防止私有repositories不小心被发布出去。

## publishConfig
> 可选字段。发布时使用的配置值放这。

默认值
·  "scripts":{"start": "node server.js"}

如果你的包里有server.js文件，npm默认将执行： node server.js.

·  "scripts":{"preinstall":"node-gyp rebuild"}

如果包里有binding.gyp，npm默认在preinstall命令时，使用node-gyp做编译。
