import { PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx } from "./protobuf";

// 演示代码
class ProtoBufDataInnerClass extends ProtoBufBase {
    data = PBString(1);
    test = PBUint32(2);
}

class ProtoBufDataClass extends ProtoBufBase {
    uin = PBUint32(1);
    inner = ProtoBuf(2, ProtoBufDataInnerClass);
}

export function testPb() {
    const test = ProtoBufEx(ProtoBufDataClass, {
        uin: 100,
        inner: {
            data: "test",
            test: 300
        }
    });
    test.uin = 100;
    console.log(test);
    console.log(Buffer.from(test.encode()).toString('hex'));
}
testPb();