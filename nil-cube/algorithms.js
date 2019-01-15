var algorithms = {
    "2x2": {
        oll26: {
            hint: "size:backgroundColor:type:UUUU:FF:BB:LL:RR:aaaaaaaaa,aaaaaaaaa",
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R",
            nc: "2:WDDD:WD:WD:WD:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R%27U%27RU%27%20R%27U2R"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'",
            nc: "2:DDWD:DW:DW:DW:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=RUR%27U%20RU2R%27"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R2U2 R U2R2",
            nc: "2:DDDD:WW:DD:WW:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R2U2%20R%20U2R2"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "F (RUR'U')2 F'",
            nc: "2:DDDD:DW:DD:WD:WW",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20(RUR%27U%27)%20F%27"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "F (RUR'U') F'",
            nc: "2:DWDW:DD:DD:DD:WW",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20F%27"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'",
            alternatives: ["(RUR'U') R'F RF'"],
            nc: "2:DWDW:WD:DD:DW:DD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=(RUR%27U%27)%20R%27F%20RF%27"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "F' (RUR'U') R'FR",
            nc: "2:DWWD:DW:DD:DD:WD",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%27%20(RUR%27U%27)%20R%27FR"
        },
        cll40: {
            id: "CLL 40",
            name: "T permutation",
            sequence: "RU2R'U' RU2L'U R'U'L",
            nc: "2:YYYY:BR:GB:RG:OO",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU2R%27U%27%20RU2L%27U%20R%27U%27L"
        },
        cll41: {
            id: "CLL 41",
            name: "Y permutation",
            sequence: "RU'R'U' F2U' RUR'D R2",
            nc: "2:YYYY:RO:BG:OR:GB",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU%27R%27U%27%20F2U%27%20RUR%27D%20R2"
        },
        cpllaa: {
            id: "CPLL Aa",
            name: "A permutation a",
            sequence: "R'F (R'B2 RF'R') B2R2",
            nc: "2:YYYY:BG:OB:RR:GO",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=R%27%20F%20(R%27%20B2%20R%20F%27%20R%27)%20B2%20R2"
        },
        pbl1: {
            id: "PBL 1",
            name: "Diagonal Column Swap",
            sequence: "R2 B2 R2",
            nc: "2:YDDY:DD:DD:DD:DD:0002u1102,0020d1120",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=1"
        },
        pbl2: {
            id: "PBL 2",
            name: "Adjacent Column Swap",
            sequence: "R2U' B2U2 R2U' R2",
            nc: "2:YYDD:DD:DD:DD:DD:0000u1020,0002d1022",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=2"
        },
        pbl5: {
            id: "PBL 5",
            name: "Adjacent U + Diagonal D",
            sequence: "RU'R F2 R'UR'",
            nc: "2:DDYY:DD:DD:DD:DD:0102u1122,1111d0011",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=5"
        }
    },
    "3x3": {
        oll26: {
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R",
            nc: "3:WWDWWWDWD:WDD:WDD:WDD:DDD"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'",
            nc: "3:DWDWWWWWD:DDW:DDW:DDW:DDD"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R'U'RU' (R'URU') R'U2R",
            nc: "3:DWDWWWDWD:DDD:WDW:DDD:WDW"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "R U2R2 (U'R2U') R2U2 R",
            nc: "3:DWDWWWDWD:DDW:DDD:WDD:WDW"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "(R'U'RU' R'U2R)_(RUR'U RU2R')",
            nc: "3:DWDWWWWWW:DDD:DDD:WDW:DDD"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'",
            nc: "3:DWWWWWDWW:WDD:DDD:DDW:DDD"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "RU2R'U' (RUR'U')2 RU'R'",
            nc: "3:WWDWWWDWW:DDD:DDD:WDD:DDW"
        },
        cpllaa: {
            id: "CPLL Aa",
            name: "A permutation a",
            sequence: "R'F R'B2R F'R' B2R2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%27%20F%20(R%27%20B2%20R%20F%27%20R%27)%20B2%20R2",
            nc: "3:YYYYYYYYY:GGB:ROG:OBO:BRR:0011U2011,2011u2211,2211u0022",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cpllab: {
            id: "CPLL Ab",
            name: "A permutation b",
            sequence: "RB'R F2 R'BR F2R2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%20B%27%20R%20F2%20R%27%20B%20R%20F2%20R2",
            nc: "3:YYYYYYYYY:OGO:BOR:GBB:RRG:0211U2211,2211u2011,2011u0220",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cplle: {
            id: "CPLL E",
            name: "E Permutation",
            sequence: "R2UR'U' y (RUR'U')2_RUR' FU'F2",
            nc: "3:YYYYYYYYY:OGR:GOB:RBO:BRG:0211u2211,0011u2011",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        pllt: {
            id: "PLL T",
            name: "T permutation",
            sequence: "RUR'U' R'FR2U'_R'U'RU R'F'",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=R%20U%20R%27%20U%27%20R%27%20F%20R2%20U%27%20R%27%20U%27%20R%20U%20R%27%20F%27",
            nc: "3:YYYYYYYYY:GGO:BRG:OBB:ROR:0111u2111,2011u2211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        pllja: {
            id: "PLL Ja",
            name: "J permutation a",
            sequence: "R'L'U2 LUL'U2 RU'LU",
            nc: "3:YYYYYYYYY:RRG:OOO:BBR:GGB:0111u1211,0011u0211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        plljb: {
            id: "PLL Jb",
            name: "J permutation b",
            sequence: "RU2R'U' RU2L'U R'U'L",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=RU2R%27U%27%20RU2L%27U%20R%27U%27L",
            nc: "3:YYYYYYYYY:GOO:BGG:OBB:RRR:1211u2111,2011u2211",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllh: {
            id: "EPLL H",
            name: "H permutation",
            sequence: "M2 U (M2 U2 M2) U M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M2%20U2%20M2)%20U%20M2",
            nc: "3:YYYYYYYYY:GBG:ORO:BGB:ROR:1011u1211,0111u2111",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllua: {
            id: "EPLL Ua",
            name: "U permutation a",
            sequence: "M2 U (M'U2M) U M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M%27%20U2%20M)%20U%20M2",
            nc: "3:YYYYYYYYY:GGG:OBO:BRB:ROR:0111U2111,2111u1011,1011u0120",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllub: {
            id: "EPLL Ub",
            name: "U permutation b",
            sequence: "M2 U' (M'U2M) U' M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%27%20(M%27%20U2%20M)%20U%27%20M2",
            nc: "3:YYYYYYYYY:GGG:ORO:BOB:RBR:2111U0111,0111u1011,1011u2100",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        epllz: {
            id: "EPLL Z",
            name: "Z permutation",
            sequence: "M2 U (M' U2M2U2 M') U' M2",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M2%20U%20(M%27%20U2%20M2%20U2%20M%27)%20U%27%20M2",
            nc: "3:YYYYYYYYY:GRG:OBO:BOB:RGR:0111u1211,1011u2111",
            source: "https://www.speedsolving.com/wiki/index.php/PLL"
        },
        cfllb: {
            id: "CF LLb",
            name: "Last ledge DB",
            sequence: "UM' U2 M'U",
            nc: "3:RDRDDRRDR:GDG:YYY:BDBBDBBWB:WDW",
            source: "http://rubikscube.info/beginner.php"
        },
        cfllf: {
            id: "CF LLf",
            name: "Last ledge DF",
            sequence: "U'M U2 MU'",
            nc: "3:RDRDDRRDR:GDGGDGGWG:YYY:BDB:WDW",
            source: "http://rubikscube.info/beginner.php"
        },
        cffm: {
            id: "CF FM",
            name: "Flip Midges",
            sequence: "(M'U)3 U (MU)3 U",
            vcube: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=3&stage=pll&view=plan&case=M%27UM%27UM%27U%20U%20MUMUMU%20Uxz%27",
            nc: "3:RBRRRRRGR:GRG:YYY:BRB:WWW:1011u1211",
            source: "http://rubikscube.info/beginner.php"
        }
    },
    sq1: {
        fm: {
            id: "FM",
            name: "Flip middle",
            sequence: "/60/60/",
            nc: "1:00yYyYyYyY:1WW",
            source: "http://www.cubezone.be/square1step6.html"
        },
        sud: {
            id: "SUD",
            name: "Swap UD",
            sequence: "10/66/",
            nc: "1:00wWwWwWwW::005x003,035x033,065x063,095x093,125x123,155x153,185x183,215x213",
            source: "http://www.cubezone.be/square1step6.html"
        },
        sf: {
            id: "SF",
            name: "Swap UD + Flip M",
            sequence: "/60/06/",
            nc: "1:00wWwWwWwW:1WW:005x003,035x033,065x063,095x093,125x123,155x153,185x183,215x213",
            source: "http://www.cubezone.be/square1step6.html"
        },
        esubdf: {
            id: "ES UBDF",
            name: "Edge swap UB-DF",
            sequence: "0-1/-30/41/-4-1/30/",
            nc: "1:00yDdDdDdD::004x124"
        },
        csuf: {
            id: "CS UF",
            name: "Corner swap URF-ULF",
            sequence: "/3-3/30/-30/03/-30/",
            nc: "1:00dDdYyYyD::096u156,123u183"
        },
        csdf: {
            id: "CS DF",
            name: "Corner swap DRF-DLF",
            sequence: "/3-3/03/-30/30/-30/",
            nc: "1:00dDdDdDdD::096d156,123d183"
        },
        esrb: {
            id: "ES RB",
            name: "Edge swap UR-UB + DR-DB",
            sequence: "02/0-3/11/-12/",
            nc: "1:00yDyDdDdD::005u065,003d063"
        },

        jaapce: {
            id: "Jaap PCE",
            name: "Create CE pair",
            sequence: "10 -40 /0-3/03/0-3/03/",
            nc: "1:00dDdYyDyY::123u183,096U156",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaappf: {
            id: "Jaap PF",
            name: "Parity fix",
            sequence: "10 30/03/ 0-1/33/ 0-5/_ -24/2-4/ 0-1/33/",
            nc: "1:00dDdDyYyY::124u184",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaapadj: {
            id: "Jaap ADJ",
            name: "Adjacent CE swap",
            sequence: "10 /0-3/03/0-3/03/_30 /0-3/03/0-3/03/",
            nc: "1:00dDyYyYdD::063u123,096u156",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        },
        jaapdiag: {
            id: "Jaap DIAG",
            name: "Diagonal CE swap",
            sequence: "10 /0-3/03/0-3/03/_60 /0-3/03/0-3/03/",
            nc: "1:00yYdDyYdD::004u124,035u155",
            source: "https://www.jaapsch.net/puzzles/square1.htm"
        }
    }
};
