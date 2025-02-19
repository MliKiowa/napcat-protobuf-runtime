import { RepeatType, ScalarType } from '@protobuf-ts/runtime';
// 类型提取工具
export type ExtractType<T> =
    T extends ArrayWrapper<infer V> ? V[] :
    T extends ValueWrapper<infer U> ? U :
    never;
export type ExtractSchema<T> = {
    [K in keyof T]: ExtractType<T[K]>;
};

// 类型映射工具
export function autoType2Class(typename: string) {
    switch (typename) {
        case "UInt32Wrapper":
            return UInt32Wrapper;
        case "Int32Wrapper":
            return Int32Wrapper;
        case "Int64Wrapper":
            return Int64Wrapper;
        case "UInt64Wrapper":
            return UInt64Wrapper;
        case "StringWrapper":
            return StringWrapper;
        case "ArrayWrapper":
            return ArrayWrapper;
        default:
            return UnknowWrapper;
    }
}
// 类型映射工具
function autoType2Scalar(typename: string) {
    switch (typename) {
        case "UInt32Wrapper":
            return ScalarType.UINT32;
        case "Int32Wrapper":
            return ScalarType.INT32;
        case "Int64Wrapper":
            return ScalarType.INT64;
        case "UInt64Wrapper":
            return ScalarType.UINT64;
        case "StringWrapper":
            return ScalarType.STRING;
        case "ArrayWrapper":
            return ScalarType.UINT32;
        case "BytesWrapper":
            return ScalarType.BYTES;
        case "BoolWrapper":
            return ScalarType.BOOL;
        default:
            return ScalarType.BYTES;
    }
}
export function autoType2Field(key: string, dataValue: ValueWrapper<unknown>) {
    let typename = dataValue.getTypeName();
    let no = dataValue.getFieldId();
    let opt = dataValue._opt;
    switch (typename) {
        case "UInt32Wrapper":
        case "Int32Wrapper":
        case "Int64Wrapper":
        case "UInt64Wrapper":
        case "BoolWrapper":
        case "BytesWrapper":
        case "StringWrapper":
            return {
                no: no,
                name: key,
                kind: 'scalar',
                T: autoType2Scalar(typename),
                opt: opt || false,
                repeat: RepeatType.NO,
            };
        case "ArrayWrapper":
            let item = dataValue._callback();
            if ("generateFields" in item) {
                return {
                    no: no,
                    name: key,
                    kind: 'message',
                    T: () => item.generateFields(),
                    opt: opt || false,
                    repeat: RepeatType.PACKED,
                };
            }
            if (item instanceof ValueWrapper) {
                let item_type = item.getTypeName();
                return {
                    no: no,
                    name: key,
                    kind: 'scalar',
                    T: key,
                    opt: opt || false,
                    repeat: item_type === "StringWrapper" || item_type === "BytesWrapper" ? RepeatType.UNPACKED : RepeatType.PACKED,
                };
            }
            throw new Error("ArrayWrapper item type error");
        default:
            return UnknowWrapper;
    }
}
// 包装值类型转换类
export function proxyClass2Value<T extends ValueWrapper<any>>(data: T): ExtractType<T> {
    return new Proxy(data, {
        set(target, _prop, value) {
            const WrapperClass = autoType2Class(target.getTypeName());
            target.value = new WrapperClass(target._fieldId, value, target._opt) as T;
            return true;
        },
        get(target, prop) {
            if (prop === "value") {
                return target.value;
            }
            return (target as any)[prop];
        }
    }) as unknown as ExtractType<T>;
}
// 值包装类
class ValueWrapper<T> {
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
        return autoType2Field(key, this);
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
export class UnknowWrapper extends ValueWrapper<any> { }

// 默认值创建构造类
export function PBArray<T>(field: number = 0, data: T, opt: boolean = false) {
    return proxyClass2Value(new ArrayWrapper<T>(field, [], opt, () => { return data }));
}
export function PBUint32(field: number = 0, opt: boolean = false) {
    return proxyClass2Value(new UInt32Wrapper(field, 0, opt));
}
export function PBInt32(field: number = 0, opt: boolean = false) {
    return proxyClass2Value(new Int32Wrapper(field, 0, opt));
}
export function PBInt64(field: number = 0, opt: boolean = false) {
    return proxyClass2Value(new Int64Wrapper(field, BigInt(0), opt));
}
export function PBUint64(field: number = 0, opt: boolean = false) {
    return proxyClass2Value(new UInt64Wrapper(field, BigInt(0), opt));
}
export function PBString(field: number = 0, opt: boolean = false) {
    return proxyClass2Value(new StringWrapper(field, "", opt));
}

// Protobuf标记类
export class ProtoBufBase {
    [key: string]: any;
    public field: number = 0;
    //默认标记类
    public generateFields(): any {
        const fields: Array<any> = [];
        for (const key of Object.keys(this)) {
            if (this[key] instanceof ValueWrapper) {
                fields.push((this[key] as ValueWrapper<any>).getField(key));
            }
            if (this[key] instanceof ProtoBufBase) {
                fields.push({
                    no: (this[key] as ProtoBufBase).field,
                    name: key,
                    kind: 'message',
                    T: () => (this[key] as ProtoBufBase).generateFields(),
                    repeat: RepeatType.NO,
                    opt: false,
                });
            }
        }
        return fields;
    }
    public encode(): Uint8Array {
        return new Uint8Array();
    }
    public decode(): ProtoBufBase {
        return this;
    }
}

// 代理创建工具
export function ProtoBuf<T extends ProtoBufBase>(field: number, valueClass: new () => T): T
export function ProtoBuf<T extends ProtoBufBase>(valueClass: new () => T): T
export function ProtoBuf<T extends ProtoBufBase>(data: number | (new () => T), valueClass?: new () => T): T {
    let dataclass = valueClass ? new valueClass() : new (data as new () => T)();
    dataclass.field = typeof data === "number" ? data : 0;
    return dataclass;
}