我要实现一个webUI自动化测试框架，采用并发执行方案。
1、技术框架：Playwright Test，直接使用playwright自带的并发功能来实现
2、设计模式：POM页面对象模型
3、web系统的信息如下：
url：https://www.saucedemo.com/
Username ： standard_user （data-test="username"）
password ：standard_user  （data-test="password"）
Login：(data-test=login-button)
4、实现登录功能的多种场景验证
5、自动化测试框架要遵循：可扩展，可维护和稳定性
请根据上述要求，给出设计方案


扩展 POM：新增库存页、购物车页与业务流用例，测试层仅调用 POM API

请继续为库存页与购物车页增加更多语义化 API（如价格校验、结算流程），测试层保持只调用 POM 方法

性能统计：细化耗时阈值并做历史趋势上报，识别性能回归
如何实现这个功能？