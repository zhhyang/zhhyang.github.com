---
layout: post
title: "Redis整合Spring-data-redis使用缓存实例"
category: SpringRedis
tags: 
 - Spring Redis
---


> 本文介绍了如何在Spring中配置redis，下篇文章将通过Spring中AOP的思想，将缓存的方法切入到有需要进入缓存的类或方法前面

# Redis介绍 #

## 什么是Redis？ ##
redis是一个key-value存储系统。和Memcached类似，它支持存储的value类型相对更多，包括string(字符串)、list(链表)、set(集合)、zset(sorted set --有序集合)和hash（哈希类型）。这些数据类型都支持push/pop、add/remove及取交集并集和差集及更丰富的操作，而且这些操作都是原子性的。在此基础上，redis支持各种不同方式的排序。与memcached一样，为了保证效率，数据都是缓存在内存中。区别的是redis会周期性的把更新的数据写入磁盘或者把修改操作写入追加的记录文件，并且在此基础上实现了master-slave(主从)同步。

## 它有什么特点？ ##
1. Redis数据库完全在内存中，使用磁盘仅用于持久性。
2. 相比许多键值数据存储，Redis拥有一套较为丰富的数据类型。
3. Redis可以将数据复制到任意数量的从服务器。


## Redis 优势？ ##
1. 异常快速：Redis的速度非常快，每秒能执行约11万集合，每秒约81000+条记录。
2. 支持丰富的数据类型：Redis支持最大多数开发人员已经知道像列表，集合，有序集合，散列数据类型。这使得它非常容易解决各种各样的问题，因为我们知道哪些问题是可以处理通过它的数据类型更好。
3. 操作都是原子性：所有Redis操作是原子的，这保证了如果两个客户端同时访问的Redis服务器将获得更新后的值。
4. 多功能实用工具：Redis是一个多实用的工具，可以在多个用例如缓存，消息，队列使用(Redis原生支持发布/订阅)，任何短暂的数据，应用程序，如Web应用程序会话，网页命中计数等。


## Redis 缺点？ ##
1. 单线程
2. 耗内存


# 使用实例 #

## 引入jar包 ##

    <!-- spring data redis begin -->
    <dependency>
	    <groupId>org.springframework.data</groupId>
	    <artifactId>spring-data-redis</artifactId>
	    <version>1.5.2.RELEASE</version>
    </dependency>
    <!-- spring data redis end -->
	<!-- jedis begin -->
	<dependency>
        <groupId>redis.clients</groupId>
        <artifactId>jedis</artifactId>
        <version>2.7.3</version>
    </dependency>
	<!-- jedis end -->

## 配置xml ##


	<context:component-scan base-package="com.github.freeman.redis" />

    <!-- redis连接池的配置 -->
    <bean id="jedisPoolConfig" class="redis.clients.jedis.JedisPoolConfig">
        <property name="maxIdle" value="${redis.pool.maxIdle}" />
        <property name="minIdle" value="${redis.pool.minIdle}" />
    </bean>
    
    <!-- redis的连接池pool，不是必选项：timeout/password -->
    <bean id="jedisPool" class="redis.clients.jedis.JedisPool">
        <constructor-arg index="0" ref="jedisPoolConfig" />
        <constructor-arg index="1" value="${redis.host}" />
        <constructor-arg index="2" value="${redis.port}" type="int" />
    </bean>
    
    <bean id="connectionFactory"
        class="org.springframework.data.redis.connection.jedis.JedisConnectionFactory"
        p:hostName="${redis.host}" p:port="${redis.port}" p:poolConfig-ref="jedisPoolConfig" />

    <bean id="redisTemplate" class="org.springframework.data.redis.core.RedisTemplate">
        <property name="connectionFactory" ref="connectionFactory" />
        <property name="keySerializer">
            <bean class="org.springframework.data.redis.serializer.StringRedisSerializer" />
        </property>
        <property name="valueSerializer">
            <bean class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer" />
        </property>
        <property name="hashKeySerializer">
            <bean class="org.springframework.data.redis.serializer.StringRedisSerializer"/>
        </property>
        <property name="hashValueSerializer">
            <bean class="org.springframework.data.redis.serializer.JdkSerializationRedisSerializer"/>
        </property>
        <property name="enableTransactionSupport" value="true"/>
    </bean>

其中配置文件redis一些配置数据redis.properties如下：

    redis.pool.maxActive=30
    redis.pool.maxWait=10000
    redis.pool.maxIdle=10
    redis.pool.minIdle=5
    redis.host=127.0.0.1
    redis.port=6379
    redis.timeout=5000
    redis.password=

引入properties配置文件

	<context:property-placeholder file-encoding="utf-8" location="classpath:redis.properties" ignore-unresolvable="true" />

    <bean id="configProperties"    class="org.springframework.beans.factory.config.PropertiesFactoryBean">
        <property name="locations">
            <list>
                <value>classpath:redis.properties</value>
            </list>
        </property>
    </bean>

