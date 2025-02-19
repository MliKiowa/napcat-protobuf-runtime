import { PBArray, PBInt32, PBInt64, PBString, PBUint32, ProtoBuf, ProtoBufBase } from "./protobuf";

class ProtoBufDataInnerClass extends ProtoBufBase {
    data = PBString(1);
    test = PBUint32(2);
}

class ProtoBufDataClass extends ProtoBufBase {
    uin = PBUint32(1);
    id = PBUint32(2);
    name = PBString(3);
    list = PBArray(4, PBString());
    data = PBArray(5, PBInt32());
    data2 = PBArray(6, PBInt64());
    data3 = PBArray(7, ProtoBuf(ProtoBufDataInnerClass));
    inner = ProtoBuf(8, ProtoBufDataInnerClass);
}

export function test_pb() {
    let test = ProtoBuf(ProtoBufDataClass);
    console.log(test.generateFields());

}