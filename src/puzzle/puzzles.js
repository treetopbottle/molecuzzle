// The puzzles, in order of difficulty, easiest first, and a new one after
// those of the same difficulty (decisions 0021, 0024). Atoms are [Element,
// row, column, hydrogens], in reading order, each with the hydrogens bonded
// to it from the start; the solution lists [atom, atom, Bond order].
// Layouts come from scripts/generate.js; tests check each has exactly this
// one solution.
export const PUZZLES = [
  {
    id: "acetonitrile", name: "Acetonitrile", formula: "C2H3N",
    fact: "Acetonitrile has been found around young stars and in comets; on Earth it is a common solvent in labs.",
    rows: 3, cols: 1,
    atoms: [["C",0,0,3],["C",1,0,0],["N",2,0,0]],
    solution: [[0,1,1],[1,2,3]],
  },
  {
    id: "acetic-acid", name: "Acetic acid", formula: "C2H4O2",
    fact: "Vinegar is acetic acid in water, about 4 to 8% of it.",
    rows: 3, cols: 2,
    atoms: [["O",0,1,0],["C",1,0,3],["C",1,1,0],["O",2,1,1]],
    solution: [[0,2,2],[1,2,1],[2,3,1]],
  },
  {
    id: "glycine", name: "Glycine", formula: "C2H5NO2",
    fact: "Glycine is the simplest amino acid, one of the building blocks of proteins. Traces have even been found in samples from comets.",
    rows: 3, cols: 2,
    atoms: [["O",0,0,1],["N",0,1,2],["C",1,0,0],["C",1,1,2],["O",2,0,0]],
    solution: [[0,2,1],[1,3,1],[2,3,1],[2,4,2]],
  },
  {
    id: "glycerol", name: "Glycerol", formula: "C3H8O3",
    fact: "Glycerol is the backbone of fats and oils; it keeps soaps, creams and toothpaste moist.",
    rows: 3, cols: 2,
    atoms: [["O",0,0,1],["C",0,1,2],["C",1,0,2],["C",1,1,1],["O",2,0,1],["O",2,1,1]],
    solution: [[0,1,1],[1,3,1],[2,3,1],[2,4,1],[3,5,1]],
  },
  {
    id: "morpholine", name: "Morpholine", formula: "C4H9NO",
    fact: "A little morpholine in the water of power-station boilers keeps their steam pipes from rusting.",
    rows: 3, cols: 2,
    atoms: [["N",0,0,1],["C",0,1,2],["C",1,0,2],["C",1,1,2],["C",2,0,2],["O",2,1,0]],
    solution: [[0,1,1],[0,2,1],[1,3,1],[2,4,1],[3,5,1],[4,5,1]],
  },
  {
    id: "cyclohexene", name: "Cyclohexene", formula: "C6H10",
    fact: "Shaken with orange bromine water, cyclohexene turns it colourless: the classic test for a carbon–carbon double bond.",
    rows: 3, cols: 2,
    atoms: [["C",0,0,2],["C",0,1,2],["C",1,0,2],["C",1,1,2],["C",2,0,1],["C",2,1,1]],
    solution: [[0,1,1],[0,2,1],[1,3,1],[2,4,1],[3,5,1],[4,5,2]],
  },
  {
    id: "serine", name: "Serine", formula: "C3H7NO3",
    fact: "Serine is the amino acid at the heart of many enzymes that cut up proteins, such as trypsin in your gut.",
    rows: 4, cols: 2,
    atoms: [["N",0,0,2],["O",0,1,1],["C",1,0,1],["C",1,1,2],["C",2,0,0],["O",2,1,1],["O",3,0,0]],
    solution: [[0,2,1],[1,3,1],[2,3,1],[2,4,1],[4,5,1],[4,6,2]],
  },
  {
    id: "1-4-benzoquinone", name: "1,4-Benzoquinone", formula: "C6H4O2",
    fact: "Bombardier beetles spray a boiling mix of benzoquinones at their attackers.",
    rows: 3, cols: 4,
    atoms: [["C",0,1,1],["C",0,2,1],["O",1,0,0],["C",1,1,0],["C",1,2,0],["O",1,3,0],["C",2,1,1],["C",2,2,1]],
    solution: [[0,1,2],[0,3,1],[1,4,1],[2,3,2],[3,6,1],[4,5,2],[4,7,1],[6,7,2]],
  },
  {
    id: "malic-acid", name: "Malic acid", formula: "C4H6O5",
    fact: "Malic acid makes green apples sour; its name comes from malum, Latin for apple.",
    rows: 3, cols: 4,
    atoms: [["O",0,1,0],["C",0,2,0],["O",0,3,1],["O",1,1,1],["C",1,2,2],["O",2,0,0],["C",2,1,0],["C",2,2,1],["O",2,3,1]],
    solution: [[0,1,2],[1,2,1],[1,4,1],[3,6,1],[4,7,1],[5,6,2],[6,7,1],[7,8,1]],
  },
  {
    id: "tartaric-acid", name: "Tartaric acid", formula: "C4H6O6",
    fact: "Tartaric acid comes from grapes. In 1848 Louis Pasteur sorted crystals of one of its salts by hand, and found that molecules can be left- or right-handed.",
    rows: 3, cols: 4,
    atoms: [["O",0,1,1],["O",0,2,1],["O",0,3,1],["C",1,1,1],["C",1,2,1],["C",1,3,0],["O",2,0,0],["C",2,1,0],["O",2,2,1],["O",2,3,0]],
    solution: [[0,3,1],[1,4,1],[2,5,1],[3,4,1],[3,7,1],[4,5,1],[5,9,2],[6,7,2],[7,8,1]],
  },
  {
    id: "glutamic-acid", name: "Glutamic acid", formula: "C5H9NO4",
    fact: "Glutamic acid gives food its savoury umami taste; its sodium salt is MSG.",
    rows: 4, cols: 3,
    atoms: [["N",0,0,2],["O",0,1,1],["C",1,0,1],["C",1,1,0],["O",1,2,0],["C",2,0,2],["C",2,1,2],["O",3,0,1],["C",3,1,0],["O",3,2,0]],
    solution: [[0,2,1],[1,3,1],[2,3,1],[2,5,1],[3,4,2],[5,6,1],[6,8,1],[7,8,1],[8,9,2]],
  },
  {
    id: "glucose", name: "Glucose", formula: "C6H12O6",
    fact: "Glucose is the sugar your cells run on; in water most of it curls up into this ring of five carbons and an oxygen.",
    rows: 3, cols: 5,
    atoms: [["O",0,0,1],["C",0,1,1],["C",0,2,1],["O",0,3,1],["O",1,0,1],["C",1,1,1],["C",1,2,1],["O",1,3,1],["O",2,1,0],["C",2,2,1],["C",2,3,2],["O",2,4,1]],
    solution: [[0,1,1],[1,2,1],[1,5,1],[2,3,1],[2,6,1],[4,5,1],[5,8,1],[6,7,1],[6,9,1],[8,9,1],[9,10,1],[10,11,1]],
  },
  {
    id: "citric-acid", name: "Citric acid", formula: "C6H8O7",
    fact: "Citric acid makes lemons sour, and is at the heart of the cycle in which your cells burn food for energy.",
    rows: 6, cols: 3,
    atoms: [["O",0,0,0],["O",0,1,1],["C",1,1,0],["O",1,2,0],["C",2,1,2],["C",3,0,0],["C",3,1,0],["O",3,2,1],["O",4,0,1],["C",4,1,2],["O",5,0,0],["C",5,1,0],["O",5,2,1]],
    solution: [[0,5,2],[1,2,1],[2,3,2],[2,4,1],[4,6,1],[5,6,1],[5,8,1],[6,7,1],[6,9,1],[9,11,1],[10,11,2],[11,12,1]],
  },
  {
    id: "n-acetylglucosamine", name: "N-Acetylglucosamine", formula: "C8H15NO6",
    fact: "N-Acetylglucosamine is a glucose with an acetyl-amine in place of one OH; strung together, it makes chitin, the armour of insects and crabs and the walls of fungi.",
    rows: 5, cols: 5,
    atoms: [["O",0,4,0],["O",1,0,1],["O",1,1,1],["C",1,3,3],["C",1,4,0],["C",2,0,1],["C",2,1,1],["C",2,3,1],["N",2,4,1],["C",3,0,1],["O",3,1,0],["C",3,3,1],["O",3,4,1],["C",4,0,2],["O",4,3,1]],
    solution: [[0,4,2],[1,5,1],[2,6,1],[3,4,1],[4,8,1],[5,6,1],[5,9,1],[6,7,1],[7,8,1],[7,11,1],[9,10,1],[9,13,1],[10,11,1],[11,12,1],[13,14,1]],
  },
  {
    id: "biotin", name: "Biotin", formula: "C10H16N2O3S",
    fact: "Biotin is vitamin B7, which your cells need to build and break down fats; the avidin in raw egg white binds it so tightly that a diet of raw eggs can cause a shortage.",
    rows: 5, cols: 5,
    atoms: [["C",0,0,2],["S",0,1,0],["C",0,2,1],["C",0,4,2],["C",1,0,1],["C",1,2,1],["N",1,3,1],["C",1,4,2],["N",2,0,1],["C",2,3,0],["O",3,2,0],["O",3,3,0],["O",4,1,1],["C",4,2,0],["C",4,3,2],["C",4,4,2]],
    solution: [[0,1,1],[0,4,1],[1,2,1],[2,3,1],[2,5,1],[3,7,1],[4,5,1],[4,8,1],[5,6,1],[6,9,1],[7,15,1],[8,9,1],[9,11,2],[10,13,2],[12,13,1],[13,14,1],[14,15,1]],
  },
];