## RedisDao 接口 ##


    package com.github.freeman.redis.dao;
    
    import org.springframework.data.redis.core.RedisCallback;
    
    import java.util.concurrent.TimeUnit;
    
    /**
     * Created by Freeman on 2016/1/12.
     */
    public interface RedisDao<V> {
    
	    /**
	     * @param key
	     * @param value
	     * @param expire
	     * @return
	     */
	    void set(String key, V value, long expire);
	    
	    /**
	     * get value
	     *
	     * @param key
	     * @return
	     */
	    V get(String key);
	    
	    /**
	     * key delete
	     *
	     * @param key
	     */
	    void delete(String key);
	    
	    /**
	     * key exist
	     *
	     * @param key
	     * @return
	     */
	    boolean hasKey(String key);
	    
	    /**
	     * key expire
	     *
	     * @param key
	     * @param timeout
	     * @param unit
	     * @return
	     */
	    Boolean expire(String key, long timeout, TimeUnit unit);
	    
	    /**
	     * 批量删除对应的value
	     *
	     * @param keys
	     */
	    void remove(final String... keys);
	    
	    /**
	     * 批量删除key
	     *
	     * @param pattern
	     */
	    void removePattern(final String pattern);
	    
	    /**
	     * 当需要更改serializer,可以直接通过connection.set等方法实现
	     *
	     * @param callback
	     * @return
	     */
	    <T> T execute(RedisCallback<T> callback);
    }

## RedisDao接口的实现类 ##


    package com.github.freeman.redis.dao;
    
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.data.redis.core.*;
    import org.springframework.stereotype.Repository;
    
    import javax.annotation.Resource;
    import java.util.Set;
    import java.util.concurrent.TimeUnit;
    
    @Repository
    public class DefaultRedisDao<V> implements RedisDao<V> {
    
	    @Autowired
	    private RedisTemplate<String, V> redisTemplate;
	    
	    @Resource(name = "redisTemplate")
	    protected ValueOperations<String, V> valueOperations;
	    //
	    @Resource(name = "redisTemplate")
	    protected HashOperations<String, Object, Object> hashOperations;
	    //
	    @Resource(name = "redisTemplate")
	    protected ListOperations<String, V> listOperations;
	    
	    @Resource(name = "redisTemplate")
	    protected SetOperations<String, V> setOperations;
	    
	    /**
	     * @param key
	     * @param value
	     * @param expire
	     * @return
	     */
	    public void set(String key, V value, long expire) {
	    valueOperations.set(key, value, expire, TimeUnit.SECONDS);
	    }
	    
	    /**
	     * get value
	     *
	     * @param key
	     * @return
	     */
	    public V get(String key) {
	    return valueOperations.get(key);
	    }
	    
	    /**
	     * key delete
	     *
	     * @param key
	     */
	    public void delete(String key) {
	    getRedisTemplate().delete(key);
	    }
	    
	    /**
	     * key exist
	     *
	     * @param key
	     * @return
	     */
	    public boolean hasKey(String key) {
	    return getRedisTemplate().hasKey(key);
	    }
	    
	    /**
	     * key expire
	     *
	     * @param key
	     * @param timeout
	     * @param unit
	     * @return
	     */
	    public Boolean expire(String key, long timeout, TimeUnit unit) {
	    return getRedisTemplate().expire(key, timeout, unit);
	    }
	    
	    /**
	     * 批量删除对应的value
	     *
	     * @param keys
	     */
	    public void remove(final String... keys) {
	    for (String key : keys) {
	    delete(key);
	    }
	    }
	    
	    /**
	     * 批量删除key
	     *
	     * @param pattern
	     */
	    public void removePattern(final String pattern) {
	    Set<String> keys = getRedisTemplate().keys(pattern);
	    if (keys.size() > 0)
	    getRedisTemplate().delete(keys);
	    }
	    
	    /**
	     * redistemplate是全局唯一的，子类不要出现对redistemplate的成员变量的设置(比如keyserializer,)
	     *
	     * @return
	     */
	    RedisTemplate<String, V> getRedisTemplate() {
	    return redisTemplate;
	    }
	    
	    /**
	     * 当需要更改serializer,可以直接通过connection.set等方法实现
	     *
	     * @param callback
	     * @return
	     */
	    public <T> T execute(RedisCallback<T> callback) {
	    return redisTemplate.execute(callback);
	    }
    }


## 单元测试 ##



    package com.github.freeman;
    
    import com.github.freeman.redis.dao.RedisDao;
    import org.junit.Assert;
    import org.junit.Test;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.test.context.ContextConfiguration;
    import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;
    
    /**
     * Unit test for RedisDao.
     */
    @ContextConfiguration(locations = {
    	"classpath:spring-redis.xml",
    })
    public class AppTest extends AbstractJUnit4SpringContextTests {
	    @Autowired
	    private RedisDao<Object> redisDao;
    
	    @Test
	    public void test(){
		    redisDao.set("id_1","aa",3600L);
		    Object id_1 = redisDao.get("id_1");
		    Assert.assertNotNull(id_1);
	    }
	    @Test
	    public void testDelete(){
	    	redisDao.delete("id_1");
	    }
    }

