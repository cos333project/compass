import { addMonths } from "date-fns";
import { format } from "date-fns";
import { eachMonthOfInterval } from "date-fns";
import { startOfMonth } from "date-fns";

export const heads = [0, 1, 2, 3];

const start = startOfMonth(new Date());
const end = addMonths(start, 11);
export const months = eachMonthOfInterval({
  start,
  end
}).map((date) => format(date, "MMMM yyyy"));

export const projects = [
  "Project A",
  "Project B",
  "Project C",
  "Project D",
  "Project F",
  "Project G",
  "Project H",
  "Project I",
  "Project J",
  "Project K",
  "Project L",
  "Project M",
  "Project N",
  "Project O",
  "Project P",
  "Project Q",
  "Project R",
  "Project S",
  "Project T",
  "Project U",
  "Project V",
  "Project W",
  "Project X",
  "Project Y",
  "Project Z"
];

export const people = [
  "Amira",
  "Bodo",
  "Christine",
  "Christoph",
  "Filipé",
  "Flora",
  "Florian",
  "Kerstin",
  "Lester",
  "Lola",
  "Marak",
  "Margot",
  "Markin",
  "Max",
  "Maxime",
  "Norbert",
  "Oswald",
  "Penelope",
  "Petra",
  "Pierre",
  "Raymond",
  "Regine",
  "Suzanne",
  "Tristan"
];
