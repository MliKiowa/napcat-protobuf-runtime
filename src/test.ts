import { PBArray, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufEx, ProtoBufIn, ProtoBufQuick } from "./protobuf.ts";

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
export function CreatPB(uin: number, name: string) {
    return ProtoBuf(class ProtoBufDataClass extends ProtoBufBase {
        uin = PBUint32(1, false, uin);
        name = PBString(2, false, name);
    }).encode();
}
export function testPb() {
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
    test.uin = 200;
    console.log("值修改序列化:", Buffer.from(test.encode()).toString('hex'));
    let data = Buffer.from('086412090a047465737410ac021a080a047465737410051a090a0574657374311002220d0a04746573740a0574657374312a070a057465737435', 'hex');
    console.log("值首次反序列化:", test.decode(new Uint8Array(data)).uin);
    console.log("序列化JSON演示:", JSON.stringify(test.toObject()));
    console.log("快速序列化演示:", Buffer.from(ProtoBufQuick({ uin: PBUint32(1) }, { uin: 120 }).encode()).toString('hex'));
    console.log("复杂快速序列化演示:", Buffer.from(ProtoBufQuick({ uin: ProtoBufIn(1, { data: PBString(5) }) }, { uin: { data: "123" } }).encode()).toString('hex'));
    console.log("函数辅助序列化演示:", Buffer.from(CreatPB(100, "test")).toString('hex'));
}

testPb();