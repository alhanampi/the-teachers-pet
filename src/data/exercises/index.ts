import type { Exercise } from "../../types/exercise";
import a1 from "./a1.json";
import a2 from "./a2.json";
import b1 from "./b1.json";
import b2 from "./b2.json";
import c1 from "./c1.json";
import c2 from "./c2.json";

export const exercises = [...a1, ...a2, ...b1, ...b2, ...c1, ...c2] as Exercise[];
