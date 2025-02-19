import { PBArray, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx, ProtoBufQuick } from "./protobuf";

// 演示代码
class ProtoBufDataInnerClass extends ProtoBufBase {
    data = PBString(1);
    test = PBUint32(2);
}

class ProtoBufDataClass extends ProtoBufBase {
    uin = PBUint32(1);
    inner = ProtoBuf(2, ProtoBufDataInnerClass);
    list = PBArray(3, ProtoBuf(3, ProtoBufDataInnerClass));
}

export function testPb() {
    const test = ProtoBufEx(ProtoBufDataClass, {
        uin: 100,
        inner: {
            data: "test",
            test: 300
        },
        list: []
    });
    test.uin = 100;
    console.log(Buffer.from(test.encode()).toString('hex'));
    console.log(ProtoBufQuick({ uin: PBUint32(1) }, { uin: 120 }).encode());
}

testPb();