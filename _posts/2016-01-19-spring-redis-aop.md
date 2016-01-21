---
layout: post
title: "通过Spring中AOP思想，将缓存的方法切入到有需要进入缓存的类或方法前面"
category: SpringRedis
tags: 
 - Spring Redis
---


> 本文介绍了通过Spring中AOP的思想，将缓存的方法切入到有需要进入缓存的类或方法前面.


前文已将redis与spring-data-redis集成，但是有个问题，每次去redis取值都需要我们手动操作，先根据key判断redis中是否存在，存在则从redis中取值，否则，从数据库中取值，再放到redis中。那么有没有别的办法可以替代上述操作呢，肯定有，我们下面来使用AOP的思想来解决这个问题

# AOP #
> AOP实现不属于本文所要讲解的内容，请参考其他文章

# 使用案例 #

## 启用切面的注解RedisCached ##

    package com.github.freeman.redis.annotation;
    
    import java.lang.annotation.*;
    import java.util.concurrent.TimeUnit;
    
    /**
     * Created by Freeman on 2016/1/18.
     */
    
    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    @Documented
    public @interface RedisCached {
	    /**
	     * redis pre key
	     * @return
	     */
	    String preKey() default "id_";
	    /**
	     * 过期时间
	     * @return
	     */
	    long timeout() default 3600L;
	    /**
	     * 时间单位，默认为秒
	     * @return
	     */
	    TimeUnit timeunit() default TimeUnit.SECONDS;
    }

## 切面实现AutoRedisCached ##

    
    package com.github.freeman.redis.aop;
    
    import com.github.freeman.redis.annotation.RedisCached;
    import com.github.freeman.redis.dao.RedisDao;
    import org.aspectj.lang.ProceedingJoinPoint;
    import org.aspectj.lang.annotation.Around;
    import org.aspectj.lang.annotation.Aspect;
    import org.aspectj.lang.annotation.Pointcut;
    import org.aspectj.lang.reflect.MethodSignature;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.core.Ordered;
    import org.springframework.core.annotation.AnnotationUtils;
    import org.springframework.stereotype.Component;
    
    import java.lang.reflect.Method;
    
    /**
     * Created by Freeman on 2016/1/18.
     */
    @Aspect
    @Component
    public class AutoRedisCached implements Ordered{
    
	    private static final Logger LOGGER = LoggerFactory.getLogger(AutoRedisCached.class);
	    @Autowired
	    private RedisDao<Object> redisDao;
	    
	    @Override
	    public int getOrder() {
	    	return -1;
	    }
	    
	    @Pointcut("@annotation(com.github.freeman.redis.annotation.RedisCached)")
	    private void aspect(){
	    	LOGGER.info("配置切入点!");
	    }
	    
	    @Around("aspect()")
	    public Object arround(ProceedingJoinPoint pjp) throws Throwable{
	    
		    Long id = (Long) pjp.getArgs()[0];
		    
		    MethodSignature methodSignature = (MethodSignature) pjp.getSignature();
		    Method method = methodSignature.getMethod();
		    RedisCached cacheinfo = AnnotationUtils.findAnnotation(method, RedisCached.class);
		    String key = cacheinfo.preKey()+id;
		    Object value= null;
		    try {
			    //如果缓存中存在，从缓存中读取并返回
			    if (redisDao.hasKey(key)){
			    	return redisDao.get(key);
		    	}
		    //如果不存在，直接在数据库中读取，并放在redis中
		    value = pjp.proceed();
		    if(null != value){
		    	redisDao.set(key,value,cacheinfo.timeout());
		    }
		    } catch (Exception e) {
			    if (value == null) {
			    	return pjp.proceed();
			    }
		    }
		    return value;
	    }
    }

## 启动对@AspectJ注解的支持 ##
> 到此为止，AutoRedisCached仅仅是位于Spring容器中的一个bean，即使它被AspectJ注解修饰，如果没有别的配置解释这个注解，并创建能够将它转换成切面的代理，则它不会被当做切面使用。
如果你使用JavaConfig，则可以通过类级别的@EnableAspectJAutoProxy注解开启自动代理机制.
如果你使用XML配置，则可以使用<aop: aspectj-autoproxy />元素开启AspectJ的自动代理机制

> proxy-target-class="true"，因为我们是在接口的实现方法上面加的注解，所以要想在AutoRedisCached的arround方法中获取RedisCached注解的preKey的值，必须设置为true。

> proxy-target-class属性值决定是基于接口的还是基于类的代理被创建。如果proxy-target-class 属性值被设置为true，那么基于类的代理将起作用（这时需要cglib库）。如果proxy-target-class属值被设置为false或者这个属性被省略，那么标准的JDK 基于接口的代理

	<!-- 启动对@AspectJ注解的支持 -->
    <aop:aspectj-autoproxy  proxy-target-class="true" />

## 启用@RedisCached注解的service方法 ##

    
    package com.github.freeman.biz.user.service;
    
    import com.github.freeman.biz.user.domain.User;
    import com.github.freeman.redis.service.base.BaseRedisService;
    
    /**
     * Created by Freeman on 2016/1/16.
     */
    public interface UserService{
    
    	User findOne(Long id);
    }


## 启用@RedisCached注解的service方法实现类 ##

    package com.github.freeman.biz.user.service.impl;
    
    import com.github.freeman.biz.user.domain.User;
    import com.github.freeman.biz.user.service.UserService;
    import com.github.freeman.redis.annotation.RedisCached;
    import com.github.freeman.redis.service.base.BaseRedisServiceImpl;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;
    
    import javax.annotation.Resource;
    
    /**
     * Created by Freeman on 2016/1/16.
     */
    @Service
    @Transactional
    public class UserServiceImpl implements UserService {
    
	    @RedisCached(preKey = "id_")
	    public User findOne(Long id) {
		    User user = new User();
		    user.setId(id);
		    user.setName("aa");
		    return user;
	    }
    }

## User类 ##

    package com.github.freeman.biz.user.domain;
    
    import java.io.Serializable;
    
    /**
     * Created by Freeman on 2016/1/13.
     */
    public class User implements Serializable{
    
	    private static final long serialVersionUID = 801763902717812130L;
	    
	    private Long id;
	    private String name;
	    
	    public User(){
	    
	    }
	    public User(Long id,String name) {
		    this.id = id;
		    this.name = name;
	    }
	    
	    public Long getId() {
	    	return id;
	    }
	    public void setId(Long id) {
	    	this.id = id;
	    }
	    
	    public String getName() {
	    	return name;
	    }
	    
	    public void setName(String name) {
	    	this.name = name;
	    }
    }



# 单元测试 #
    

    package com.github.freeman;
    import com.github.freeman.biz.user.domain.User;
    import com.github.freeman.biz.user.service.UserService;
    import org.junit.Assert;
    import org.junit.Test;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.test.context.ContextConfiguration;
    import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
    
    import javax.annotation.Resource;
    
    /**
     * Unit test for simple App.
     */
    @ContextConfiguration(locations = {
	    "classpath*:/spring/spring-*.xml",
	    "classpath*:spring-*.xml",
    })
    public class AppTest extends AbstractJUnit4SpringContextTests {
    
	    @Resource
	    private UserService userService;

	    @Test
	    public void testFindOne(){
		    User user = userService.findOne(1L);
		    Assert.assertEquals("aa",user.getName());
	    }
    }
