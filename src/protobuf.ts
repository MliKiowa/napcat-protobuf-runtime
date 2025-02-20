import { MessageType, RepeatType, ScalarType } from '@protobuf-ts/runtime';
import type { PartialFieldInfo } from '@protobuf-ts/runtime';

// 值包装类
export class ValueWrapper<T> {
    public _value: T;
    public _fieldId: number;
    public _opt: boolean;
    public _callback: Function;
    constructor(field: number, value: T, opt: boolean, callback: Function = () => { }) {
        this._value = value;
        this._fieldId = field;
        this._opt = opt;
        this._callback = callback;
    }

    public get value(): T {
        return this._value;
    }

    public set value(newValue: T) {
        this._value = newValue;
    }

    public getTypeName(): string {
        return this.constructor.name;
    }

    public getFieldId() {
        return this._fieldId;
    }

    public getField(key: string): PartialFieldInfo {
        return autoTypeToField(key, this);
    }
}

export class DoubleWrapper extends ValueWrapper<number> { getTypeName(): string { return "DoubleWrapper"; } }
export class FloatWrapper extends ValueWrapper<number> { getTypeName(): string { return "FloatWrapper"; } }
export class StringWrapper extends ValueWrapper<string> { getTypeName(): string { return "StringWrapper"; } }
export class UInt32Wrapper extends ValueWrapper<number> { getTypeName(): string { return "UInt32Wrapper"; } }
export class Int32Wrapper extends ValueWrapper<number> { getTypeName(): string { return "Int32Wrapper"; } }
export class Int64Wrapper extends ValueWrapper<bigint> { getTypeName(): string { return "Int64Wrapper"; } }
export class UInt64Wrapper extends ValueWrapper<bigint> { getTypeName(): string { return "UInt64Wrapper"; } }
export class ArrayWrapper<T> extends ValueWrapper<T[]> { getTypeName(): string { return "ArrayWrapper"; } }
export class BoolWrapper extends ValueWrapper<boolean> { getTypeName(): string { return "BoolWrapper"; } }
export class BytesWrapper extends ValueWrapper<Uint8Array> { getTypeName(): string { return "BytesWrapper"; } }
export class Fixed64Wrapper extends ValueWrapper<bigint> { getTypeName(): string { return "Fixed64Wrapper"; } }
export class Fixed32Wrapper extends ValueWrapper<number> { getTypeName(): string { return "Fixed32Wrapper"; } }
export class SFixed32Wrapper extends ValueWrapper<number> { getTypeName(): string { return "SFixed32Wrapper"; } }
export class SFixed64Wrapper extends ValueWrapper<bigint> { getTypeName(): string { return "SFixed64Wrapper"; } }
export class SInt32Wrapper extends ValueWrapper<number> { getTypeName(): string { return "SInt32Wrapper"; } }
export class SInt64Wrapper extends ValueWrapper<bigint> { getTypeName(): string { return "SInt64Wrapper"; } }
export class UnknownWrapper extends ValueWrapper<unknown> { getTypeName(): string { return "UnknownWrapper"; } }

// 类型提取工具
export type ExtractType<T> =
    T extends ArrayWrapper<infer V> ? V[] :
    T extends ValueWrapper<infer U> ? U :
    T extends ProtoBufBase ? ExtractSchema<T> :
    T;

export type ExtractSchema<T> = Omit<{
    [K in keyof T]: T[K] extends ProtoBufBase ? ExtractSchema<T[K]> : ExtractType<T[K]>;
}, keyof ProtoBufBase>;

const NameDataKeys = {
    "UInt32Wrapper": "UInt32Wrapper",
    "Int32Wrapper": "Int32Wrapper",
    "Int64Wrapper": "Int64Wrapper",
    "UInt64Wrapper": "UInt64Wrapper",
    "StringWrapper": "StringWrapper",
    "ArrayWrapper": "ArrayWrapper",
    "BoolWrapper": "BoolWrapper",
    "BytesWrapper": "BytesWrapper",
    "DoubleWrapper": "DoubleWrapper",
    "FloatWrapper": "FloatWrapper",
    "Fixed64Wrapper": "Fixed64Wrapper",
    "Fixed32Wrapper": "Fixed32Wrapper",
    "SFixed32Wrapper": "SFixed32Wrapper",
    "SFixed64Wrapper": "SFixed64Wrapper",
    "SInt32Wrapper": "SInt32Wrapper",
    "SInt64Wrapper": "SInt64Wrapper",
    "UnknownWrapper": "UnknownWrapper",
}

