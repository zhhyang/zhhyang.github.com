---
layout: post
title: "Spring Security 保护Service层"
category: springsecurity
tags: 
 - Spring Security
---

#保护业务层
>Spring Security支持添加授权层（或者基于授权的数据处理）到应用中所有Spring管理的bean中。尽管很多的开发人员关注层的安全，其实业务层的安全同等重要，因为恶意的用户可能会穿透web层，能够通过没有UI的前端访问暴露的服务，如使用webservice。

让我们查看下面的图以了解我们将要添加安全层的位置：

![添加安全层的位置](http://upload-images.jianshu.io/upload_images/1400215-5efd177c43b9655b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
##Spring Security有两个主要技术以实现方法的安全：
1. 事先授权（Pre-authorization）保证在执行一个方法之前需要满足特定的要求——例如，一个用户要拥有特定的GrantedAuthority，如ROLE_ADMIN。不能满足声明的条件将会导致方法调用失败；
2. 事后授权（Post-authorization）保证在方法返回时，调用的安全实体满足声明的条件。这很少被使用，但是能够在一些复杂交互的业务方法周围提供额外的安全层。

事先和事后授权在面向对象设计中提供了所谓的前置条件和后置条件（preconditions and ostconditions）。前置条件和后置条件允许开发者声明运行时的检查，从而保证在一个方法执行时特定的条件需要满足。在安全的事前授权和事后授权中，业务层的开发人员需要对特定的方法确定明确的安全信息，并在接口或类的API声明中添加期望的运行时条件。正如你可能想象的那样，这需要大量的规划以避免不必要的影响。
##保护业务层方法的基本知识
>让我们以JBCP Pets中业务层的几个方法为例阐述怎样为它们应用典型的规则。

我们对JBCP Pets的基础代码进行了重新组织以实现三层的设计，作为修改的一部分我们抽象出了前面章节已经介绍到的修改密码功能到业务层。不同于用web MVC的控制器直接访问JDBC DAO，我们选择插入一个业务服务以提供要求的附加功能。下图对此进行了描述：

![应用架构的业务层.png](http://upload-images.jianshu.io/upload_images/1400215-603cdfe8e9986844.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
我们能够看到在例子中`com.packtpub.springsecurity.service.IuserService`接口代表了应用架构的业务层，而这对我们来说，是一个合适位置来添加方法级的安全。

添加@PreAuthorize方法注解
 我们第一个的设计决策就是要在业务层上添加方法安全，以保证用户在修改密码前已经作为系统的合法用户进行了登录。这通过为业务接口方法定义添加一个简单的注解来实现，如下：
`public interface IUserService {  
@PreAuthorize("hasRole('ROLE_USER')")  
  public void changePassword(String username, String password);  
}`
这就是保证合法、已认证的用户才能访问修改密码功能所要做的所有事情。Spring Security将会使用运行时的面向方面编程的切点（aspect oriented programming (AOP) pointcut）来对方法执行before advice，并在安全要求未满足的情况下抛出AccessDeniedException异常。

让Spring Security能够使用方法注解,我们还需要在dogstore-security.xml中做一个一次性的修改，通过这个文件我们已经进行了Spring Security其他的配置。只需要在<http>声明之前，添加下面的元素即可：
`<global-method-security pre-post-annotations="enabled"/>`
校验方法安全
不相信如此简单？那我们将ROLE_USER声明修改为ROLE_ADMIN。现在用用户guest（密码guest）登录并尝试修改密码。你会在尝试修改密码时，看到如下的出错界面：
如果查看Tomcat的控制台，你可以看到很长的堆栈信息，开始是这样的：
`DEBUG - Could not complete request  
o.s.s.access.AccessDeniedException: Access is denied  
at o.s.s.access.vote.AffirmativeBased.decide  
at o.s.s.access.intercept.AbstractSecurityInterceptor.beforeInvocation  
...  
at $Proxy12.changePassword(Unknown Source)  
at com.packtpub.springsecurity.web.controller.AccountController.  
submitChangePasswordPage  `
          基于访问拒绝的页面以及指向changePassword方法的堆栈信息，我们可以看到用户被合理的拒绝对业务方法的访问，因为缺少ROLE_ADMIN的GrantedAuthority。你可以测试修改密码功能对管理员用户依旧是可以访问的。
         我们只是在接口上添加了简单的声明就能够保证方法的安全，这是不是太令人兴奋了？
         让我们介绍一下实现方法安全的其它方式，然后进入功能的背后以了解其怎样以及为什么能够生效。
#几种实现方法安全的方式
>除了@PreAuthorize注解以外，还有几种其它的方式来声明在方法调用前进行授权检查的需求。我们会讲解这些实现方法安全的不同方式，并比较它们在不同环境下的优势与不足。

##遵守JSR-250标准规则
>JSR-250, Common Annotations for the Java Platform定义了一系列的注解，其中的一些是安全相关的，它们意图在兼容JSR-250的环境中很方便地使用。Spring框架从Spring 2.x释放版本开始就兼容JSR-250，包括Spring Security框架。
尽管JSR-250注解不像Spring原生的注解富有表现力，但是它们提供的注解能够兼容不同的Java EE应用服务器实现如Glassfish，或面向服务的运行框架如Apache Tuscany。取决于你应用对轻便性的需求，你可能会觉得牺牲代码的轻便性但减少对特定环境的要求是值得的。

要实现我们在第一个例子中的规则，我们需要作两个修改:
1. 首先在dogstore-security.xml文件中：
`<global-method-security jsr250-annotations="enabled"/>  `
2. 其次，@PreAuthorize注解需要修改成@RolesAllowed注解。
正如我们可能推断出的那样，@RolesAllowed注解并不支持SpEL表达式，所以它看起来很像我们在第二节中提到的URL授权。我们修改IuserService定义如下：
`@RolesAllowed("ROLE_USER")  
public void changePassword(String username, String password);`
 正如前面的练习那样，如果不相信它能工作，尝试修改ROLE_USER 为ROLE_ADMIN并进行测试。
要注意的是，也可以提供一系列允许的GrantedAuthority名字，使用Java 5标准的字符串数组注解语法：
`@RolesAllowed({"ROLE_USER","ROLE_ADMIN"})  
public void changePassword(String username, String password); `

3. JSR-250还有两个其它的注解：@PermitAll 和@DenyAll。它们的功能正如你所预想的，允许和禁止对方法的任何请求。
>【类层次的注解。注意方法级别的安全注解也可以使用到类级别上！如果提供了方法级别的注解，将会覆盖类级别的注解。如果业务需要在整个类上有安全策略的话，这会非常有用。要注意的是使用这个功能要有良好的注释的编码规范，这样开发人员能够很清楚的了解类和方法的安全特性。】
       
##@Secured注解实现方法安全
>Spring本身也提供一个简单的注解，类似于JSR-250 的@RolesAllowed注解。

@Secured注解在功能和语法上都与@RolesAllowed一致。唯一需要注意的不同点是要使用这些注解的话，要在<global-method-security>元素中明确使用另外一个属性：
`<global-method-security secured-annotations="enabled"/>`
 因为@Secured与JSR标准的@RolesAllowed注解在功能上一致，所以并没有充分的理由在新代码中使用它，但是它能够在Spring的遗留代码中运行。

##使用Aspect Oriented Programming （AOP）实现方法安全
>实现方法安全的最后一项技术也可能是最强大的方法，它还有一个好处是不需要修改源代码。作为替代，它使用面向方面的编程方式为一个方法或方法集合声明切点（pointcut），而增强（advice）会在切点匹配的情况下进行基于角色的安全检查。AOP的声明只在Spring Security的XML配置文件中并不涉及任何的注解。

以下就是声明保护所有的service接口只有管理权限才能访问的例子：
`<global-method-security>  
      <protect-pointcut access="ROLE_ADMIN" expression="execution(* com.packtpub.springsecurity.service.I*Service.*(..))"/>  
</global-method-security>`
 切点表达式基于Spring AOP对AspectJ的支持。但是，Spring AspectJ AOP仅支持AspectJ切点表达式语言的一个很小子集——可以参考Spring AOP的文档以了解其支持的表达式和其它关于Spring AOP编程的重要元素。
         注意的是，可以指明一系列的切点声明，以指向不同的角色和切点目标。以下的就是添加切点到DAO中一个方法的例子：
`<global-method-security>  
  <protect-pointcut access="ROLE_USER" expression="execution(* com.packtpub.springsecurity.dao.IProductDao.getCategories(..)) &&  args()"/>  
  <protect-pointcut access="ROLE_ADMIN" expression="execution(* com.packtpub.springsecurity.service.I*Service.*(..))"/>  
</global-method-security>  `
意在新增的切点中，我们添加了一些AspectJ的高级语法，来声明Boolean逻辑以及其它支持的切点，而参数可以用来确定参数的类型声明。
同Spring Security其它允许一系列安全声明的地方一样，AOP风格的方法安全是按照从顶到底的顺序进行的，所以需要按照最特殊到最不特殊的顺序来写切点。
使用AOP来进行编程即便是经验丰富的开发人员可能也会感到迷惑。如果你确定要使用AOP来进行安全声明，除了Spring AOP的参考手册外，强烈建议你参考一些这个专题相关的书籍。AOP实现起来比较复杂，尤其是在解决不按照你预期运行的配置错误时更是如此。
比较方法授权的类型
以下的快速参考表可能在你选择授权方法检查时派上用场：

>大多数使用Java 5的Spring Security用户倾向于使用JSR-250注解，以达到在IT组织间最大的兼容性和对业务类（以及相关约束）的重用。在需要的地方，这些基本的声明能够被Spring Security本身实现的注解所代替。
如果你在不支持注解的环境中（Java 1.4或更早版本）中使用Spring Security，很不幸的是，关于方法安全的执行你的选择可能会很有限。即使在这样的情况下，对AOP的使用也提供了相当丰富的环境来开发基本的安全声明。

方法的安全保护是怎样运行的？
方法安全的访问决定机制——一个给定的请求是否被允许——在概念上与web请求的访问决定逻辑是相同的。AccessDecisionManager使用一个AccessDecisionVoters集合，其中每一个都要对能否进行访问做出允许、拒绝或者弃权的的投票。AccessDecisionManager汇集这些投票器的结果并形成一个最终能否允许处罚方法的决定。
Web请求的访问决策没有这么复杂，这是因为通过ServletFilters对安全请求做拦截（以及请求拒绝）都相对很直接。因为方法的触发可能发生在任何的地方，包括没有通过Spring Security直接配置的代码，Spring Security的设计者于是选择Spring管理的AOP方式来识别、评估以及保护方法的触发。
下图在总体上展现了方法触发授权决策的主要参与者：

![方法触发授权决策的主要参与者.png](http://upload-images.jianshu.io/upload_images/1400215-612b0a5d65147a89.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们 能够看到Spring Security的.s.s.access.intercept.aopalliance.MethodSecurityInterceptor被标准的Spring AOP运行时触发以拦截感兴趣的方法调用。通过上面的流程图，是否允许方法调用的逻辑就相对很清晰了。
         此时，我们可能会比较关心方法安全功能的性能。显然，MethodSecurityInterceptor不能在应用中每个方法调用的时候触发——那方法或类上的注解是如何做到AOP拦截的呢？
         首先，AOP织入默认不会对所有Spring管理的bean触发。相反，如果<global-method-security>在Spring Security配置中定义，一个标准的Spring AOP  o.s.beans.factory.config.BeanPostProcessor将会被注册，它将会探查AOP配置是否有AOP增强器（advisors）需要织入（以及拦截）。这个工作流是Spring标准的AOP处理（名为AOP自动织入），并不是Spring Security所特有的。所有的BeanPostProcessors在spring ApplicationContext初始化时执行，在所有的Spring Bean配置生效后。
         Spring的AOP自动织入功能查询所有注册的PointcutAdvisors，查看是否有AOP切点匹配方法的调用并使用AOP增强（advice）。Spring Security实现了o.s.s.access.intercept.aopalliance.MethodSecurityMetadataSourceAdvisor类，它会检查所有配置的方法安全病建立适当的AOP拦截。注意的是，只有声明了方法安全的接口和类才会被AOP代理。
>【强烈建议在接口上声明AOP规则（以及其它的安全注解），而不是在实现类上。使用类（通过Spring的CGLIB代理）进行声明可能会导致应用出现不可预知的行为改变，通常在正确性方面比不上在接口定义安全声明（通过AOP）。】

MethodSecurityMetadataSourceAdvisor将AOP影响方法行为的决定委托给.s.s.access.method.MethodSecurityMetadataSource的实例。不同的方法安全注解都拥有自己的MethodSecurityMetadataSource，它将用来检查每个方法和类并添加在运行时执行的增强（advice）。
以下的图展现了这个过程是如何发生的：

![AOP影响方法行为的决定委托.png](http://upload-images.jianshu.io/upload_images/1400215-e5e97ef6047f1702.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>取决于你的应用中配置的Sprin Bean的数量，以及拥有的安全方法注解的数量，添加方法安全代理将会增加初始化ApplicationContext的时间。但是，一旦上下文初始化完成，对单个的代理bean来说性能的影响可以忽略不计了。