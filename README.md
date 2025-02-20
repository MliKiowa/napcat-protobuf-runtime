# napcat-protobuf-runtime
此库是`@protobuf-ts/runtime`再封装方案
## 用途
CodeGen/Proto3文件 的方案处理PB 具有 不适合频繁变动 也不与代码混合的效果 美观度也不高的问题

pb-ts runtime/pb-js runtime 各种库类型提取困难 基于runtime编写困难 pbjs代码不适合打包器 代码美观度不高的问题

既然这样 那么有没有一款既美观 类型提取方便 能和代码写一起 操作简单 语法多样 的封装库呢?

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