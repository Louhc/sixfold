/* 由 tools/emit_pages.py 从 data/oll.json 生成 —— 不要手改：
   改公式请改数据库，然后重跑生成器。 */
var OLL_DB = {
  "set": "oll",
  "v": 1,
  "generated": "data/oll.json",
  "cases": [
    {
      "id": "21",
      "no": 21,
      "name": "H / Double Sune",
      "prob": "1/108",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010111010",
            "101000000101"
          ],
          "img-day": "img/oll/oll-21-v0-day-256x256.png",
          "img-night": "img/oll/oll-21-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U2 R' U') (R U R' U') (R U' R')",
              "n": 11,
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
          "sig": [
            "010111010",
            "000101101000"
          ],
          "img-day": "img/oll/oll-21-v1-day-256x256.png",
          "img-night": "img/oll/oll-21-v1-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "22",
      "no": 22,
      "name": "Pi / Bruno",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010111010",
            "001101000001"
          ],
          "img-day": "img/oll/oll-22-v0-day-256x256.png",
          "img-night": "img/oll/oll-22-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2) (R'2 U' R2 U') (R'2 U'2 R)",
              "n": 9,
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
          "sig": [
            "010111010",
            "101001001000"
          ],
          "img-day": "img/oll/oll-22-v1-day-256x256.png",
          "img-night": "img/oll/oll-22-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010111010",
            "100000101100"
          ],
          "img-day": "img/oll/oll-22-v2-day-256x256.png",
          "img-night": "img/oll/oll-22-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010111010",
            "000100100101"
          ],
          "img-day": "img/oll/oll-22-v3-day-256x256.png",
          "img-night": "img/oll/oll-22-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "23",
      "no": 23,
      "name": "U / Headlights",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "111111010",
            "000000000101"
          ],
          "img-day": "img/oll/oll-23-v0-day-256x256.png",
          "img-night": "img/oll/oll-23-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R2 D) (R' U2 R D') (R' U2 R')",
              "n": 9,
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
          "sig": [
            "011111011",
            "000101000000"
          ],
          "img-day": "img/oll/oll-23-v1-day-256x256.png",
          "img-night": "img/oll/oll-23-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010111111",
            "101000000000"
          ],
          "img-day": "img/oll/oll-23-v2-day-256x256.png",
          "img-night": "img/oll/oll-23-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110111110",
            "000000101000"
          ],
          "img-day": "img/oll/oll-23-v3-day-256x256.png",
          "img-night": "img/oll/oll-23-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "24",
      "no": 24,
      "name": "T / Chameleon",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "111111010",
            "000001001000"
          ],
          "img-day": "img/oll/oll-24-v0-day-256x256.png",
          "img-night": "img/oll/oll-24-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "x' (R U R' D) (R U' R' D')",
              "n": 9,
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
          "sig": [
            "011111011",
            "100000000100"
          ],
          "img-day": "img/oll/oll-24-v1-day-256x256.png",
          "img-night": "img/oll/oll-24-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010111111",
            "000100100000"
          ],
          "img-day": "img/oll/oll-24-v2-day-256x256.png",
          "img-night": "img/oll/oll-24-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110111110",
            "001000000001"
          ],
          "img-day": "img/oll/oll-24-v3-day-256x256.png",
          "img-night": "img/oll/oll-24-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "25",
      "no": 25,
      "name": "L / Bowtie",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "011111110",
            "100000001000"
          ],
          "img-day": "img/oll/oll-25-v0-day-256x256.png",
          "img-night": "img/oll/oll-25-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "x' (R U' R' D) (R U R' D')",
              "n": 9,
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
          "sig": [
            "110111011",
            "000000100100"
          ],
          "img-day": "img/oll/oll-25-v1-day-256x256.png",
          "img-night": "img/oll/oll-25-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "011111110",
            "000100000001"
          ],
          "img-day": "img/oll/oll-25-v2-day-256x256.png",
          "img-night": "img/oll/oll-25-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110111011",
            "001001000000"
          ],
          "img-day": "img/oll/oll-25-v3-day-256x256.png",
          "img-night": "img/oll/oll-25-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "26",
      "no": 26,
      "name": "AS / Anti-Sune",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "110111010",
            "001000001100"
          ],
          "img-day": "img/oll/oll-26-v0-day-256x256.png",
          "img-night": "img/oll/oll-26-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R' U' R U' R' U2 R",
              "n": 7,
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
          "sig": [
            "011111010",
            "000100001100"
          ],
          "img-day": "img/oll/oll-26-v1-day-256x256.png",
          "img-night": "img/oll/oll-26-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010111011",
            "001100000100"
          ],
          "img-day": "img/oll/oll-26-v2-day-256x256.png",
          "img-night": "img/oll/oll-26-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010111110",
            "001100001000"
          ],
          "img-day": "img/oll/oll-26-v3-day-256x256.png",
          "img-night": "img/oll/oll-26-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "27",
      "no": 27,
      "name": "S / Sune",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "011111010",
            "100001000001"
          ],
          "img-day": "img/oll/oll-27-v0-day-256x256.png",
          "img-night": "img/oll/oll-27-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "L U L' U L U2 L'",
              "n": 7,
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
          "sig": [
            "010111011",
            "100001100000"
          ],
          "img-day": "img/oll/oll-27-v1-day-256x256.png",
          "img-night": "img/oll/oll-27-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010111110",
            "100000100001"
          ],
          "img-day": "img/oll/oll-27-v2-day-256x256.png",
          "img-night": "img/oll/oll-27-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110111010",
            "000001100001"
          ],
          "img-day": "img/oll/oll-27-v3-day-256x256.png",
          "img-night": "img/oll/oll-27-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "cross"
    },
    {
      "id": "1",
      "no": 1,
      "name": "No Edges - Runway",
      "prob": "1/108",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000010000",
            "010111111010"
          ],
          "img-day": "img/oll/oll-01-v0-day-256x256.png",
          "img-night": "img/oll/oll-01-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2) (R'2 F R F') U2 (R' F R F')",
              "n": 11,
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
          "sig": [
            "000010000",
            "111010010111"
          ],
          "img-day": "img/oll/oll-01-v1-day-256x256.png",
          "img-night": "img/oll/oll-01-v1-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "2",
      "no": 2,
      "name": "No Edges - Zamboni",
      "prob": "1/54",
      "descEn": "This case is named after the Zamboni Machine which is an ice resurfacer; check some images on Google. The algorithm(s) for this [OLL] case are good choices for the 4-flip during [EOLL].",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000010000",
            "011111010011"
          ],
          "img-day": "img/oll/oll-02-v0-day-256x256.png",
          "img-night": "img/oll/oll-02-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F (R U R' U') S (R U R' U') f'",
              "n": 11,
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
          "sig": [
            "000010000",
            "111011011010"
          ],
          "img-day": "img/oll/oll-02-v1-day-256x256.png",
          "img-night": "img/oll/oll-02-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000010000",
            "110010111110"
          ],
          "img-day": "img/oll/oll-02-v2-day-256x256.png",
          "img-night": "img/oll/oll-02-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000010000",
            "010110110111"
          ],
          "img-day": "img/oll/oll-02-v3-day-256x256.png",
          "img-night": "img/oll/oll-02-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "3",
      "no": 3,
      "name": "No Edges - Anti-Mouse",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000010001",
            "110011110010"
          ],
          "img-day": "img/oll/oll-03-v0-day-256x256.png",
          "img-night": "img/oll/oll-03-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F' (U L' U L U) (L F' L' F) U2 F",
              "n": 12,
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
          "sig": [
            "000010100",
            "110010110011"
          ],
          "img-day": "img/oll/oll-03-v1-day-256x256.png",
          "img-night": "img/oll/oll-03-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100010000",
            "010011110011"
          ],
          "img-day": "img/oll/oll-03-v2-day-256x256.png",
          "img-night": "img/oll/oll-03-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001010000",
            "110011010011"
          ],
          "img-day": "img/oll/oll-03-v3-day-256x256.png",
          "img-night": "img/oll/oll-03-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "4",
      "no": 4,
      "name": "No Edges - Mouse",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000010100",
            "011110011010"
          ],
          "img-day": "img/oll/oll-04-v0-day-256x256.png",
          "img-night": "img/oll/oll-04-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F (U' R U' R' U') (R' F R F') U2 F'",
              "n": 12,
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
          "sig": [
            "100010000",
            "011010011110"
          ],
          "img-day": "img/oll/oll-04-v1-day-256x256.png",
          "img-night": "img/oll/oll-04-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "001010000",
            "010110011110"
          ],
          "img-day": "img/oll/oll-04-v2-day-256x256.png",
          "img-night": "img/oll/oll-04-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000010001",
            "011110010110"
          ],
          "img-day": "img/oll/oll-04-v3-day-256x256.png",
          "img-night": "img/oll/oll-04-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "17",
      "no": 17,
      "name": "No Edges - Slash",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100010001",
            "011011010010"
          ],
          "img-day": "img/oll/oll-17-v0-day-256x256.png",
          "img-night": "img/oll/oll-17-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' U) (R' F R F') U2 (R' F R F')",
              "n": 13,
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
          "sig": [
            "001010100",
            "110010011010"
          ],
          "img-day": "img/oll/oll-17-v1-day-256x256.png",
          "img-night": "img/oll/oll-17-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100010001",
            "010010110110"
          ],
          "img-day": "img/oll/oll-17-v2-day-256x256.png",
          "img-night": "img/oll/oll-17-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001010100",
            "010110010011"
          ],
          "img-day": "img/oll/oll-17-v3-day-256x256.png",
          "img-night": "img/oll/oll-17-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "18",
      "no": 18,
      "name": "No Edges - Crown",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "101010000",
            "010010010111"
          ],
          "img-day": "img/oll/oll-18-v0-day-256x256.png",
          "img-night": "img/oll/oll-18-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r U R') (U R U'2) (r'2 U' R U' R' U'2 r)",
              "n": 13,
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
          "sig": [
            "001010001",
            "010111010010"
          ],
          "img-day": "img/oll/oll-18-v1-day-256x256.png",
          "img-night": "img/oll/oll-18-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000010101",
            "111010010010"
          ],
          "img-day": "img/oll/oll-18-v2-day-256x256.png",
          "img-night": "img/oll/oll-18-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "100010100",
            "010010111010"
          ],
          "img-day": "img/oll/oll-18-v3-day-256x256.png",
          "img-night": "img/oll/oll-18-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "19",
      "no": 19,
      "name": "No Edges - Bunny / Mickey",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "101010000",
            "010011011010"
          ],
          "img-day": "img/oll/oll-19-v0-day-256x256.png",
          "img-night": "img/oll/oll-19-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(M U) (R U R' U') M' (R' F R F')",
              "n": 11,
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
          "sig": [
            "001010001",
            "110010010110"
          ],
          "img-day": "img/oll/oll-19-v1-day-256x256.png",
          "img-night": "img/oll/oll-19-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000010101",
            "010110110010"
          ],
          "img-day": "img/oll/oll-19-v2-day-256x256.png",
          "img-night": "img/oll/oll-19-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "100010100",
            "011010010011"
          ],
          "img-day": "img/oll/oll-19-v3-day-256x256.png",
          "img-night": "img/oll/oll-19-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "dot"
    },
    {
      "id": "20",
      "no": 20,
      "name": "No Edges - X / Checkers",
      "prob": "1/216",
      "descEn": "Advanced solvers might use [OLLCP-A] algorithms for this case. The second algorithm is simply the inverse of the first algorithm.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "101010101",
            "010010010010"
          ],
          "img-day": "img/oll/oll-20-v0-day-256x256.png",
          "img-night": "img/oll/oll-20-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(M U) (R U R' U') M'2 (U R U' r')",
              "n": 11,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            }
          ]
        }
      ],
      "group": "dot"
    },
    {
      "id": "13",
      "no": 13,
      "name": "Knight Move - Gun",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111100",
            "110000100011"
          ],
          "img-day": "img/oll/oll-13-v0-day-256x256.png",
          "img-night": "img/oll/oll-13-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r U' r') (U' r U r') (F' U F)",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(L F') (L' U' L F L') (F' U F)",
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
          "sig": [
            "110010010",
            "000011110001"
          ],
          "img-day": "img/oll/oll-13-v1-day-256x256.png",
          "img-night": "img/oll/oll-13-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "001111000",
            "110001000011"
          ],
          "img-day": "img/oll/oll-13-v2-day-256x256.png",
          "img-night": "img/oll/oll-13-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010010011",
            "100011110000"
          ],
          "img-day": "img/oll/oll-13-v3-day-256x256.png",
          "img-night": "img/oll/oll-13-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "14",
      "no": 14,
      "name": "Knight Move - Anti-Gun",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111001",
            "011100000110"
          ],
          "img-day": "img/oll/oll-14-v0-day-256x256.png",
          "img-night": "img/oll/oll-14-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l' U l) (U l' U' l) (F U' F')",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R' F) (R U R' F' R) (F U' F')",
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
          "sig": [
            "010010110",
            "001110011000"
          ],
          "img-day": "img/oll/oll-14-v1-day-256x256.png",
          "img-night": "img/oll/oll-14-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100111000",
            "011000001110"
          ],
          "img-day": "img/oll/oll-14-v2-day-256x256.png",
          "img-night": "img/oll/oll-14-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011010010",
            "000110011100"
          ],
          "img-day": "img/oll/oll-14-v3-day-256x256.png",
          "img-night": "img/oll/oll-14-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "15",
      "no": 15,
      "name": "Knight Move - Squeegee",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111001",
            "110001100010"
          ],
          "img-day": "img/oll/oll-15-v0-day-256x256.png",
          "img-night": "img/oll/oll-15-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U' r) (R' U' R U) (r' U r)",
              "n": 10,
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
          "sig": [
            "010010110",
            "100010110001"
          ],
          "img-day": "img/oll/oll-15-v1-day-256x256.png",
          "img-night": "img/oll/oll-15-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100111000",
            "010001100011"
          ],
          "img-day": "img/oll/oll-15-v2-day-256x256.png",
          "img-night": "img/oll/oll-15-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011010010",
            "100011010001"
          ],
          "img-day": "img/oll/oll-15-v3-day-256x256.png",
          "img-night": "img/oll/oll-15-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "16",
      "no": 16,
      "name": "Knight Move - Anti-Squeegee",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111100",
            "011100001010"
          ],
          "img-day": "img/oll/oll-16-v0-day-256x256.png",
          "img-night": "img/oll/oll-16-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l U l') (L U L' U') (l U' l')",
              "n": 10,
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
          "sig": [
            "110010010",
            "001010011100"
          ],
          "img-day": "img/oll/oll-16-v1-day-256x256.png",
          "img-night": "img/oll/oll-16-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "001111000",
            "010100001110"
          ],
          "img-day": "img/oll/oll-16-v2-day-256x256.png",
          "img-night": "img/oll/oll-16-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010010011",
            "001110010100"
          ],
          "img-day": "img/oll/oll-16-v3-day-256x256.png",
          "img-night": "img/oll/oll-16-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "33",
      "no": 33,
      "name": "T Shape - Key",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001111001",
            "110000000110"
          ],
          "img-day": "img/oll/oll-33-v0-day-256x256.png",
          "img-night": "img/oll/oll-33-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' U') (R' F R F')",
              "n": 8,
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
          "sig": [
            "010010111",
            "000110110000"
          ],
          "img-day": "img/oll/oll-33-v1-day-256x256.png",
          "img-night": "img/oll/oll-33-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100111100",
            "011000000011"
          ],
          "img-day": "img/oll/oll-33-v2-day-256x256.png",
          "img-night": "img/oll/oll-33-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "111010010",
            "000011011000"
          ],
          "img-day": "img/oll/oll-33-v3-day-256x256.png",
          "img-night": "img/oll/oll-33-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "34",
      "no": 34,
      "name": "C Shape - City (C and T)",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111101",
            "010100100010"
          ],
          "img-day": "img/oll/oll-34-v0-day-256x256.png",
          "img-night": "img/oll/oll-34-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' U') y' (r' U' R U) M'",
              "n": 10,
              "uses": [
                "2H"
              ],
              "tags": [
                "preferred"
              ]
            },
            {
              "no": 2,
              "alg": "(R U R2 U') (R' F) (R U R U' F')",
              "n": 11,
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
          "sig": [
            "110010110",
            "001010010001"
          ],
          "img-day": "img/oll/oll-34-v1-day-256x256.png",
          "img-night": "img/oll/oll-34-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "101111000",
            "010001001010"
          ],
          "img-day": "img/oll/oll-34-v2-day-256x256.png",
          "img-night": "img/oll/oll-34-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011010011",
            "100010010100"
          ],
          "img-day": "img/oll/oll-34-v3-day-256x256.png",
          "img-night": "img/oll/oll-34-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "39",
      "no": 39,
      "name": "Big Lightning Bolt",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001111100",
            "110000001010"
          ],
          "img-day": "img/oll/oll-39-v0-day-256x256.png",
          "img-night": "img/oll/oll-39-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L F') (L' U' L U) F (U' L')",
              "n": 9,
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
          "sig": [
            "110010011",
            "000010110100"
          ],
          "img-day": "img/oll/oll-39-v1-day-256x256.png",
          "img-night": "img/oll/oll-39-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "001111100",
            "010100000011"
          ],
          "img-day": "img/oll/oll-39-v2-day-256x256.png",
          "img-night": "img/oll/oll-39-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110010011",
            "001011010000"
          ],
          "img-day": "img/oll/oll-39-v3-day-256x256.png",
          "img-night": "img/oll/oll-39-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "40",
      "no": 40,
      "name": "Big Lightning Bolt",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100111001",
            "011001000010"
          ],
          "img-day": "img/oll/oll-40-v0-day-256x256.png",
          "img-night": "img/oll/oll-40-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R' F) (R U R' U') F' (U R)",
              "n": 9,
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
          "sig": [
            "011010110",
            "100010011000"
          ],
          "img-day": "img/oll/oll-40-v1-day-256x256.png",
          "img-night": "img/oll/oll-40-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100111001",
            "010000100110"
          ],
          "img-day": "img/oll/oll-40-v2-day-256x256.png",
          "img-night": "img/oll/oll-40-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011010110",
            "000110010001"
          ],
          "img-day": "img/oll/oll-40-v3-day-256x256.png",
          "img-night": "img/oll/oll-40-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "45",
      "no": 45,
      "name": "T Shape - Suit Up",
      "prob": "1/54",
      "descEn": "This is one of the three [OLL] cases (43, 44, 45) with a 6 move solution. The algorithm(s) for this [OLL] case are good choices for the opposite edge flip during [EOLL].",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001111001",
            "010101000010"
          ],
          "img-day": "img/oll/oll-45-v0-day-256x256.png",
          "img-night": "img/oll/oll-45-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F (R U R' U') F'",
              "n": 6,
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
          "sig": [
            "010010111",
            "101010010000"
          ],
          "img-day": "img/oll/oll-45-v1-day-256x256.png",
          "img-night": "img/oll/oll-45-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100111100",
            "010000101010"
          ],
          "img-day": "img/oll/oll-45-v2-day-256x256.png",
          "img-night": "img/oll/oll-45-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "111010010",
            "000010010101"
          ],
          "img-day": "img/oll/oll-45-v3-day-256x256.png",
          "img-night": "img/oll/oll-45-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "46",
      "no": 46,
      "name": "C Shape - Seein' Headlights",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "110010110",
            "000010111000"
          ],
          "img-day": "img/oll/oll-46-v0-day-256x256.png",
          "img-night": "img/oll/oll-46-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R' U') (R' F R F') (U R)",
              "n": 8,
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
          "sig": [
            "101111000",
            "010000000111"
          ],
          "img-day": "img/oll/oll-46-v1-day-256x256.png",
          "img-night": "img/oll/oll-46-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "011010011",
            "000111010000"
          ],
          "img-day": "img/oll/oll-46-v2-day-256x256.png",
          "img-night": "img/oll/oll-46-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000111101",
            "111000000010"
          ],
          "img-day": "img/oll/oll-46-v3-day-256x256.png",
          "img-night": "img/oll/oll-46-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "51",
      "no": 51,
      "name": "I Shape - Ant / Bottle Cap",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111000",
            "011101000011"
          ],
          "img-day": "img/oll/oll-51-v0-day-256x256.png",
          "img-night": "img/oll/oll-51-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "f (R U R' U') (R U R' U') f'",
              "n": 10,
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
          "sig": [
            "010010010",
            "101011011000"
          ],
          "img-day": "img/oll/oll-51-v1-day-256x256.png",
          "img-night": "img/oll/oll-51-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000111000",
            "110000101110"
          ],
          "img-day": "img/oll/oll-51-v2-day-256x256.png",
          "img-night": "img/oll/oll-51-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010010010",
            "000110110101"
          ],
          "img-day": "img/oll/oll-51-v3-day-256x256.png",
          "img-night": "img/oll/oll-51-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "52",
      "no": 52,
      "name": "I Shape - Rice Cooker",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010010010",
            "100010111100"
          ],
          "img-day": "img/oll/oll-52-v0-day-256x256.png",
          "img-night": "img/oll/oll-52-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R' U' R U') (R' U) y' (R' U R B)",
              "n": 11,
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
          "sig": [
            "000111000",
            "010100100111"
          ],
          "img-day": "img/oll/oll-52-v1-day-256x256.png",
          "img-night": "img/oll/oll-52-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010010010",
            "001111010001"
          ],
          "img-day": "img/oll/oll-52-v2-day-256x256.png",
          "img-night": "img/oll/oll-52-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000111000",
            "111001001010"
          ],
          "img-day": "img/oll/oll-52-v3-day-256x256.png",
          "img-night": "img/oll/oll-52-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "55",
      "no": 55,
      "name": "I Shape - Highway",
      "prob": "1/108",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010010010",
            "000111111000"
          ],
          "img-day": "img/oll/oll-55-v0-day-256x256.png",
          "img-night": "img/oll/oll-55-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2 R'2 U') (R U' R' U2) (F R F')",
              "n": 11,
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
          "sig": [
            "000111000",
            "111000000111"
          ],
          "img-day": "img/oll/oll-55-v1-day-256x256.png",
          "img-night": "img/oll/oll-55-v1-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "56",
      "no": 56,
      "name": "I Shape - Street Lights",
      "prob": "1/108",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000111000",
            "010101101010"
          ],
          "img-day": "img/oll/oll-56-v0-day-256x256.png",
          "img-night": "img/oll/oll-56-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U' r) (U' R' U R) (U' R' U R) (r' U r)",
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
          "sig": [
            "010010010",
            "101010010101"
          ],
          "img-day": "img/oll/oll-56-v1-day-256x256.png",
          "img-night": "img/oll/oll-56-v1-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "57",
      "no": 57,
      "name": "H / I",
      "prob": "1/108",
      "descEn": "Advanced solvers might use [OLLCP-A] algorithms for this case.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "101111101",
            "010000000010"
          ],
          "img-day": "img/oll/oll-57-v0-day-256x256.png",
          "img-night": "img/oll/oll-57-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R' U') M' (U R U' r')",
              "n": 9,
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
          "sig": [
            "111010111",
            "000010010000"
          ],
          "img-day": "img/oll/oll-57-v1-day-256x256.png",
          "img-night": "img/oll/oll-57-v1-night-256x256.png",
          "algs": []
        }
      ],
      "group": "line"
    },
    {
      "id": "5",
      "no": 5,
      "name": "Square Shape - RBWAS",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "110110000",
            "000001110011"
          ],
          "img-day": "img/oll/oll-05-v0-day-256x256.png",
          "img-night": "img/oll/oll-05-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l' U'2) (L U L' U l)",
              "n": 7,
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
          "sig": [
            "011011000",
            "100011000011"
          ],
          "img-day": "img/oll/oll-05-v1-day-256x256.png",
          "img-night": "img/oll/oll-05-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000011011",
            "110011100000"
          ],
          "img-day": "img/oll/oll-05-v2-day-256x256.png",
          "img-night": "img/oll/oll-05-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000110110",
            "110000110001"
          ],
          "img-day": "img/oll/oll-05-v3-day-256x256.png",
          "img-night": "img/oll/oll-05-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "6",
      "no": 6,
      "name": "Square Shape - RFWAS",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "011011000",
            "000110001110"
          ],
          "img-day": "img/oll/oll-06-v0-day-256x256.png",
          "img-night": "img/oll/oll-06-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r U2) (R' U' R U' r')",
              "n": 7,
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
          "sig": [
            "000011011",
            "011110000100"
          ],
          "img-day": "img/oll/oll-06-v1-day-256x256.png",
          "img-night": "img/oll/oll-06-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000110110",
            "011100011000"
          ],
          "img-day": "img/oll/oll-06-v2-day-256x256.png",
          "img-night": "img/oll/oll-06-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110110000",
            "001000011110"
          ],
          "img-day": "img/oll/oll-06-v3-day-256x256.png",
          "img-night": "img/oll/oll-06-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "7",
      "no": 7,
      "name": "Small Lightning Bolt - RFWS",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001011010",
            "110011000001"
          ],
          "img-day": "img/oll/oll-07-v0-day-256x256.png",
          "img-night": "img/oll/oll-07-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l U L') (U L U'2 l')",
              "n": 7,
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
          "sig": [
            "000110011",
            "110001110000"
          ],
          "img-day": "img/oll/oll-07-v1-day-256x256.png",
          "img-night": "img/oll/oll-07-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010110100",
            "100000110011"
          ],
          "img-day": "img/oll/oll-07-v2-day-256x256.png",
          "img-night": "img/oll/oll-07-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110011000",
            "000011100011"
          ],
          "img-day": "img/oll/oll-07-v3-day-256x256.png",
          "img-night": "img/oll/oll-07-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "8",
      "no": 8,
      "name": "Small Lightning Bolt - RBWS",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100110010",
            "011000011100"
          ],
          "img-day": "img/oll/oll-08-v0-day-256x256.png",
          "img-night": "img/oll/oll-08-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U' R) (U' R' U'2 r)",
              "n": 7,
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
          "sig": [
            "011110000",
            "000100011110"
          ],
          "img-day": "img/oll/oll-08-v1-day-256x256.png",
          "img-night": "img/oll/oll-08-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010011001",
            "001110000110"
          ],
          "img-day": "img/oll/oll-08-v2-day-256x256.png",
          "img-night": "img/oll/oll-08-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000011110",
            "011110001000"
          ],
          "img-day": "img/oll/oll-08-v3-day-256x256.png",
          "img-night": "img/oll/oll-08-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "9",
      "no": 9,
      "name": "Fish Shape - Kite",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001110010",
            "010100011100"
          ],
          "img-day": "img/oll/oll-09-v0-day-256x256.png",
          "img-night": "img/oll/oll-09-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2 R') M' (U' R U' R' U) M",
              "n": 10,
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
          "sig": [
            "010110001",
            "001100010110"
          ],
          "img-day": "img/oll/oll-09-v1-day-256x256.png",
          "img-night": "img/oll/oll-09-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010011100",
            "001110001010"
          ],
          "img-day": "img/oll/oll-09-v2-day-256x256.png",
          "img-night": "img/oll/oll-09-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "100011010",
            "011010001100"
          ],
          "img-day": "img/oll/oll-09-v3-day-256x256.png",
          "img-night": "img/oll/oll-09-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "10",
      "no": 10,
      "name": "Fish Shape - Anti-Kite",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100011010",
            "010011100001"
          ],
          "img-day": "img/oll/oll-10-v0-day-256x256.png",
          "img-night": "img/oll/oll-10-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U2 L) M' (U L' U L U') M",
              "n": 10,
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
          "sig": [
            "001110010",
            "110001010001"
          ],
          "img-day": "img/oll/oll-10-v1-day-256x256.png",
          "img-night": "img/oll/oll-10-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010110001",
            "100001110010"
          ],
          "img-day": "img/oll/oll-10-v2-day-256x256.png",
          "img-night": "img/oll/oll-10-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010011100",
            "100010100011"
          ],
          "img-day": "img/oll/oll-10-v3-day-256x256.png",
          "img-night": "img/oll/oll-10-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "11",
      "no": 11,
      "name": "Small Lightning Bolt",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "011110000",
            "100001010011"
          ],
          "img-day": "img/oll/oll-11-v0-day-256x256.png",
          "img-night": "img/oll/oll-11-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l' L2 U L' U) (L U2 L' U L') l",
              "n": 11,
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
          "sig": [
            "010011001",
            "100011100010"
          ],
          "img-day": "img/oll/oll-11-v1-day-256x256.png",
          "img-night": "img/oll/oll-11-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000011110",
            "110010100001"
          ],
          "img-day": "img/oll/oll-11-v2-day-256x256.png",
          "img-night": "img/oll/oll-11-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "100110010",
            "010001110001"
          ],
          "img-day": "img/oll/oll-11-v3-day-256x256.png",
          "img-night": "img/oll/oll-11-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "12",
      "no": 12,
      "name": "Small Lightning Bolt",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "110011000",
            "001010001110"
          ],
          "img-day": "img/oll/oll-12-v0-day-256x256.png",
          "img-night": "img/oll/oll-12-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r R'2 U' R U') (R' U2 R U' R) r'",
              "n": 11,
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
          "sig": [
            "001011010",
            "010110001100"
          ],
          "img-day": "img/oll/oll-12-v1-day-256x256.png",
          "img-night": "img/oll/oll-12-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000110011",
            "011100010100"
          ],
          "img-day": "img/oll/oll-12-v2-day-256x256.png",
          "img-night": "img/oll/oll-12-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010110100",
            "001100011010"
          ],
          "img-day": "img/oll/oll-12-v3-day-256x256.png",
          "img-night": "img/oll/oll-12-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "28",
      "no": 28,
      "name": "Stealth / Angel Fish",
      "prob": "1/54",
      "descEn": "Advanced solvers might use [OLLCP-A] algorithms for this case.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "101110111",
            "010000010000"
          ],
          "img-day": "img/oll/oll-28-v0-day-256x256.png",
          "img-night": "img/oll/oll-28-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U' R U) M' (U' R' U R)",
              "n": 9,
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
          "sig": [
            "111110101",
            "000000010010"
          ],
          "img-day": "img/oll/oll-28-v1-day-256x256.png",
          "img-night": "img/oll/oll-28-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "111011101",
            "000010000010"
          ],
          "img-day": "img/oll/oll-28-v2-day-256x256.png",
          "img-night": "img/oll/oll-28-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "101011111",
            "010010000000"
          ],
          "img-day": "img/oll/oll-28-v3-day-256x256.png",
          "img-night": "img/oll/oll-28-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "29",
      "no": 29,
      "name": "Awkward Shape",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010011101",
            "000110100010"
          ],
          "img-day": "img/oll/oll-29-v0-day-256x256.png",
          "img-night": "img/oll/oll-29-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R' F R F') (R U2 R' U') y' (R' U' R)",
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
              "alg": "U' (R U R' U') (R U' R') (F' U' F) (R U R')",
              "n": 14,
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
          "sig": [
            "100011110",
            "011010000001"
          ],
          "img-day": "img/oll/oll-29-v1-day-256x256.png",
          "img-night": "img/oll/oll-29-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "101110010",
            "010001011000"
          ],
          "img-day": "img/oll/oll-29-v2-day-256x256.png",
          "img-night": "img/oll/oll-29-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011110001",
            "100000010110"
          ],
          "img-day": "img/oll/oll-29-v3-day-256x256.png",
          "img-night": "img/oll/oll-29-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "30",
      "no": 30,
      "name": "Awkward Shape",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010110101",
            "000100110010"
          ],
          "img-day": "img/oll/oll-30-v0-day-256x256.png",
          "img-night": "img/oll/oll-30-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L F' L' F) (L' U2 L U) y (L U L')",
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
              "alg": "U (L' U' L U) (L' U L) (F U F') (L' U' L)",
              "n": 14,
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
          "sig": [
            "110011100",
            "001010000011"
          ],
          "img-day": "img/oll/oll-30-v1-day-256x256.png",
          "img-night": "img/oll/oll-30-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "101011010",
            "010011001000"
          ],
          "img-day": "img/oll/oll-30-v2-day-256x256.png",
          "img-night": "img/oll/oll-30-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001110011",
            "110000010100"
          ],
          "img-day": "img/oll/oll-30-v3-day-256x256.png",
          "img-night": "img/oll/oll-30-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "31",
      "no": 31,
      "name": "P Shape - Little \"q\"",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100110110",
            "011000010001"
          ],
          "img-day": "img/oll/oll-31-v0-day-256x256.png",
          "img-night": "img/oll/oll-31-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U') f (R U R' U') f' L",
              "n": 9,
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
          "sig": [
            "111110000",
            "000001011010"
          ],
          "img-day": "img/oll/oll-31-v1-day-256x256.png",
          "img-night": "img/oll/oll-31-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "011011001",
            "100010000110"
          ],
          "img-day": "img/oll/oll-31-v2-day-256x256.png",
          "img-night": "img/oll/oll-31-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000011111",
            "010110100000"
          ],
          "img-day": "img/oll/oll-31-v3-day-256x256.png",
          "img-night": "img/oll/oll-31-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "32",
      "no": 32,
      "name": "P Shape - Little \"d\"",
      "prob": "1/54",
      "descEn": "Very few people list the algorithm that I use but it is just the inverse of a \"Big Bolt\" case; OLL 39.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001011011",
            "110010000100"
          ],
          "img-day": "img/oll/oll-32-v0-day-256x256.png",
          "img-night": "img/oll/oll-32-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U) f' (L' U' L U) f R'",
              "n": 9,
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
          "sig": [
            "000110111",
            "010100110000"
          ],
          "img-day": "img/oll/oll-32-v1-day-256x256.png",
          "img-night": "img/oll/oll-32-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "110110100",
            "001000010011"
          ],
          "img-day": "img/oll/oll-32-v2-day-256x256.png",
          "img-night": "img/oll/oll-32-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "111011000",
            "000011001010"
          ],
          "img-day": "img/oll/oll-32-v3-day-256x256.png",
          "img-night": "img/oll/oll-32-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "35",
      "no": 35,
      "name": "Fish Shape - Fish Salad",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100011011",
            "010010100100"
          ],
          "img-day": "img/oll/oll-35-v0-day-256x256.png",
          "img-night": "img/oll/oll-35-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2) (R'2 F R F') (R U'2 R')",
              "n": 9,
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
          "sig": [
            "001110110",
            "010100010001"
          ],
          "img-day": "img/oll/oll-35-v1-day-256x256.png",
          "img-night": "img/oll/oll-35-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "110110001",
            "001001010010"
          ],
          "img-day": "img/oll/oll-35-v2-day-256x256.png",
          "img-night": "img/oll/oll-35-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011011100",
            "100010001010"
          ],
          "img-day": "img/oll/oll-35-v3-day-256x256.png",
          "img-night": "img/oll/oll-35-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "36",
      "no": 36,
      "name": "W Shape - Wario",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100110011",
            "010000110100"
          ],
          "img-day": "img/oll/oll-36-v0-day-256x256.png",
          "img-night": "img/oll/oll-36-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U'2 R'2 F2) (r U' R U'2) r' F",
              "n": 10,
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
          "sig": [
            "011110100",
            "000100010011"
          ],
          "img-day": "img/oll/oll-36-v1-day-256x256.png",
          "img-night": "img/oll/oll-36-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "110011001",
            "001011000010"
          ],
          "img-day": "img/oll/oll-36-v2-day-256x256.png",
          "img-night": "img/oll/oll-36-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001011110",
            "110010001000"
          ],
          "img-day": "img/oll/oll-36-v3-day-256x256.png",
          "img-night": "img/oll/oll-36-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "37",
      "no": 37,
      "name": "Fish Shape - Mounted Fish",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "110110001",
            "000000110110"
          ],
          "img-day": "img/oll/oll-37-v0-day-256x256.png",
          "img-night": "img/oll/oll-37-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(F R' F' R) (U R U' R')",
              "n": 8,
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
          "sig": [
            "011011100",
            "000110000011"
          ],
          "img-day": "img/oll/oll-37-v1-day-256x256.png",
          "img-night": "img/oll/oll-37-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "100011011",
            "011011000000"
          ],
          "img-day": "img/oll/oll-37-v2-day-256x256.png",
          "img-night": "img/oll/oll-37-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001110110",
            "110000011000"
          ],
          "img-day": "img/oll/oll-37-v3-day-256x256.png",
          "img-night": "img/oll/oll-37-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "38",
      "no": 38,
      "name": "W Shape - Mario",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001011110",
            "010110000001"
          ],
          "img-day": "img/oll/oll-38-v0-day-256x256.png",
          "img-night": "img/oll/oll-38-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U'2 L2 F'2) (l' U L' U2) l F'",
              "n": 10,
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
          "sig": [
            "100110011",
            "011001010000"
          ],
          "img-day": "img/oll/oll-38-v1-day-256x256.png",
          "img-night": "img/oll/oll-38-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "011110100",
            "100000011010"
          ],
          "img-day": "img/oll/oll-38-v2-day-256x256.png",
          "img-night": "img/oll/oll-38-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "110011001",
            "000010100110"
          ],
          "img-day": "img/oll/oll-38-v3-day-256x256.png",
          "img-night": "img/oll/oll-38-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "41",
      "no": 41,
      "name": "Awkward Shape",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010110101",
            "101000010010"
          ],
          "img-day": "img/oll/oll-41-v0-day-256x256.png",
          "img-night": "img/oll/oll-41-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(R U R') (U R U2 R') F (R U R' U') F'",
              "n": 13,
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
          "sig": [
            "110011100",
            "000010101010"
          ],
          "img-day": "img/oll/oll-41-v1-day-256x256.png",
          "img-night": "img/oll/oll-41-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "101011010",
            "010010000101"
          ],
          "img-day": "img/oll/oll-41-v2-day-256x256.png",
          "img-night": "img/oll/oll-41-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "001110011",
            "010101010000"
          ],
          "img-day": "img/oll/oll-41-v3-day-256x256.png",
          "img-night": "img/oll/oll-41-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "42",
      "no": 42,
      "name": "Awkward Shape",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010011101",
            "101010000010"
          ],
          "img-day": "img/oll/oll-42-v0-day-256x256.png",
          "img-night": "img/oll/oll-42-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(L' U' L) (U' L' U'2 L) F' (L' U' L U) F",
              "n": 13,
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
          "sig": [
            "100011110",
            "010010101000"
          ],
          "img-day": "img/oll/oll-42-v1-day-256x256.png",
          "img-night": "img/oll/oll-42-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "101110010",
            "010000010101"
          ],
          "img-day": "img/oll/oll-42-v2-day-256x256.png",
          "img-night": "img/oll/oll-42-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "011110001",
            "000101010010"
          ],
          "img-day": "img/oll/oll-42-v3-day-256x256.png",
          "img-night": "img/oll/oll-42-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "43",
      "no": 43,
      "name": "P Shape - Little \"b\"",
      "prob": "1/54",
      "descEn": "This is one of the three [OLL] cases (43, 44, 45) with a 6 move solution.",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "100110110",
            "010000111000"
          ],
          "img-day": "img/oll/oll-43-v0-day-256x256.png",
          "img-night": "img/oll/oll-43-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "f' (L' U' L U) f",
              "n": 6,
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
          "sig": [
            "111110000",
            "000000010111"
          ],
          "img-day": "img/oll/oll-43-v1-day-256x256.png",
          "img-night": "img/oll/oll-43-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "011011001",
            "000111000010"
          ],
          "img-day": "img/oll/oll-43-v2-day-256x256.png",
          "img-night": "img/oll/oll-43-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000011111",
            "111010000000"
          ],
          "img-day": "img/oll/oll-43-v3-day-256x256.png",
          "img-night": "img/oll/oll-43-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "44",
      "no": 44,
      "name": "P Shape - Little \"p\"",
      "prob": "1/54",
      "descEn": "This is one of the three [OLL] cases (43, 44, 45) with a 6 move solution. The algorithm(s) for this [OLL] case are good choices for the adjacent edge flip during [EOLL].",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "001011011",
            "010111000000"
          ],
          "img-day": "img/oll/oll-44-v0-day-256x256.png",
          "img-night": "img/oll/oll-44-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "f (R U R' U') f'",
              "n": 6,
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
          "sig": [
            "000110111",
            "111000010000"
          ],
          "img-day": "img/oll/oll-44-v1-day-256x256.png",
          "img-night": "img/oll/oll-44-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "110110100",
            "000000111010"
          ],
          "img-day": "img/oll/oll-44-v2-day-256x256.png",
          "img-night": "img/oll/oll-44-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "111011000",
            "000010000111"
          ],
          "img-day": "img/oll/oll-44-v3-day-256x256.png",
          "img-night": "img/oll/oll-44-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "47",
      "no": 47,
      "name": "L Shape - Anti-Breakneck",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010011000",
            "100010101110"
          ],
          "img-day": "img/oll/oll-47-v0-day-256x256.png",
          "img-night": "img/oll/oll-47-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F' (L' U' L U) (L' U' L U) F",
              "n": 10,
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
          "sig": [
            "000011010",
            "010110100101"
          ],
          "img-day": "img/oll/oll-47-v1-day-256x256.png",
          "img-night": "img/oll/oll-47-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000110010",
            "011101010001"
          ],
          "img-day": "img/oll/oll-47-v2-day-256x256.png",
          "img-night": "img/oll/oll-47-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010110000",
            "101001011010"
          ],
          "img-day": "img/oll/oll-47-v3-day-256x256.png",
          "img-night": "img/oll/oll-47-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "48",
      "no": 48,
      "name": "L Shape - Breakneck",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "010110000",
            "001101010011"
          ],
          "img-day": "img/oll/oll-48-v0-day-256x256.png",
          "img-night": "img/oll/oll-48-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F (R U R' U') (R U R' U') F'",
              "n": 10,
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
          "sig": [
            "010011000",
            "101011001010"
          ],
          "img-day": "img/oll/oll-48-v1-day-256x256.png",
          "img-night": "img/oll/oll-48-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "000011010",
            "110010101100"
          ],
          "img-day": "img/oll/oll-48-v2-day-256x256.png",
          "img-night": "img/oll/oll-48-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000110010",
            "010100110101"
          ],
          "img-day": "img/oll/oll-48-v3-day-256x256.png",
          "img-night": "img/oll/oll-48-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "49",
      "no": 49,
      "name": "L Shape - RB Squeezy",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000110010",
            "110000111100"
          ],
          "img-day": "img/oll/oll-49-v0-day-256x256.png",
          "img-night": "img/oll/oll-49-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l U') (l'2 U l2 U l'2) (U' l)",
              "n": 9,
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
          "sig": [
            "010110000",
            "000100110111"
          ],
          "img-day": "img/oll/oll-49-v1-day-256x256.png",
          "img-night": "img/oll/oll-49-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010011000",
            "001111000011"
          ],
          "img-day": "img/oll/oll-49-v2-day-256x256.png",
          "img-night": "img/oll/oll-49-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000011010",
            "111011001000"
          ],
          "img-day": "img/oll/oll-49-v3-day-256x256.png",
          "img-night": "img/oll/oll-49-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "50",
      "no": 50,
      "name": "L Shape - RF Squeezy",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000011010",
            "011111000001"
          ],
          "img-day": "img/oll/oll-50-v0-day-256x256.png",
          "img-night": "img/oll/oll-50-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U) (r2 U' r'2 U' r2) (U r')",
              "n": 9,
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
          "sig": [
            "000110010",
            "111001011000"
          ],
          "img-day": "img/oll/oll-50-v1-day-256x256.png",
          "img-night": "img/oll/oll-50-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010110000",
            "100000111110"
          ],
          "img-day": "img/oll/oll-50-v2-day-256x256.png",
          "img-night": "img/oll/oll-50-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010011000",
            "000110100111"
          ],
          "img-day": "img/oll/oll-50-v3-day-256x256.png",
          "img-night": "img/oll/oll-50-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "53",
      "no": 53,
      "name": "L Shape - Frying Pan",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000011010",
            "010111101000"
          ],
          "img-day": "img/oll/oll-53-v0-day-256x256.png",
          "img-night": "img/oll/oll-53-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(r' U') (R U' R' U) (R U' R' U2) r",
              "n": 11,
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
          "sig": [
            "000110010",
            "111000010101"
          ],
          "img-day": "img/oll/oll-53-v1-day-256x256.png",
          "img-night": "img/oll/oll-53-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010110000",
            "000101111010"
          ],
          "img-day": "img/oll/oll-53-v2-day-256x256.png",
          "img-night": "img/oll/oll-53-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "010011000",
            "101010000111"
          ],
          "img-day": "img/oll/oll-53-v3-day-256x256.png",
          "img-night": "img/oll/oll-53-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    },
    {
      "id": "54",
      "no": 54,
      "name": "L Shape - Anti-Frying Pan",
      "prob": "1/54",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "000110010",
            "010101111000"
          ],
          "img-day": "img/oll/oll-54-v0-day-256x256.png",
          "img-night": "img/oll/oll-54-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "(l U) (L' U L U') (L' U L U2) l'",
              "n": 11,
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
          "sig": [
            "010110000",
            "101000010111"
          ],
          "img-day": "img/oll/oll-54-v1-day-256x256.png",
          "img-night": "img/oll/oll-54-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "010011000",
            "000111101010"
          ],
          "img-day": "img/oll/oll-54-v2-day-256x256.png",
          "img-night": "img/oll/oll-54-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "000011010",
            "111010000101"
          ],
          "img-day": "img/oll/oll-54-v3-day-256x256.png",
          "img-night": "img/oll/oll-54-v3-night-256x256.png",
          "algs": []
        }
      ],
      "group": "corner"
    }
  ],
  "groups": [
    {
      "key": "cross",
      "title": "顶面「十字」"
    },
    {
      "key": "dot",
      "title": "顶面「单点」"
    },
    {
      "key": "line",
      "title": "顶面「一字」"
    },
    {
      "key": "corner",
      "title": "顶面「拐角」"
    }
  ]
};
