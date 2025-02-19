import { PBArray, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx, ProtoBufIn, ProtoBufQuick } from "./protobuf";

// 演示代码
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

export function testPb() {
    const test = ProtoBufEx(ProtoBufDataClass, {
        uin: 100,
        inner: {
            data: "test",
            test: 300
        },
        list: [{
            data: "test",
            test: 5
        }, {
            data: "test1",
            test: 2
        }],
        listinner: [{
            data: ["test", "test1"]
        }],
        listquick: [{
            data: "test5"
        }]
    });
    test.uin = 100;
    console.log(test.generateFields(), JSON.stringify(test.toObject()));
    console.log(Buffer.from(test.encode()).toString('hex'));
    console.log(ProtoBufQuick({ uin: PBUint32(1) }, { uin: 120 }).encode());
}

testPb();