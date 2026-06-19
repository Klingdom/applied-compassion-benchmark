// Composite builder for University Index entity list.
// Sources: THE 2026 (1-100), QS 2026 (1-100), ARWU 2025 (1-100).
// Method: canonicalize names -> per-source rank. Missing-from-top100 = 101 penalty.
// Composite key = average of three ranks (lower better). Tie-break:
//   1) more list appearances first, 2) lower average rank, 3) alphabetical.

const THE = [
  ["University of Oxford",1],["Massachusetts Institute of Technology",2],["Princeton University",3],
  ["University of Cambridge",3],["Harvard University",5],["Stanford University",5],
  ["California Institute of Technology",7],["Imperial College London",8],["University of California, Berkeley",9],
  ["Yale University",10],["ETH Zurich",11],["Tsinghua University",12],["Peking University",13],
  ["University of Pennsylvania",14],["University of Chicago",15],["Johns Hopkins University",16],
  ["National University of Singapore",17],["Cornell University",18],["University of California, Los Angeles",18],
  ["Columbia University",20],["University of Toronto",21],["University College London",22],
  ["University of Michigan",23],["Carnegie Mellon University",24],["University of Washington",25],
  ["University of Tokyo",26],["Technical University of Munich",27],["Duke University",28],
  ["University of Edinburgh",29],["Northwestern University",30],["Nanyang Technological University",31],
  ["New York University",31],["University of Hong Kong",33],["LMU Munich",34],
  ["EPFL",35],["Fudan University",36],["University of Melbourne",37],["King's College London",38],
  ["Zhejiang University",39],["Shanghai Jiao Tong University",40],["Georgia Institute of Technology",41],
  ["McGill University",41],["Chinese University of Hong Kong",41],["University of Illinois Urbana-Champaign",41],
  ["University of British Columbia",45],["KU Leuven",46],["University of California, San Diego",47],
  ["PSL University",48],["Heidelberg University",49],["University of Texas at Austin",50],
  ["University of Science and Technology of China",51],["London School of Economics and Political Science",52],
  ["Karolinska Institute",53],["University of Sydney",53],["University of Wisconsin-Madison",53],
  ["University of Manchester",56],["Delft University of Technology",57],["Monash University",58],
  ["Seoul National University",58],["Hong Kong University of Science and Technology",58],
  ["Kyoto University",61],["Nanjing University",62],["University of Amsterdam",62],
  ["University of California, Davis",64],["Brown University",65],["Wageningen University & Research",66],
  ["Washington University in St. Louis",67],["Institut Polytechnique de Paris",68],["Paris-Saclay University",68],
  ["KAIST",70],["Leiden University",70],["University of California, Santa Barbara",72],
  ["Australian National University",73],["City University of Hong Kong",73],["University of Southern California",73],
  ["Boston University",76],["Sorbonne University",76],["University of North Carolina at Chapel Hill",78],
  ["UNSW Sydney",79],["Hong Kong Polytechnic University",80],["University of Queensland",80],
  ["University of Bristol",80],["University of Groningen",82],["University of Glasgow",84],
  ["Purdue University",85],["Yonsei University",86],["Sungkyunkwan University",87],
  ["University of Minnesota",88],["Humboldt University of Berlin",89],["University of Copenhagen",90],
  ["Charite - Universitatsmedizin Berlin",91],["RWTH Aachen University",92],["University of Bonn",92],
  ["Vanderbilt University",92],["Lund University",95],["University of Vienna",95],
  ["University of California, Irvine",97],["KTH Royal Institute of Technology",98],["University of Birmingham",98],
  ["University of Tubingen",98],
];

const QS = [
  ["Massachusetts Institute of Technology",1],["Imperial College London",2],["Stanford University",3],
  ["University of Oxford",4],["Harvard University",5],["University of Cambridge",6],["ETH Zurich",7],
  ["National University of Singapore",8],["University College London",9],["California Institute of Technology",10],
  ["University of Hong Kong",11],["Nanyang Technological University",12],["University of Chicago",13],
  ["Peking University",14],["University of Pennsylvania",15],["Cornell University",16],
  ["Tsinghua University",17],["University of California, Berkeley",17],["University of Melbourne",19],
  ["UNSW Sydney",20],["Yale University",21],["EPFL",22],["Technical University of Munich",22],
  ["Johns Hopkins University",24],["Princeton University",25],["University of Sydney",25],
  ["McGill University",27],["PSL University",28],["University of Toronto",29],["Fudan University",30],
  ["King's College London",31],["Australian National University",32],["Chinese University of Hong Kong",32],
  ["University of Edinburgh",34],["University of Manchester",35],["Monash University",36],
  ["University of Tokyo",36],["Seoul National University",38],["Columbia University",38],
  ["University of British Columbia",40],["Institut Polytechnique de Paris",41],["Northwestern University",42],
  ["University of Queensland",42],["Hong Kong University of Science and Technology",44],["University of Michigan",45],
  ["University of California, Los Angeles",46],["Delft University of Technology",47],["Shanghai Jiao Tong University",47],
  ["Zhejiang University",49],["Yonsei University",50],["University of Bristol",51],["Carnegie Mellon University",52],
  ["University of Amsterdam",53],["Hong Kong Polytechnic University",54],["New York University",55],
  ["London School of Economics and Political Science",56],["Kyoto University",57],["LMU Munich",58],
  ["University of Malaya",58],["KU Leuven",60],["Korea University",61],["Duke University",62],
  ["City University of Hong Kong",63],["National Taiwan University",63],["University of Auckland",65],
  ["University of California, San Diego",66],["King Fahd University of Petroleum & Minerals",67],
  ["University of Texas at Austin",68],["Brown University",69],["University of Illinois Urbana-Champaign",70],
  ["Paris-Saclay University",70],["Lund University",72],["Sorbonne University",72],["University of Warwick",74],
  ["Trinity College Dublin",75],["University of Birmingham",76],["University of Western Australia",77],
  ["KTH Royal Institute of Technology",78],["University of Glasgow",79],["Heidelberg University",80],
  ["University of Washington",81],["University of Adelaide",82],["Pennsylvania State University",82],
  ["University of Buenos Aires",84],["Tokyo Institute of Technology",85],["University of Leeds",86],
  ["University of Southampton",87],["Boston University",88],["Free University of Berlin",88],
  ["Purdue University",88],["Osaka University",91],["University of Sheffield",92],["Uppsala University",93],
  ["Durham University",94],["University of Alberta",94],["University of Technology Sydney",96],
  ["University of Nottingham",97],["Karlsruhe Institute of Technology",98],["Polytechnic University of Milan",98],
  ["University of Zurich",100],
];

