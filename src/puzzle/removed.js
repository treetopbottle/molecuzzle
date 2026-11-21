// Puzzles taken out of the game, kept for reference: no Puzzle may have the
// id or the formula of one of them (Puzzle.06, decision 0022). Nothing in
// the game imports this; the tests do. In the order of the spec's table of
// removed Puzzles.
export const REMOVED = [
  {
    id: "ammonia", name: "Ammonia", formula: "NH3",
    fact: "Ammonia is made from the nitrogen in air on a huge scale, mostly for fertilisers.",
    rows: 3, cols: 2,
    atoms: [["H",0,0],["N",1,0],["H",1,1],["H",2,0]],
    solution: [[0,1,1],[1,2,1],[1,3,1]],
  },
  {
    id: "carbon-disulfide", name: "Carbon disulfide", formula: "CS2",
    fact: "Carbon disulfide turns the cellulose of wood into viscose, which is spun into rayon and cast into cellophane.",
    rows: 3, cols: 1,
    atoms: [["S",0,0],["C",1,0],["S",2,0]],
    solution: [[0,1,2],[1,2,2]],
  },
  {
    id: "chloroform", name: "Chloroform", formula: "CHCl3",
    fact: "Chloroform was one of the first anaesthetics, from 1847, until safer ones replaced it.",
    rows: 3, cols: 3,
    atoms: [["Cl",0,1],["H",1,0],["C",1,1],["Cl",1,2],["Cl",2,1]],
    solution: [[0,2,1],[1,2,1],[2,3,1],[2,4,1]],
  },
  {
    id: "methanethiol", name: "Methanethiol", formula: "CH4S",
    fact: "Methanethiol smells of rotten cabbage, and is one of the gases behind bad breath.",
    rows: 3, cols: 3,
    atoms: [["H",0,0],["H",0,1],["S",1,0],["C",1,1],["H",1,2],["H",2,1]],
    solution: [[0,2,1],[1,3,1],[2,3,1],[3,4,1],[3,5,1]],
  },
  {
    id: "phosgene", name: "Phosgene", formula: "CCl2O",
    fact: "Phosgene was a poison gas in the First World War; today it is made on a large scale to make plastics such as polycarbonate.",
    rows: 3, cols: 2,
    atoms: [["Cl",0,1],["Cl",1,0],["C",1,1],["O",2,1]],
    solution: [[0,2,1],[1,2,1],[2,3,2]],
  },
  {
    id: "vinyl-chloride", name: "Vinyl chloride", formula: "C2H3Cl",
    fact: "Vinyl chloride is the building block of PVC, used for pipes, window frames and cables.",
    rows: 3, cols: 2,
    atoms: [["Cl",0,0],["H",0,1],["C",1,0],["C",1,1],["H",2,0],["H",2,1]],
    solution: [[0,2,1],[1,3,1],[2,3,2],[2,4,1],[3,5,1]],
  },
  {
    id: "tetrafluoroethylene", name: "Tetrafluoroethylene", formula: "C2F4",
    fact: "Tetrafluoroethylene is the building block of PTFE, better known as Teflon, the coating of non-stick pans.",
    rows: 3, cols: 2,
    atoms: [["F",0,0],["F",0,1],["C",1,0],["C",1,1],["F",2,0],["F",2,1]],
    solution: [[0,2,1],[1,3,1],[2,3,2],[2,4,1],[3,5,1]],
  },
  {
    id: "iodoethane", name: "Iodoethane", formula: "C2H5I",
    fact: "Iodoethane slowly turns brown in the light, as it breaks down and frees iodine.",
    rows: 3, cols: 4,
    atoms: [["H",0,1],["I",0,2],["H",1,0],["C",1,1],["C",1,2],["H",1,3],["H",2,1],["H",2,2]],
    solution: [[0,3,1],[1,4,1],[2,3,1],[3,4,1],[3,6,1],[4,5,1],[4,7,1]],
  },
];
