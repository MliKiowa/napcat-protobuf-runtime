# napcat-protobuf-runtime
此库是`@protobuf-ts/runtime`再封装方案
## 用途
CodeGen/Proto3文件 的方案处理PB 具有 不适合频繁变动 也不与代码混合的效果 美观度也不高的问题

pb-ts runtime/pb-js runtime 各种库类型提取困难 基于runtime编写困难 pbjs代码不适合打包器 代码美观度不高的问题

既然这样 那么有没有一款既美观 类型提取方便 能和代码写一起 操作简单 语法多样 的封装库呢?
## 目标与特色
提供快速Develop和优雅的方案进行操作与读取

- [x] DataClass 风格定义ProtoBuf结构 规范性写法
- [x] 除开DataClass式结构声明结构 同样能使用Object完成声明PB结构
- [x] 进行反序列化/序列化的数据绑定 将值同步到外部绑定 无需进行二次结构化数据Object进行encode/decode
- [x] 支持通过模板快速创建匿名DataClass 并立即填入数据序列化/反序列化
- [x] Array替代Repeat声明 与语言Array结合
- [x] 在没有ProtoBuf结构的情况下盲解ProtoBuf数据
- [x] 支持在一行以内 完成声明->填入数据->encode
- [x] 提供PB结构序列化JSON/JS对象
- [x] 规避类型type-orm库存在的属性默认值问题
- [x] 运行时动态扩展PB字段
- [ ] 在没有ProtoBuf结构的情况下动态盲解编码ProtoBuf数据

## 缺点
proxy + 套嵌 存在性能损失 但是我写的舒服就行了.jpg

## 示例
```typescript
import { PBArray, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx, ProtoBufIn, ProtoBufQuick, Reference, StringWrapper, UInt32Wrapper, UnReference, ValueWrapper } from "./protobuf.ts";

class ProtoBufDataInnerClass extends ProtoBufBase {
    data = PBString(1);
    test = PBUint32(2);
}

class ProtoBufDataClass extends ProtoBufBase {
    uin = PBUint32(1);
    inner = ProtoBuf(2, ProtoBufDataInnerClass);
    list = PBArray(3, ProtoBuf(ProtoBufDataInnerClass));
    listinner = PBArray(4, ProtoBuf(class extends ProtoBufBase { data = PBArray(1, PBString()); }));
    listquick = PBArray(5, ProtoBufIn({ data: PBString(1) }));
}
const test = ProtoBufEx(ProtoBufDataClass, {
    inner: {
        data: "x",
        test: 300
    },
    list: [{
        data: "xx",
        test: 5
    }, {
        data: "xxx",
        test: 2
    }],
    listinner: [{
        data: ["x", "xxxx"]
    }],
    listquick: [{
        data: "xxxxx"
    }],
    uin: 0
});
console.log("值首次序列化:", Buffer.from(test.encode()).toString('hex'));
test.inner.test = 200;
console.log("值修改序列化:", Buffer.from(test.encode()).toString('hex'));
```