const ARWU = [
  ["Harvard University",1],["Stanford University",2],["Massachusetts Institute of Technology",3],
  ["University of Cambridge",4],["University of California, Berkeley",5],["University of Oxford",6],
  ["Princeton University",7],["Columbia University",8],["California Institute of Technology",9],
  ["University of Chicago",10],["Yale University",11],["Cornell University",12],["Paris-Saclay University",13],
  ["University College London",14],["University of Pennsylvania",14],["University of California, Los Angeles",16],
  ["University of Washington",17],["Tsinghua University",18],["Johns Hopkins University",19],
  ["University of California, San Diego",20],["University of California, San Francisco",21],["ETH Zurich",22],
  ["Peking University",23],["Zhejiang University",24],["University of Toronto",25],["Imperial College London",26],
  ["Washington University in St. Louis",26],["New York University",28],["Rockefeller University",29],
  ["Shanghai Jiao Tong University",30],["Northwestern University",31],["University of Tokyo",31],
  ["University of Michigan",33],["PSL University",34],["University of Copenhagen",35],
  ["University of Wisconsin-Madison",36],["University of Edinburgh",37],["University of Melbourne",38],
  ["University of North Carolina at Chapel Hill",39],["University of Science and Technology of China",40],
  ["Fudan University",41],["LMU Munich",42],["Sorbonne University",43],["EPFL",44],
  ["Technical University of Munich",45],["Duke University",46],["Kyoto University",46],["University of Manchester",46],
  ["University of Texas at Austin",49],["Karolinska Institute",50],["Heidelberg University",51],
  ["University of Minnesota",51],["University of British Columbia",53],["University of Illinois Urbana-Champaign",53],
  ["University of Maryland, College Park",55],["National University of Singapore",56],["Utrecht University",56],
  ["University of Geneva",58],["UT Southwestern Medical Center",58],["Universite Paris Cite",60],
  ["King's College London",61],["University of Colorado Boulder",62],["Vanderbilt University",62],
  ["University of Zurich",64],["Sun Yat-sen University",65],["University of Queensland",65],
  ["University of Hong Kong",67],["University of Bonn",68],["University of Southern California",68],
  ["University of California, Santa Barbara",70],["Weizmann Institute of Science",71],["University of Sydney",72],
  ["Huazhong University of Science and Technology",73],["University of Groningen",73],["Nanjing University",75],
  ["KU Leuven",76],["McGill University",76],["Monash University",76],["University of California, Irvine",79],
  ["UNSW Sydney",80],["Seoul National University",81],["Wuhan University",81],["Ohio State University",83],
  ["University of Oslo",83],["Aarhus University",85],["UT MD Anderson Cancer Center",86],
  ["Sichuan University",87],["Nanyang Technological University",88],["Hebrew University of Jerusalem",88],
  ["University of Pittsburgh",88],["Ghent University",91],["Xi'an Jiaotong University",92],
  ["Uppsala University",93],["University of Basel",94],["University of Helsinki",94],
  ["Central South University",96],["Technion - Israel Institute of Technology",97],["University of Bristol",98],
  ["City University of Hong Kong",99],["Stockholm University",100],
];

const PENALTY = 101;
const map = new Map();
function add(list, key) {
  for (const [name, rank] of list) {
    if (!map.has(name)) map.set(name, { name, the: PENALTY, qs: PENALTY, arwu: PENALTY, apps: 0 });
    const e = map.get(name);
    e[key] = rank; e.apps += 1;
  }
}
add(THE, "the"); add(QS, "qs"); add(ARWU, "arwu");

const rows = [...map.values()].map(e => {
  e.avg = (e.the + e.qs + e.arwu) / 3;
  return e;
});
rows.sort((a, b) => {
  if (b.apps !== a.apps) return b.apps - a.apps;
  if (a.avg !== b.avg) return a.avg - b.avg;
  return a.name.localeCompare(b.name);
});

rows.forEach((e, i) => e.rank = i + 1);
const top = rows.slice(0, 110);
for (const e of top) {
  console.log(`${e.rank}\t${e.name}\tTHE:${e.the===PENALTY?'-':e.the}\tQS:${e.qs===PENALTY?'-':e.qs}\tARWU:${e.arwu===PENALTY?'-':e.arwu}\tavg:${e.avg.toFixed(1)}\tapps:${e.apps}`);
}
console.log("TOTAL UNIQUE:", rows.length);