// 类型映射工具
const typeMap: { [key: string]: any } = {
    [NameDataKeys.UInt32Wrapper]: UInt32Wrapper,
    [NameDataKeys.Int32Wrapper]: Int32Wrapper,
    [NameDataKeys.Int64Wrapper]: Int64Wrapper,
    [NameDataKeys.UInt64Wrapper]: UInt64Wrapper,
    [NameDataKeys.StringWrapper]: StringWrapper,
    [NameDataKeys.ArrayWrapper]: ArrayWrapper,
    [NameDataKeys.BoolWrapper]: BoolWrapper,
    [NameDataKeys.BytesWrapper]: BytesWrapper,
    [NameDataKeys.DoubleWrapper]: DoubleWrapper,
    [NameDataKeys.FloatWrapper]: FloatWrapper,
    [NameDataKeys.Fixed64Wrapper]: Fixed64Wrapper,
    [NameDataKeys.Fixed32Wrapper]: Fixed32Wrapper,
    [NameDataKeys.SFixed32Wrapper]: SFixed32Wrapper,
    [NameDataKeys.SFixed64Wrapper]: SFixed64Wrapper,
    [NameDataKeys.SInt32Wrapper]: SInt32Wrapper,
    [NameDataKeys.SInt64Wrapper]: SInt64Wrapper,
    [NameDataKeys.UnknownWrapper]: UnknownWrapper,
};

const scalarMap: { [key: string]: ScalarType } = {
    [NameDataKeys.UInt32Wrapper]: ScalarType.UINT32,
    [NameDataKeys.Int32Wrapper]: ScalarType.INT32,
    [NameDataKeys.Int64Wrapper]: ScalarType.INT64,
    [NameDataKeys.UInt64Wrapper]: ScalarType.UINT64,
    [NameDataKeys.StringWrapper]: ScalarType.STRING,
    [NameDataKeys.BytesWrapper]: ScalarType.BYTES,
    [NameDataKeys.BoolWrapper]: ScalarType.BOOL,
    [NameDataKeys.DoubleWrapper]: ScalarType.DOUBLE,
    [NameDataKeys.FloatWrapper]: ScalarType.FLOAT,
    [NameDataKeys.Fixed64Wrapper]: ScalarType.FIXED64,
    [NameDataKeys.Fixed32Wrapper]: ScalarType.FIXED32,
    [NameDataKeys.SFixed32Wrapper]: ScalarType.SFIXED32,
    [NameDataKeys.SFixed64Wrapper]: ScalarType.SFIXED64,
    [NameDataKeys.SInt32Wrapper]: ScalarType.SINT32,
    [NameDataKeys.SInt64Wrapper]: ScalarType.SINT64,
    [NameDataKeys.UnknownWrapper]: ScalarType.BYTES,
};

export function autoTypeToClass(typeName: string) {
    return typeMap[typeName] || UnknownWrapper;
}

function autoTypeToScalar(typeName: string) {
    return scalarMap[typeName] || ScalarType.BYTES;
}

// 默认值创建构造类
export function PBArray<T>(field: number = 0, data: T, opt: boolean = false) {
    return new ArrayWrapper<T>(field, [], opt, () => data) as unknown as Omit<T, keyof ProtoBufBase>[];
}
export function PBDouble(field: number = 0, opt: boolean = false) {
    return new DoubleWrapper(field, 0, opt) as unknown as number;
}
export function PBFloat(field: number = 0, opt: boolean = false) {
    return new FloatWrapper(field, 0, opt) as unknown as number;
}
export function PBString(field: number = 0, opt: boolean = false) {
    return new StringWrapper(field, "", opt) as unknown as string;
}
export function PBUint32(field: number = 0, opt: boolean = false) {
    return new UInt32Wrapper(field, 0, opt) as unknown as number;
}
export function PBInt32(field: number = 0, opt: boolean = false) {
    return new Int32Wrapper(field, 0, opt) as unknown as number;
}
export function PBInt64(field: number = 0, opt: boolean = false) {
    return new Int64Wrapper(field, BigInt(0), opt) as unknown as bigint;
}
export function PBUint64(field: number = 0, opt: boolean = false) {
    return new UInt64Wrapper(field, BigInt(0), opt) as unknown as bigint;
}
export function PBBool(field: number = 0, opt: boolean = false) {
    return new BoolWrapper(field, false, opt) as unknown as boolean;
}
export function PBBytes(field: number = 0, opt: boolean = false) {
    return new BytesWrapper(field, new Uint8Array(), opt) as unknown as Uint8Array;
}
export function PBFixed64(field: number = 0, opt: boolean = false) {
    return new Fixed64Wrapper(field, BigInt(0), opt) as unknown as bigint;
}
export function PBFixed32(field: number = 0, opt: boolean = false) {
    return new Fixed32Wrapper(field, 0, opt) as unknown as number;
}
export function PBSFixed32(field: number = 0, opt: boolean = false) {
    return new SFixed32Wrapper(field, 0, opt) as unknown as number;
}
export function PBSFixed64(field: number = 0, opt: boolean = false) {
    return new SFixed64Wrapper(field, BigInt(0), opt) as unknown as bigint;
}
export function PBSInt32(field: number = 0, opt: boolean = false) {
    return new SInt32Wrapper(field, 0, opt) as unknown as number;
}
export function PBSInt64(field: number = 0, opt: boolean = false) {
    return new SInt64Wrapper(field, BigInt(0), opt) as unknown as bigint;
}

