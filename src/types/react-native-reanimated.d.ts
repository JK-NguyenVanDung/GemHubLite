declare module "react-native-reanimated" {
  export type SharedValue<Value = unknown> = {
    value: Value;
    get: () => Value;
    set: (value: Value) => void;
  };
}
