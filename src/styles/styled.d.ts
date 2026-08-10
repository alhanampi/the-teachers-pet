import "styled-components";
import type { AppTheme } from "./theme";

declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required shape for styled-components theme augmentation
  export interface DefaultTheme extends AppTheme {}
}
