var algorithms = {
    "2x2": {
        oll26: {
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R%27U%27RU%27%20R%27U2R"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=RUR%27U%20RU2R%27"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R2U2 R U2R2",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=R2U2%20R%20U2R2"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "F (RUR'U')2 F'",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20(RUR%27U%27)%20F%27"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "F (RUR'U') F'",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%20(RUR%27U%27)%20F%27"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'",
            alternatives: ["(RUR'U') R'F RF'"],
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=(RUR%27U%27)%20R%27F%20RF%27"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "F' (RUR'U') R'FR",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&size=160&pzl=2&sch=wddddd&stage=ll&view=plan&case=F%27%20(RUR%27U%27)%20R%27FR"
        },
        cll40: {
            id: "CLL 40",
            name: "T permutation",
            sequence: "RU2R'U' RU2L'U R'U'L",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU2R%27U%27%20RU2L%27U%20R%27U%27L"
        },
        cll41: {
            id: "CLL 41",
            name: "Y permutation",
            sequence: "RU'R'U' F2U' RUR'D R2",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=RU%27R%27U%27%20F2U%27%20RUR%27D%20R2"
        },
        cpllaa: {
            id: "CPLL A a",
            name: "T permutation",
            sequence: "R'F (R'B2 RF'R') B2R2",
            source: "https://www.speedsolving.com/wiki/extensions/algdb/vcube/visualcube.php?fmt=png&bg=w&sch=yrbwog&size=160&pzl=2&stage=oll&view=plan&case=R%27%20F%20(R%27%20B2%20R%20F%27%20R%27)%20B2%20R2"
        },
        pbl1: {
            id: "PBL 1",
            name: "Diagonal Column Swap",
            sequence: "R2 B2 R2"
        },
        pbl2: {
            id: "PBL 2",
            name: "Adjacent Column Swap",
            sequence: "R2U' B2U2 R2U' R2"
        },
        pbl5: {
            id: "PBL 5",
            name: "Adjacent U + Diagonal D",
            sequence: "RU'R F2 R'UR'",
            source: "https://www.speedsolving.com/wiki/index.php/Special:MediawikiAlgDB?mode=view&view=default&puzzle=2&group=PBL&cid=5"
        }
    },
    "3x3": {
        oll26: {
            id: "OLL 26",
            name: "-S / Antisune",
            sequence: "R'U'RU' R'U2R"
        },
        oll27: {
            id: "OLL 27",
            name: "S / Sune",
            sequence: "RUR'U RU2R'"
        },
        oll21: {
            id: "OLL 21",
            name: "H / Cross",
            sequence: "R'U'RU' (R'URU') R'U2R"
        },
        oll22: {
            id: "OLL 22",
            name: "Pi / Wheel",
            sequence: "R U2R2 (U'R2U') R2U2 R"
        },
        oll23: {
            id: "OLL 23",
            name: "U / Headlights",
            sequence: "(R'U'RU' R'U2R)_(RUR'U RU2R')"
        },
        oll24: {
            id: "OLL 24",
            name: "T / Shark",
            sequence: "LFR'F' L'FRF'"
        },
        oll25: {
            id: "OLL 25",
            name: "L / Bowtie",
            sequence: "RU2R'U' (RUR'U')2 RU'R'"
        }
    }
};
