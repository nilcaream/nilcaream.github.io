var algorithms = {
    "2x2": {
        oll26: {
            hint: "size:backgroundColor:type:UUUU:FF:BB:LL:RR:aaaaaaaaa,aaaaaaaaa",
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R",
            nc: "t:2 u:WDDD f:WD r:WD b:WD l:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R%27U%27RU%27%20R%27U2R"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'",
            nc: "t:2 u:DDWD f:DW r:DW b:DW l:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=RUR%27U%20RU2R%27"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R2U2 R U2R2",
            nc: "t:2 u:DDDD f:WW r:DD b:WW l:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R2U2%20R%20U2R2"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "F (RUR'U')2 F'",
            nc: "t:2 u:DDDD f:DW r:DD b:WD l:WW",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20(RUR%27U%27)%20F%27"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "F (RUR'U') F'",
            nc: "t:2 u:DWDW f:DD r:DD b:DD l:WW",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20F%27"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'",
            alternatives: ["(RUR'U') R'F RF'"],
            nc: "t:2 u:DWDW f:WD r:DD b:DW l:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=(RUR%27U%27)%20R%27F%20RF%27"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "F' (RUR'U') R'FR",
            nc: "t:2 u:DWWD f:DW r:DD b:DD l:WD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%27%20(RUR%27U%27)%20R%27FR"
        },
        cll40: {
            id: "CLL 40",
            name: "T permutation",
            sequence: "RU2R'U' RU2L'U R'U'L",
            nc: "t:2 u:YYYY f:BR r:GB b:RG l:OO a:1010u1112",
            source: "https://www.speedsolving.com/wiki/index.php/PLL_(2x2x2)",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU2R%27U%27%20RU2L%27U%20R%27U%27L"
        },
        cll41: {
            id: "CLL 41",
            name: "Y permutation",
            sequence: "RU'R'U' F2U' RUR'D R2",
            nc: "t:2 u:YYYY f:RO r:BG b:OR l:GB a:0000u1122",
            source: "https://www.speedsolving.com/wiki/index.php/PLL_(2x2x2)",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU%27R%27U%27%20F2U%27%20RUR%27D%20R2"
        },
        cpllaa: {
            id: "CPLL Aa",
            name: "A permutation a",
            sequence: "R'F (R'B2 RF'R') B2R2",
            nc: "t:2 u:YYYY f:BG r:OB b:RR l:GO a:0000U1020,1020u1122,1122u0011",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=R%27%20F%20(R%27%20B2%20R%20F%27%20R%27)%20B2%20R2"
        },
        cpllab: {
            id: "CPLL Ab",
            name: "A permutation b",
            sequence: "RB'R F2 R'BR F2R2",
            nc: "t:2 u:YYYY f:GG r:OB b:RO l:BR a:0102U1122,1122u1020,1020u0111",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        pbl1: {
            id: "PBL 1",
            name: "Diagonal Column Swap",
            sequence: "R2 B2 R2",
            nc: "t:2 u:YDDY f:DD r:DD b:DD l:DD a:0002u1102,0020d1120",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=1"
        },
        pbl2: {
            id: "PBL 2",
            name: "Adjacent Column Swap",
            sequence: "R2U' B2U2 R2U' R2",
            nc: "t:2 u:YYDD f:DD r:DD b:DD l:DD a:0000u1020,0002d1022",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=2"
        },
        pbl5: {
            id: "PBL 5",
            name: "Adjacent U + Diagonal D",
            sequence: "RU'R F2 R'UR'",
            nc: "t:2 u:DDYY f:DD r:DD b:DD l:DD a:0102u1122,1111d0011",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=5"
        }
    },
    "3x3": {
        oll26: {
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R",
            nc: "t:3 u:WWDWWWDWD f:WDD r:WDD b:WDD l:DDD"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'",
            nc: "t:3 u:DWDWWWWWD f:DDW r:DDW b:DDW l:DDD"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R'U'RU' (R'URU') R'U2R",
            nc: "t:3 u:DWDWWWDWD f:DDD r:WDW b:DDD l:WDW"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "R U2R2 (U'R2U') R2U2 R",
            nc: "t:3 u:DWDWWWDWD f:DDW r:DDD b:WDD l:WDW"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "(R'U'RU' R'U2R)_(RUR'U RU2R')",
            nc: "t:3 u:DWDWWWWWW f:DDD r:DDD b:WDW l:DDD"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'",
            nc: "t:3 u:DWWWWWDWW f:WDD r:DDD b:DDW l:DDD"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "RU2R'U' (RUR'U')2 RU'R'",
            nc: "t:3 u:WWDWWWDWW f:DDD r:DDD b:WDD l:DDW"
        },
        cpllaa: {
            id: "CPLL Aa",
            name: "A permutation a",
            sequence: "R'F R'B2R F'R' B2R2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%27%20F%20(R%27%20B2%20R%20F%27%20R%27)%20B2%20R2",
            nc: "t:3 u:YYYYYYYYY f:GGB r:ROG b:OBO l:BRR a:0011U2011,2011u2211,2211u0022",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cpllab: {
            id: "CPLL Ab",
            name: "A permutation b",
            sequence: "RB'R F2 R'BR F2R2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%20B%27%20R%20F2%20R%27%20B%20R%20F2%20R2",
            nc: "t:3 u:YYYYYYYYY f:OGO r:BOR b:GBB l:RRG a:0211U2211,2211u2011,2011u0220",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cplle: {
            id: "CPLL E",
            name: "E Permutation",
            sequence: "R2UR'U' y (RUR'U')2_RUR' FU'F2",
            nc: "t:3 u:YYYYYYYYY f:OGR r:GOB b:RBO l:BRG a:0211u2211,0011u2011",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        pllt: {
            id: "PLL T",
            name: "T permutation",
            sequence: "RUR'U' R'FR2U'_R'U'RU R'F'",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%20U%20R%27%20U%27%20R%27%20F%20R2%20U%27%20R%27%20U%27%20R%20U%20R%27%20F%27",
            nc: "t:3 u:YYYYYYYYY f:GGO r:BRG b:OBB l:ROR a:0111u2111,2011u2211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        pllja: {
            id: "PLL Ja",
            name: "J permutation a",
            sequence: "R'L'U2 LUL'U2 RU'LU",
            nc: "t:3 u:YYYYYYYYY f:RRG r:OOO b:BBR l:GGB a:0111u1211,0011u0211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        plljb: {
            id: "PLL Jb",
            name: "J permutation b",
            sequence: "RU2R'U' RU2L'U R'U'L",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=RU2R%27U%27%20RU2L%27U%20R%27U%27L",
            nc: "t:3 u:YYYYYYYYY f:GOO r:BGG b:OBB l:RRR a:1211u2111,2011u2211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllh: {
            id: "EPLL H",
            name: "H permutation",
            sequence: "M2 U (M2 U2 M2) U M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M2%20U2%20M2)%20U%20M2",
            nc: "t:3 u:YYYYYYYYY f:GBG r:ORO b:BGB l:ROR a:1011u1211,0111u2111",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllua: {
            id: "EPLL Ua",
            name: "U permutation a",
            sequence: "M2 U (M'U2M) U M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M%27%20U2%20M)%20U%20M2",
            nc: "t:3 u:YYYYYYYYY f:GGG r:OBO b:BRB l:ROR a:0111U2111,2111u1011,1011u0120",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllub: {
            id: "EPLL Ub",
            name: "U permutation b",
            sequence: "M2 U' (M'U2M) U' M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%27%20(M%27%20U2%20M)%20U%27%20M2",
            nc: "t:3 u:YYYYYYYYY f:GGG r:ORO b:BOB l:RBR a:2111U0111,0111u1011,1011u2100",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllz: {
            id: "EPLL Z",
            name: "Z permutation",
            sequence: "M2 U (M' U2M2U2 M') U' M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M%27%20U2%20M2%20U2%20M%27)%20U%27%20M2",
            nc: "t:3 u:YYYYYYYYY f:GRG r:OBO b:BOB l:RGR a:0111u1211,1011u2111",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cfllb: {
            id: "CF LLb",
            name: "Last ledge DB",
            sequence: "UM' U2 M'U",
            nc: "t:3 u:GDGDDGGDG f:ODO r:YYY b:RDRRDRRWR l:WDW",
            source: "http://rubikscube.info/beginner.php"
        },
        cfllf: {
            id: "CF LLf",
            name: "Last ledge DF",
            sequence: "U'M U2 MU'",
            nc: "t:3 u:GDGDDGGDG f:ODOODOOWO r:YYY b:RDR l:WDW",
            source: "http://rubikscube.info/beginner.php"
        },
        cffm: {
            id: "CF FM",
            name: "Flip Midges",
            sequence: "(M'U)3 U (MU)3 U",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M%27UM%27UM%27U%20U%20MUMUMU%20Uxz%27",
            nc: "t:3 u:GRGGGGGOG f:OGO r:YYY b:RGR l:WWW a:1011u1211",
            source: "http://rubikscube.info/beginner.php"
        }
    },
    sq1: {
        fm: {
            id: "FM",
            name: "Flip middle",
            sequence: "/60/60/",
            nc: "t:1 u:00yYyYyYyY m:1WW",
            source: "http://www.cubezone.be/square1step6.html"
        },
        sud: {
            id: "SUD",
            name: "Swap UD",
            sequence: "10/66/",
            nc: "t:1 u:00wWwWwWwW a:005x003,035x033,065x063,095x093,125x123,155x153,185x183,215x213",
            source: "http://www.cubezone.be/square1step6.html"
        },
        sf: {
            id: "SF",
            name: "Swap UD + Flip M",
            sequence: "/60/06/",
            nc: "t:1 u:00wWwWwWwW m:1WW a:005x003,035x033,065x063,095x093,125x123,155x153,185x183,215x213",
            source: "http://www.cubezone.be/square1step6.html"
        },
        esubdf: {
            id: "ES UBDF",
            name: "Edge swap UB-DF",
            sequence: "0-1/-30/41/-4-1/30/",
            nc: "t:1 u:00yDdDdDdD a:004x124"
        },
        csuf: {
            id: "CS UF",
            name: "Corner swap URF-ULF",
            sequence: "/3-3/30/-30/03/-30/",
            nc: "t:1 u:00dDdYyYyD a:096u156,123u183"
        },
        csdf: {
            id: "CS DF",
            name: "Corner swap DRF-DLF",
            sequence: "/3-3/03/-30/30/-30/",
            nc: "t:1 u:00dDdDdDdD a:096d156,123d183"
        },
        esrb: {
            id: "ES RB",
            name: "Edge swap UR-UB + DR-DB",
            sequence: "02/0-3/11/-12/",
            nc: "t:1 u:00yDyDdDdD a:005u065,003d063"
        },
        jaapce: {
            id: "Jaap PCE",
            name: "Create CE pair",
            sequence: "-30 /0-3/03/0-3/03/",
            nc: "t:1 u:00dDdWyDwY a:123u183,096U156 f:DBD r:ODD b:DDD l:BOD",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaappf: {
            id: "Jaap PF",
            name: "Parity fix",
            sequence: "10 30/03/ 0-1/33/ 0-5/_ -24/2-4/ 0-1/33/",
            nc: "t:1 u:00dDdDyWwY a:124u184 f:OBD r:DDD b:DDD l:BOD",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaapadj: {
            id: "Jaap ADJ",
            name: "Adjacent CE swap",
            sequence: "10 /0-3/03/0-3/03/_30 /0-3/03/0-3/03/",
            nc: "t:1 u:00dDyYyYdD a:063u123,096u156 f:GGD r:RRD b:DDD l:DDD",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaapdiag: {
            id: "Jaap DIAG",
            name: "Diagonal CE swap",
            sequence: "10 /0-3/03/0-3/03/_60 /0-3/03/0-3/03/",
            nc: "t:1 u:00yYdDyYdD a:004u124,035u155 f:GGD r:DDD b:BBD l:DDD",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        }
    }
};
