---
title: "指纹代替录入 sudo 密码"
date: "2025-02-07T16:09:37.121Z"
---

这篇文章将介绍如何使用 MacBook Pro 上的指纹，代替录入 sudo 密码，密码长度越长效果越好。大概就是下图的效果：


如果密码不太长且使用外接键盘的话，手不离开键盘可能会更方便一些 ;）

原生支持的方法
目前 macOS 已经可以原生支持 TouchID 的验证，只需要修改 /etc/pam.d/sudo 文件，因为该文件权限为只读，所以在修改前需要修改文件权限。
```shell
cd /etc/pam.d
sudo chmod 666 sudo
```

使用 vim 等熟悉的编辑工具对文件进行编辑，在第一排后面追加 auth    sufficient    pam_tid.so，最终文件如下：
```shell

# sudo: auth account password session
auth       sufficient     pam_tid.so  # <- 新增加的一行
auth       sufficient     pam_smartcard.so
auth       required       pam_opendirectory.so
account    required       pam_permit.so
password   required       pam_deny.so
session    required       pam_permit.so

```
后面再使用 sudo 命令的时候，就会弹出录入 TouchID 的弹窗。最后恢复文件的权限
```shell
sudo chmod 444 /etc/pam.d/sudo
```

目前已经原生支持的 PAM（可插拔的认证模块），可以在目录下 /usr/lib/pam 查看。
