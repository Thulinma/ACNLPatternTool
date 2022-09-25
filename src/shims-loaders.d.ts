declare module "*.module.css";

declare module "*.scss" {
  const value: Record<string, string>;
  export default value;
}

declare module "*.sass" {
  const value: Record<string, string>;
  export default value;
}

declare module "*.md" {
  import Vue from "vue"
  export default Vue;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.svg?inline" {
  import Vue from "vue";
  export default Vue;
}

declare module "*.gif" {
  const value: string;
  export default value;
}

declare module "*.gltf" {
  const value: string;
  export default value;
}

declare module "*.csv" {
  const value: string;
  export default value;
}