export function autoTypeToField(key: string, dataValue: ValueWrapper<unknown>): PartialFieldInfo {
    const typeName = dataValue.getTypeName();
    const no = dataValue.getFieldId();
    const opt = dataValue._opt;
    if (typeName === NameDataKeys.ArrayWrapper) {
        const item = dataValue._callback();
        if (item instanceof ProtoBufBase) {
            return {
                no,
                name: key,
                kind: 'message',
                T: () => new MessageType(key, item.generateFields()),
                opt: opt || false,
                repeat: RepeatType.PACKED,
            } as PartialFieldInfo;
        }
        if (item instanceof ValueWrapper) {
            const itemType = item.getTypeName();
            return {
                no,
                name: key,
                kind: 'scalar',
                T: autoTypeToScalar(itemType),
                opt: opt || false,
                repeat: itemType === NameDataKeys.StringWrapper || itemType === NameDataKeys.BytesWrapper ? RepeatType.UNPACKED : RepeatType.PACKED,
            } as PartialFieldInfo;
        }
        throw new Error("ArrayWrapper item type error");
    }
    return {
        no,
        name: key,
        kind: 'scalar',
        T: autoTypeToScalar(typeName),
        opt: opt || false,
        repeat: RepeatType.NO,
    } as PartialFieldInfo;
}

// Protobuf标记类
export class ProtoBufBase {
    public _fieldId: number = 0;

    //默认标记类
    public generateFields(): PartialFieldInfo[] {
        const fields: PartialFieldInfo[] = [];
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            const value = this[key as keyof this];
            if (value instanceof ValueWrapper) {
                fields.push(value.getField(innerKey));
            }
            if (value instanceof ProtoBufBase) {
                fields.push({
                    no: value._fieldId,
                    name: innerKey,
                    kind: 'message',
                    T: () => new MessageType(key, value.generateFields()),
                    repeat: RepeatType.NO,
                    opt: false,
                });
            }
        }
        return fields;
    }

    public assignFields(fields: { [key: string]: any }) {
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            let value = this[key as keyof this];
            if (value instanceof ValueWrapper) {
                const fieldValue = fields[innerKey];
                if (fieldValue !== undefined) {
                    value.value = fieldValue;
                }
            } else if (value instanceof ProtoBufBase) {
                const fieldValue = fields[innerKey];
                if (fieldValue !== undefined) {
                    value.assignFields(fieldValue);
                }
            } else {
                const fieldValue = fields[innerKey];
                if (fieldValue !== undefined) {
                    this[key as keyof this] = fieldValue;
                }
            }
        }
    }

    public toObject(): { [key: string]: any } {
        const obj: { [key: string]: any } = {};
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            const value = this[key as keyof this];
            if (value) {
                if (value instanceof ValueWrapper) {
                    obj[innerKey] = value.value;
                }
                if (value instanceof ProtoBufBase) {
                    obj[innerKey] = value.toObject();
                }
            }
        }
        return obj;
    }

    public encode(): Uint8Array {
        return new MessageType("message", this.generateFields()).toBinary(this.toObject());
    }

    public decode(data: Uint8Array): ProtoBufBase {
        const pbData = new MessageType("message", this.generateFields()).fromBinary(data);
        Object.assign(this, pbData);
        return this;
    }
}

export function proxyClassProtobuf<T extends ProtoBufBase>(protobuf: T) {
    return new Proxy(protobuf, {
        set(target, prop, value) {
            const targetValue = target[prop as keyof T];
            if (targetValue instanceof ValueWrapper) {
                const WrapperClass = autoTypeToClass(targetValue.getTypeName());
                target[prop as keyof T] = new WrapperClass(targetValue._fieldId, value, targetValue._opt);
                return true;
            }
            target[prop as keyof T] = value;
            return true;
        },
        get(target, prop) {
            if (typeof prop === "string" && prop.startsWith("_")) {
                const key = prop.slice(1);
                if (target[key as keyof T]) {
                    return target[key as keyof T];
                }
            }
            const targetValue = target[prop as keyof T];
            if (targetValue instanceof ValueWrapper) {
                return targetValue.value;
            }
            return targetValue;
        }
    }) as T;
}

// 代理创建工具
export function ProtoBuf<T extends ProtoBufBase>(field: number, valueClass: new () => T): T;
export function ProtoBuf<T extends ProtoBufBase>(valueClass: new () => T): T;
export function ProtoBuf<T extends ProtoBufBase>(data: number | (new () => T), valueClass?: new () => T): T {
    const dataClass = proxyClassProtobuf(valueClass ? new valueClass() : new (data as new () => T)());
    dataClass._fieldId = typeof data === "number" ? data : 0;
    return dataClass;
}
export function ProtoBufEx<T extends ProtoBufBase>(valueClass: new () => T, value: ExtractSchema<T>): T {
    const dataClass = proxyClassProtobuf(new valueClass());
    dataClass.assignFields(value);
    return dataClass;
}
export function ProtoBufQuick<T>(pb: T, data: T) {
    let protobuf = class extends ProtoBufBase { };
    const instance = ProtoBuf(protobuf);
    Object.assign(instance, pb);
    instance.assignFields(data);
    return instance;
}
export function ProtoBufIn<T>(data: T) {
    return proxyClassProtobuf(new class extends ProtoBufBase { constructor() { super(); Object.assign(this, data); } } as T & ProtoBufBase);
}