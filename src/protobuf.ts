import { MessageType, RepeatType, ScalarType } from '@protobuf-ts/runtime';

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

    public getField(key: string) {
        return autoTypeToField(key, this);
    }
}

// 值衍生类
export class StringWrapper extends ValueWrapper<string> { }
export class UInt32Wrapper extends ValueWrapper<number> { }
export class Int32Wrapper extends ValueWrapper<number> { }
export class Int64Wrapper extends ValueWrapper<bigint> { }
export class UInt64Wrapper extends ValueWrapper<bigint> { }
export class ArrayWrapper<T> extends ValueWrapper<T[]> { }
export class BoolWrapper extends ValueWrapper<boolean> { }
export class BytesWrapper extends ValueWrapper<Uint8Array> { }
export class UnknownWrapper extends ValueWrapper<any> { }

// 类型提取工具
export type ExtractType<T> =
    T extends ArrayWrapper<infer V> ? V[] :
    T extends ValueWrapper<infer U> ? U :
    T extends ProtoBufBase ? ExtractSchema<T> :
    T;

export type ExtractSchema<T> = Omit<{
    [K in keyof T]: T[K] extends ProtoBufBase ? ExtractSchema<T[K]> : ExtractType<T[K]>;
}, keyof ProtoBufBase>;

// 类型映射工具
const typeMap: { [key: string]: any } = {
    "UInt32Wrapper": UInt32Wrapper,
    "Int32Wrapper": Int32Wrapper,
    "Int64Wrapper": Int64Wrapper,
    "UInt64Wrapper": UInt64Wrapper,
    "StringWrapper": StringWrapper,
    "ArrayWrapper": ArrayWrapper,
    "BoolWrapper": BoolWrapper,
    "BytesWrapper": BytesWrapper,
};

const scalarMap: { [key: string]: ScalarType } = {
    "UInt32Wrapper": ScalarType.UINT32,
    "Int32Wrapper": ScalarType.INT32,
    "Int64Wrapper": ScalarType.INT64,
    "UInt64Wrapper": ScalarType.UINT64,
    "StringWrapper": ScalarType.STRING,
    "BytesWrapper": ScalarType.BYTES,
    "BoolWrapper": ScalarType.BOOL,
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
export function PBString(field: number = 0, opt: boolean = false) {
    return new StringWrapper(field, "", opt) as unknown as string;
}
export function PBBool(field: number = 0, opt: boolean = false) {
    return new BoolWrapper(field, false, opt) as unknown as boolean;
}
export function PBBytes(field: number = 0, opt: boolean = false) {
    return new BytesWrapper(field, new Uint8Array(), opt) as unknown as Uint8Array;
}

export function autoTypeToField(key: string, dataValue: ValueWrapper<unknown>) {
    const typeName = dataValue.getTypeName();
    const no = dataValue.getFieldId();
    const opt = dataValue._opt;
    if (typeName === "ArrayWrapper") {
        const item = dataValue._callback();
        if (item instanceof ProtoBufBase) {
            return {
                no,
                name: key,
                kind: 'message',
                T: () => new MessageType(key, item.generateFields()),
                opt: opt || false,
                repeat: RepeatType.PACKED,
            };
        }
        if (item instanceof ValueWrapper) {
            const itemType = item.getTypeName();
            return {
                no,
                name: key,
                kind: 'scalar',
                T: autoTypeToScalar(itemType),
                opt: opt || false,
                repeat: itemType === "StringWrapper" || itemType === "BytesWrapper" ? RepeatType.UNPACKED : RepeatType.PACKED,
            };
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
    };
}

// Protobuf标记类
export class ProtoBufBase {
    public _fieldId: number = 0;

    //默认标记类
    public generateFields(): any {
        const fields: Array<any> = [];
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            const value = (this as any)[key];
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

    public assignFields(fields: any) {
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            let value = (this as any)[key];
            if (value instanceof ValueWrapper) {
                const fieldValue = fields[innerKey];
                if (fieldValue !== undefined) {
                    value.value = fieldValue;
                }
            }
            if (value instanceof ProtoBufBase) {
                const fieldValue = fields[innerKey];
                if (fieldValue !== undefined) {
                    value.assignFields(fieldValue);
                }
            }
        }
    }

    public toObject(): any {
        const obj: any = {};
        for (const innerKey of Object.keys(this)) {
            const key = '_' + innerKey;
            const value = (this as any)[key];
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
        const pbData = new MessageType("message", this.generateFields()).toBinary(this.toObject());
        return pbData;
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
            const targetValue = (target as any)[prop];
            if (targetValue instanceof ValueWrapper) {
                const WrapperClass = autoTypeToClass(targetValue.getTypeName());
                (target as any)[prop] = new WrapperClass(targetValue._fieldId, value, targetValue._opt);
                return true;
            }
            (target as any)[prop] = value;
            return true;
        },
        get(target, prop) {
            if (typeof prop === "string" && prop.startsWith("_")) {
                const key = prop.slice(1);
                if ((target as any)[key]) {
                    return (target as any)[key];
                }
            }
            const targetValue = (target as any)[prop];
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