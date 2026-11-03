import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";

// findBy*/waitFor esperan 1 s por defecto; en Windows algunas pantallas tardan
// más en renderizar y los tests fallaban por tiempo, no por un error real.
configure({ asyncUtilTimeout: 3000 });
