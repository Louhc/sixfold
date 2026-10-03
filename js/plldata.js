/* 由 tools/emit_pages.py 从 data/pll.json 生成 —— 不要手改：
   改公式请改数据库，然后重跑生成器。 */
var PLL_DB = {
  "set": "pll",
  "v": 1,
  "generated": "data/pll.json",
  "cases": [
    {
      "id": "Aa",
      "no": 1,
      "name": "Aa-Perm",
      "prob": "1/18",
      "descEn": "Inverse and reflection of Ab. It is a clockwise 3-cycle of corners.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBRLLRFRFBFL",
          "img": "img/pll/pll-Aa-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Aa-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Aa-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "x' R2 D2 (R' U' R) D2 (R' U R')",
              "n": 10,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred",
                "ohpll-preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "RLLBFLBBRFRF",
          "img": "img/pll/pll-Aa-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Aa-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Aa-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 2,
              "alg": "x' L' U L' D2 L U' L' D2 L2",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "LFBFRFRLLRBB",
          "img": "img/pll/pll-Aa-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Aa-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Aa-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 3,
              "alg": "x L2 D2 L' U' L D2 L' U L'",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "FRFRBBLFBLLR",
          "img": "img/pll/pll-Aa-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Aa-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Aa-v3-nc-night-256x256.png",
          "algs": [
            {
              "no": 4,
              "alg": "x R' U R' D2 R U' R' D2 R2",
              "n": 10,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        }
      ]
    },
    {
      "id": "Ab",
      "no": 2,
      "name": "Ab-Perm",
      "prob": "1/18",
      "descEn": "Inverse and reflection of Aa. It is a counter-clockwise 3-cycle of corners.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBFLLFLRBRFR",
          "img": "img/pll/pll-Ab-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ab-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ab-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "x' (R U' R) D2 (R' U R) D2 R'2",
              "n": 10,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred",
                "ohpll-preferred"
              ]
            },
            {
              "no": 2,
              "alg": "x' R U' R D2 R' U R D2 R2",
              "n": 10,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "FLLRFRBBFBRL",
          "img": "img/pll/pll-Ab-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ab-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ab-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 3,
              "alg": "x' L2 D2 L U L' D2 L U' L",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "RFRBRLFLLFBB",
          "img": "img/pll/pll-Ab-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ab-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ab-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 4,
              "alg": "x L U' L D2 L' U L D2 L2",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "LRBFBBRFRLLF",
          "img": "img/pll/pll-Ab-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ab-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ab-v3-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "x R2 D2 R U R' D2 R U' R",
              "n": 10,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        }
      ]
    },
    {
      "id": "E",
      "no": 3,
      "name": "E-Perm",
      "prob": "1/36",
      "descEn": "The algorithm below was popularised by Rowe Hessler. It utilises [OCLL] / [COLL] algorithms for L / Bowtie and T / Chameleon.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "LBRFLBFRBLFR",
          "img": "img/pll/pll-E-v0-256x256.png",
          "img-nc-day": "img/pll/pll-E-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-E-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D')",
              "n": 17,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "x' R U' R' D R U R' D' R U R' D R U' R' u'",
              "n": 17,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "x' L' U L D' L' U' L D L' U' L D' L' U L D",
              "n": 17,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "BLFLFRLBRBRF",
          "img": "img/pll/pll-E-v1-256x256.png",
          "img-nc-day": "img/pll/pll-E-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-E-v1-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "F",
      "no": 4,
      "name": "F-Perm",
      "prob": "1/18",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BFRLLLFRBFBR",
          "img": "img/pll/pll-F-v0-256x256.png",
          "img-nc-day": "img/pll/pll-F-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-F-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
              "n": 18,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LLLFBRBFRBRF",
          "img": "img/pll/pll-F-v1-256x256.png",
          "img-nc-day": "img/pll/pll-F-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-F-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "RBFBRFLLLRFB",
          "img": "img/pll/pll-F-v2-256x256.png",
          "img-nc-day": "img/pll/pll-F-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-F-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "FRBRFBRBFLLL",
          "img": "img/pll/pll-F-v3-256x256.png",
          "img-nc-day": "img/pll/pll-F-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-F-v3-nc-night-256x256.png",
          "algs": [
            {
              "no": 2,
              "alg": "R U R' U' R' U R U2 L' R' U R U' L U' R U' R'",
              "n": 18,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "Ga",
      "no": 5,
      "name": "Ga-Perm",
      "prob": "1/18",
      "descEn": "Inverse of Gb. Reflection of Gc.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "RLFBRBLBRLFF",
          "img": "img/pll/pll-Ga-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ga-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ga-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "D' R2 U R' U R' U' R U' R2 U' D R' U R U",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R2 u) (R' U R' U' R u' R'2) y' (R' U R)",
              "n": 13,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R2 u R' U R' U' R u' R2 y z U' R U",
              "n": 14,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 4,
              "alg": "R2 U R' U R' U' R U' R2 D U' R' U R u' U",
              "n": 16,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 5,
              "alg": "R2 U R' U R' U' R U' R2 (U' D) R' U R D' U",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            },
            {
              "no": 6,
              "alg": "R2 u R' U R' U' R u' R2 y' R' U R",
              "n": 13,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "BRBLFFRLFRBL",
          "img": "img/pll/pll-Ga-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ga-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ga-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FFLRBLBRBFLR",
          "img": "img/pll/pll-Ga-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ga-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ga-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 7,
              "alg": "z U2 r U' R U' R' U r' U2 x' U' R U",
              "n": 14,
              "uses": [
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "LBRFLRFFLBRB",
          "img": "img/pll/pll-Ga-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ga-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ga-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Gb",
      "no": 6,
      "name": "Gb-Perm",
      "prob": "1/18",
      "descEn": "Inverse of Ga. Reflection of Gd.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "LFBFBFRRLRLB",
          "img": "img/pll/pll-Gb-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Gb-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gb-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R' d' F) (R2 u) (R' U) (R U' R u' R2)",
              "n": 12,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R' U' R) y (R2 u) (R' U R U') (R u' R'2)",
              "n": 13,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "R' U' R (U D') R2 U R' U R U' R U' R2 D U'",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "R' U' R y R2 u R' U R U' R u' R2",
              "n": 13,
              "uses": [
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "FBFRLBLFBLRR",
          "img": "img/pll/pll-Gb-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Gb-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gb-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "F' U' F R2 u R' U R U' R u' R2",
              "n": 12,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "BLRLRRFBFBFL",
          "img": "img/pll/pll-Gb-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Gb-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gb-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RRLBFLBLRFBF",
          "img": "img/pll/pll-Gb-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Gb-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gb-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Gc",
      "no": 7,
      "name": "Gc-Perm",
      "prob": "1/18",
      "descEn": "Inverse of Gd. Reflection of Ga.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "LBBFRFRFLRLB",
          "img": "img/pll/pll-Gc-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Gc-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gc-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R2 U') (R U' R U R' U R2 U D') (R U' R') D U'",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R'2 u' R U' R) (U R' u R2) y (R U' R')",
              "n": 13,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R2 u' R U' R U R' D x' U2 r U' r'",
              "n": 13,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 4,
              "alg": "R2 u' R U' R U R' u R2 y R U' R'",
              "n": 13,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "FRFRLBLBBLFR",
          "img": "img/pll/pll-Gc-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Gc-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gc-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "BLRLFRFRFBBL",
          "img": "img/pll/pll-Gc-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Gc-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gc-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "R2 F2 R U2 R U2 R' F R U R' U' R' F R2",
              "n": 15,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RFLBBLBLRFRF",
          "img": "img/pll/pll-Gc-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Gc-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gc-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Gd",
      "no": 8,
      "name": "Gd-Perm",
      "prob": "1/18",
      "descEn": "Inverse of Gc. Reflection of Gb.<br/><br/>Check out the similarity between the Gd-Perm algorithm R2' F' (R U R U') (R' F' R U2' R' U2 R' F) F R2 and the Ra-Perm algorithm R U (R' F' R U2' R' U2 R' F) (R U R U') U' R'.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "RLFBFBLRRLBF",
          "img": "img/pll/pll-Gd-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Gd-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gd-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R') (U' D) (R2 U' R U' R' U R' U R2 D') U",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R U R') y' (R'2 u' R U') (R' U R' u R2)",
              "n": 13,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R U R' y' R2 u' R U' R' U R' u R2",
              "n": 13,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "BFBLBFRLFRRL",
          "img": "img/pll/pll-Gd-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Gd-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gd-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FBLRRLBFBFLR",
          "img": "img/pll/pll-Gd-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Gd-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gd-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "LRRFLRFBLBFB",
          "img": "img/pll/pll-Gd-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Gd-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Gd-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "H",
      "no": 9,
      "name": "H-Perm / X-Perm",
      "prob": "1/72",
      "descEn": "Best known as H-Perm (i.e. swapping opposite edge pairs) this case is also known as X-Perm (i.e.  swapping diagonal corner pairs).",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BFBLRLRLRFBF",
          "img": "img/pll/pll-H-v0-256x256.png",
          "img-nc-day": "img/pll/pll-H-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-H-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "M'2 U M'2 U2 M'2 U M'2",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R2 U2 R U2 R2 U2 R2 U2 R U2 R2",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "M2 U' M2 U2 M2 U' M2",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "M2 U M2 U2 M2 U M2",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        }
      ]
    },
    {
      "id": "Ja",
      "no": 10,
      "name": "Ja-Perm",
      "prob": "1/18",
      "descEn": "Reflection of Jb. This case is also known as the L-Perm.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "LBBFFBRRRLLF",
          "img": "img/pll/pll-Ja-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ja-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ja-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U' L F) (L' U' L U) (L F') (L2 U L U)",
              "n": 14,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "BFFLLFLBBRRR",
          "img": "img/pll/pll-Ja-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ja-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ja-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 2,
              "alg": "R' U L' U2 R U' R' U2 R L U'",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FLLRRRBFFBBL",
          "img": "img/pll/pll-Ja-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ja-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ja-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 3,
              "alg": "R' U2 R U R' U2 L U' R U L'",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 4,
              "alg": "x R2 F R F' R U2 r' U r U2",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RRRBBLFLLFFB",
          "img": "img/pll/pll-Ja-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ja-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ja-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Jb",
      "no": 11,
      "name": "Jb-Perm",
      "prob": "1/18",
      "descEn": "Reflection of Ja.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBRLLLFFBFRR",
          "img": "img/pll/pll-Jb-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Jb-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Jb-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' F') (R U R' U') (R' F) (R2 U' R' U')",
              "n": 14,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R U2 R' U' R U2 L' U R' U' L",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "R U2 R' U' R U2 L' U R' U' r",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LLLFRRBBRBFF",
          "img": "img/pll/pll-Jb-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Jb-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Jb-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "RRFBFFLLLRBB",
          "img": "img/pll/pll-Jb-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Jb-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Jb-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "FFBRBBRRFLLL",
          "img": "img/pll/pll-Jb-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Jb-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Jb-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Na",
      "no": 12,
      "name": "Na-Perm",
      "prob": "1/72",
      "descEn": "Reflection of Nb.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBFLRRLLRBFF",
          "img": "img/pll/pll-Na-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Na-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Na-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R U R' U (R U R' F' R U R' U' R' F R2 U' R' U') U' R U' R'",
              "n": 22,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R U R' U R U2 R' U' R U2 L' U R' U' L U' R U' R'",
              "n": 19,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
              "n": 21,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "RRLBFFBBFRLL",
          "img": "img/pll/pll-Na-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Na-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Na-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 4,
              "alg": "L U' R U2 L' U R' L U' R U2 L' U R'",
              "n": 14,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 5,
              "alg": "R U' L U2 R' U L' R U' L U2 R' U L'",
              "n": 14,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 6,
              "alg": "z U R' D R2 U' R D' U R' D R2 U' R D'",
              "n": 15,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        }
      ]
    },
    {
      "id": "Nb",
      "no": 13,
      "name": "Nb-Perm",
      "prob": "1/72",
      "descEn": "Reflection of Na.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "FBBRRLRLLFFB",
          "img": "img/pll/pll-Nb-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Nb-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Nb-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
              "n": 17,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "U' L' U R' U2 L U' R L' U R' U2 L U' R",
              "n": 15,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "R' U' R U' R' U2 (R U R') U2 L U' R U L' U R' U R",
              "n": 19,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "R' U L' U2 R U' L R' U L' U2 R U' L U",
              "n": 15,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 5,
              "alg": "U' z D' R U' R2 D R' U D' R U' R2 D R' U",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LRRFFBFBBLLR",
          "img": "img/pll/pll-Nb-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Nb-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Nb-v1-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Ra",
      "no": 14,
      "name": "Ra-Perm",
      "prob": "1/18",
      "descEn": "Reflection of Rb.<br/><br/>Check out the similarity between the Ra-Perm algorithm R U (R' F' R U2' R' U2 R' F) (R U R U') U' R' and the Gd-Perm algorithm R2' F' (R U R U') (R' F' R U2' R' U2 R' F) F R2.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BLRLBLFRBFFR",
          "img": "img/pll/pll-Ra-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ra-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ra-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' F') (R U'2 R' U2) (R' F R U) (R U'2 R' U')",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R U' R' U' R U R D R' U' R D' R' U2 R' U'",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R U R' F' R U2 R' U2 R' F R U R U2 R' U'",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LBLFFRBLRBRF",
          "img": "img/pll/pll-Ra-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ra-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ra-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "RFFBRFLBLRLB",
          "img": "img/pll/pll-Ra-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ra-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ra-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "FRBRLBRFFLBL",
          "img": "img/pll/pll-Ra-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ra-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ra-v3-nc-night-256x256.png",
          "algs": [
            {
              "no": 4,
              "alg": "L U2 L' U2 L F' L' U' L U L F L2 U",
              "n": 14,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        }
      ]
    },
    {
      "id": "Rb",
      "no": 15,
      "name": "Rb-Perm",
      "prob": "1/18",
      "descEn": "Reflection of Ra.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "LRBFLBRBRLFF",
          "img": "img/pll/pll-Rb-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Rb-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Rb-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U' L F) (L' U2 L U'2) (L F' L' U') (L' U2 L U)",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "z U' R U R U' R' U' L' U R U' L U R2 U R",
              "n": 17,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "BLFLFFLRBRBR",
          "img": "img/pll/pll-Rb-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Rb-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Rb-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 3,
              "alg": "R' U2 R' D' R U' R' D R U R U' R' U' R U'",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "R' U2 R U2 R' F R U R' U' R' F' R2 U'",
              "n": 14,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FFLRBRBLFBRL",
          "img": "img/pll/pll-Rb-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Rb-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Rb-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "R2 F R U R U' R' F' R U2 R' U2 R U",
              "n": 14,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RBRBRLFFLFLB",
          "img": "img/pll/pll-Rb-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Rb-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Rb-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "T",
      "no": 16,
      "name": "T-Perm",
      "prob": "1/18",
      "descEn": "Check out the similarity between the T-Perm algorithm (R U R' U' R' F R F') (F R U' R' U' R U R' F') and the Y-Perm algorithm (F R U' R' U' R U R' F') (R U R' U' R' F R F').",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBRLRLFLBFFR",
          "img": "img/pll/pll-T-v0-256x256.png",
          "img-nc-day": "img/pll/pll-T-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-T-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' U') (R' F R2 U' R' U') (R U R' F')",
              "n": 14,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred",
                "ohpll-preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LRLFFRBBRBLF",
          "img": "img/pll/pll-T-v1-256x256.png",
          "img-nc-day": "img/pll/pll-T-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-T-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "RFFBLFLRLRBB",
          "img": "img/pll/pll-T-v2-256x256.png",
          "img-nc-day": "img/pll/pll-T-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-T-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "FLBRBBRFFLRL",
          "img": "img/pll/pll-T-v3-256x256.png",
          "img-nc-day": "img/pll/pll-T-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-T-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Ua",
      "no": 17,
      "name": "Ua-Perm",
      "prob": "1/18",
      "descEn": "Inverse and reflection of Ub. It is a counter-clockwise 3-cycle of edges.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBBLFLRLRFRF",
          "img": "img/pll/pll-Ua-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ua-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ua-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U' R) (U R) (U R U' R' U' R'2)",
              "n": 11,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "M2 U M U2 M' U M2",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "R U' R U R U R U' R' U' R2",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LFLFRFBBBRLR",
          "img": "img/pll/pll-Ua-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ua-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ua-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FRFRLRLFLBBB",
          "img": "img/pll/pll-Ua-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ua-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ua-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 4,
              "alg": "R2 U' R' U' R U R U R U' R",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RLRBBBFRFLFL",
          "img": "img/pll/pll-Ua-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ua-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ua-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Ub",
      "no": 18,
      "name": "Ub-Perm",
      "prob": "1/18",
      "descEn": "Inverse and reflection of Ua. It is a clockwise 3-cycle of edges.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BBBLRLRFRFLF",
          "img": "img/pll/pll-Ub-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Ub-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ub-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R2 U) (R U R' U' R' U') (R' U R')",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "M2 U' M U2 M' U' M2",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "z U' R U' R' U' R' U' R U R U2",
              "n": 12,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 4,
              "alg": "L' U L' U' L' U' L' U L U L2",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LRLFLFBBBRFR",
          "img": "img/pll/pll-Ub-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Ub-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ub-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "FLFRFRLRLBBB",
          "img": "img/pll/pll-Ub-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Ub-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ub-v2-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "L2 U L U L' U' L' U' L' U L'",
              "n": 11,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 6,
              "alg": "R' U R' U' R' U' (R' U R U) R2",
              "n": 11,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RFRBBBFLFLRL",
          "img": "img/pll/pll-Ub-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Ub-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Ub-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "V",
      "no": 19,
      "name": "V-Perm",
      "prob": "1/18",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "FRBRLLRBLFFB",
          "img": "img/pll/pll-V-v0-256x256.png",
          "img-nc-day": "img/pll/pll-V-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-V-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R' U R' d' R' F' R2 U' R' U R' F R F",
              "n": 14,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R' U2 R U2 L U' R' U L' U L U' R U L'",
              "n": 15,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "R' U R U' x' U R U2 R' U' R U' R' U2 R U R' U'",
              "n": 18,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "R U2 R' D R U' R U' R U R2 D R' U' R D2",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            },
            {
              "no": 5,
              "alg": "R' U R' U' y R' F' R2 U' R' U R' F R F",
              "n": 15,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 6,
              "alg": "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2",
              "n": 16,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 7,
              "alg": "z D' R2 D R2 U R' D' R U' R U R' D R U' z'",
              "n": 17,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 8,
              "alg": "x' R' F R F' U R U2 R' U' R U' R' U2 R U R' U'",
              "n": 18,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LLRFFBFRBLBR",
          "img": "img/pll/pll-V-v1-256x256.png",
          "img-nc-day": "img/pll/pll-V-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-V-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "BFFLBRLLRBRF",
          "img": "img/pll/pll-V-v2-256x256.png",
          "img-nc-day": "img/pll/pll-V-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-V-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RBLBRFBFFRLL",
          "img": "img/pll/pll-V-v3-256x256.png",
          "img-nc-day": "img/pll/pll-V-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-V-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Y",
      "no": 20,
      "name": "Y-Perm",
      "prob": "1/18",
      "descEn": "Check out the similarity between the Y-Perm algorithm (F R U' R' U' R U R' F') (R U R' U' R' F R F') and the T-Perm algorithm (R U R' U' R' F R F') (F R U' R' U' R U R' F').",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "FLBRBLRRLFFB",
          "img": "img/pll/pll-Y-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Y-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Y-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F (R U' R' U' R U R') F' (R U R' U') (R' F R F')",
              "n": 17,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "R2 U' R' U R U' x' U' z' U' R U' R' U' z U R",
              "n": 17,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 3,
              "alg": "R2 U' R' U R U' x' U' z' U' R U' R' U' r B",
              "n": 16,
              "uses": [
                "OH"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "F R' F R2 U' R' U' R U R' F' R U R' U' F'",
              "n": 16,
              "uses": [
                "2H",
                "OH"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LBRFFBFLBLRR",
          "img": "img/pll/pll-Y-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Y-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Y-v1-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": "BFFLRRLBRBLF",
          "img": "img/pll/pll-Y-v2-256x256.png",
          "img-nc-day": "img/pll/pll-Y-v2-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Y-v2-nc-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": "RRLBLFBFFRBL",
          "img": "img/pll/pll-Y-v3-256x256.png",
          "img-nc-day": "img/pll/pll-Y-v3-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Y-v3-nc-night-256x256.png",
          "algs": []
        }
      ]
    },
    {
      "id": "Z",
      "no": 21,
      "name": "Z-Perm",
      "prob": "1/36",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": "BLBLBLRFRFRF",
          "img": "img/pll/pll-Z-v0-256x256.png",
          "img-nc-day": "img/pll/pll-Z-v0-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Z-v0-nc-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "U (R' U' R U') (R U R U') (R' U R U) (R2 U' R' U)",
              "n": 17,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "M' U' M2 U' M2 U' M' U'2 M2 U",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 3,
              "alg": "M' U' M2 U' M2 U' M' U2 M2 U",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 4,
              "alg": "M2 U M2 U M' U2 M2 U2 M' U2",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        },
        {
          "view": 1,
          "frame": "y",
          "sig": "LBLFRFBLBRFR",
          "img": "img/pll/pll-Z-v1-256x256.png",
          "img-nc-day": "img/pll/pll-Z-v1-nc-256x256.png",
          "img-nc-night": "img/pll/pll-Z-v1-nc-night-256x256.png",
          "algs": [
            {
              "no": 5,
              "alg": "R' U' R U' R U R U' R' U R U R2 U' R' U",
              "n": 16,
              "uses": [
                "OH"
              ],
              "tags": [
                "ohpll-preferred"
              ]
            },
            {
              "no": 6,
              "alg": "M' U M2 U M2 U M' U2 M2 U'",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            },
            {
              "no": 7,
              "alg": "M2 U' M2 U' M' U2 M2 U2 M' U",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        }
      ]
    }
  ]
};
