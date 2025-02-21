import { PBArray, PBBytes, PBString, PBUint32, ProtoBuf, ProtoBufBase, ProtoBufDecode, ProtoBufEx, ProtoBufIn, ProtoBufQuick, Reference, StringWrapper, UInt32Wrapper, UnReference, ValueWrapper } from "./protobuf.ts";

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

export function createProtobuf(uin: number, name: string) {
    return ProtoBuf(class ProtoBufDataClass extends ProtoBufBase {
        uin = PBUint32(1, false, uin);
        name = PBString(2, false, name);
    }).encode();
}

export function testSerialization() {
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
    console.log("值修改前序列化:", test.listinner[0].data);
    test.listinner[0].data = ["x00", "xxxxx"];
    test.inner.test = 200;
    console.log("值修改序列化:", Buffer.from(test.encode()).toString('hex'));
}

export function testDeserialization() {
    const test = ProtoBuf(ProtoBufDataClass);
    let data = Buffer.from('086412090a047465737410ac021a080a047465737410051a090a0574657374311002220d0a04746573740a0574657374312a070a057465737435', 'hex');
    console.log("值首次反序列化:", test.decode(new Uint8Array(data)).uin);
}

export function testJsonSerialization() {
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
    console.log("序列化JSON演示:", JSON.stringify(test.toObject()));
}

export function testQuickSerialization() {
    console.log("快速序列化演示:", Buffer.from(ProtoBufQuick({ uin: PBUint32(1) }, { uin: 120 }).encode()).toString('hex'));
    console.log("复杂快速序列化演示:", Buffer.from(ProtoBufQuick({ uin: ProtoBufIn(1, { data: PBBytes(5) }) },
        { uin: { data: new Uint8Array([0x125, 0x25]) } }).encode()).toString('hex'));
}

export function testFunctionSerialization() {
    console.log("函数辅助序列化演示:", Buffer.from(createProtobuf(100, "test")).toString('hex'));
}

export function testFunctionDeserialization() {
    let data_uin = Reference(PBUint32(1, false, 0));
    let data_name = Reference(PBString(2, false, ""));
    ProtoBuf(class ProtoBufDataClass extends ProtoBufBase {
        uin = data_uin;
        name = data_name;
    }).decode(createProtobuf(8000, "demo"));
    console.log("函数辅助反序列化演示:", UnReference(data_uin), UnReference(data_name));
    ProtoBuf(class ProtoBufDataClass extends ProtoBufBase {
        uin = data_uin;
        name = data_name;
    }).decode(createProtobuf(7000, "test"));
    console.log("函数辅助反序列化演示:", UnReference(data_uin), UnReference(data_name));
}
export function normalDecode() {
    let data = new Uint8Array(Buffer.from('0a042a022525', 'hex'))
    console.log("无protobuf盲解:", JSON.stringify(ProtoBufDecode(data), null, 2));
}
testSerialization();
testDeserialization();
testJsonSerialization();
testQuickSerialization();
testFunctionSerialization();
testFunctionDeserialization();
normalDecode();