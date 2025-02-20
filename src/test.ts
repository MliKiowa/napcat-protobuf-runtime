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

export function testPb() {
    const test = ProtoBufEx(ProtoBufDataClass, {
        uin: 100,
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
        }]
    });
    test.uin = 200;
    console.log(Buffer.from(test.encode()).toString('hex'));
    let data = Buffer.from('086412090a047465737410ac021a080a047465737410051a090a0574657374311002220d0a04746573740a0574657374312a070a057465737435', 'hex');
    test.decode(new Uint8Array(data));
    console.log(JSON.stringify(test.toObject()));
    console.log(ProtoBufQuick({ uin: PBUint32(1) }, { uin: 120 }).encode());


    console.log(
        Buffer.from(ProtoBufQuick({ uin: ProtoBufIn(1, { data: PBString(5) }) }, { uin: { data: "123" } }).encode()).toString('hex'));
}

testPb();