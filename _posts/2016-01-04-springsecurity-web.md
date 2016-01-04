---
layout: post
title: "Spring Security 保护Web层"
category: springsecurity
tags: 
 - Spring Security
---


#静态资源不需要权限过滤器验证
    <!-- resources dosen't need security-->
    <security:http pattern="/resources/**" security="none" />
#HTTP安全设置
> 设置auto-config =true时，会配置默认的过滤器
use-expressions="true" 代表启用强大的SPEL表达式，例如：permitAll、hasRole('ROLE_USER')等

    <security:http auto-config="true" use-expressions="true">  
    <!--设置 http https 端口映射 --> 
    <security:port-mappings><security:port-mapping http="8080" https="8443"/> 
    </security:port-mappings>
    <security:intercept-url pattern="/login.jsp*" access="permitAll" requires-channel="https" />
    <security:form-login login-page="/login.jsp" authentication-failure-url="/login.jsp?login_error=true"default-target-url="/index.jsp" />
    <!--requires-channel="any/http/https"  method="GET/POST" -->
    <security:intercept-url pattern="/admin/**" access="hasRole('ROLE_ADMIN')" requires-channel="any" />
    <security:intercept-url pattern="/user/**" access="hasRole('ROLE_USER')" />
    <!--csrf 跨站攻击 -->
    <security:csrf />
    <security:session-management session-fixation-protection="none" invalid-session-url="/timeout.jsp" >
    <!-- 单点登陆，这个会导致前一个登陆失效
    error-if-maximum-exceeded="true"  阻止第二次登陆
    session-fixation-protection="none" 防止伪造sessionid攻击. 用户登录成功后会销毁用户当前的session.-->
    <security:concurrency-control max-sessions="1" error-if-maximum-exceeded="false" />
    </security:session-management>
    <!-- 退出成功后跳转 -->
    <security:logout logout-success-url="/login.jsp" invalidate-session="true" />
    <!--启用remember-me 功能, services-ref = ipTokenBasedRememberMeServices 是为了添加IP地址校验-->
    <security:remember-me services-ref="ipTokenBasedRememberMeServices" />
    <!--没有权限，跳转页面-->
    <security:access-denied-handler ref="accessDeniedHandler"/>
    <security:headers>
    <!--设置是否允许在iframe中生成网页 默认是DENY--> 
    <security:frame-options policy="SAMEORIGIN" />
    </security:headers></security:http>