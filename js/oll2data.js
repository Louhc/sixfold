/* 由 tools/emit_pages.py 从 data/oll2.json 生成 —— 不要手改：
   改公式请改数据库，然后重跑生成器。 */
var OLL2_DB = {
  "set": "oll2",
  "v": 1,
  "generated": "data/oll2.json",
  "cases": [
    {
      "id": "h",
      "no": 1,
      "name": "H：四个角都拧着",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "b",
            "b",
            "f",
            "f"
          ],
          "img-day": "img/oll2/h-v0-day-256x256.png",
          "img-night": "img/oll2/h-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R2 U2 R' U2 R'2",
              "n": 5,
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
            "l",
            "r",
            "l",
            "r"
          ],
          "img-day": "img/oll2/h-v1-day-256x256.png",
          "img-night": "img/oll2/h-v1-night-256x256.png",
          "algs": []
        }
      ],
      "label": "H"
    },
    {
      "id": "pi",
      "no": 2,
      "name": "Pi：四个角都拧着",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "l",
            "b",
            "l",
            "f"
          ],
          "img-day": "img/oll2/pi-v0-day-256x256.png",
          "img-night": "img/oll2/pi-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F R U R' U' R U R' U' F'",
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
            "b",
            "b",
            "l",
            "r"
          ],
          "img-day": "img/oll2/pi-v1-day-256x256.png",
          "img-night": "img/oll2/pi-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "b",
            "r",
            "f",
            "r"
          ],
          "img-day": "img/oll2/pi-v2-day-256x256.png",
          "img-night": "img/oll2/pi-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "l",
            "r",
            "f",
            "f"
          ],
          "img-day": "img/oll2/pi-v3-day-256x256.png",
          "img-night": "img/oll2/pi-v3-night-256x256.png",
          "algs": []
        }
      ],
      "label": "Pi"
    },
    {
      "id": "antisune",
      "no": 3,
      "name": "AntiSune：只有一个角朝上",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "l",
            "u",
            "f",
            "r"
          ],
          "img-day": "img/oll2/antisune-v0-day-256x256.png",
          "img-night": "img/oll2/antisune-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R U2 R' U' R U' R'",
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
            "l",
            "b",
            "f",
            "u"
          ],
          "img-day": "img/oll2/antisune-v1-day-256x256.png",
          "img-night": "img/oll2/antisune-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "l",
            "b",
            "u",
            "r"
          ],
          "img-day": "img/oll2/antisune-v2-day-256x256.png",
          "img-night": "img/oll2/antisune-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "u",
            "b",
            "f",
            "r"
          ],
          "img-day": "img/oll2/antisune-v3-day-256x256.png",
          "img-night": "img/oll2/antisune-v3-night-256x256.png",
          "algs": [
            {
              "no": 2,
              "alg": "R' U' R U' R' U2 R",
              "n": 7,
              "uses": [
                "2H"
              ],
              "tags": []
            }
          ]
        }
      ],
      "label": "AntiSune"
    },
    {
      "id": "sune",
      "no": 4,
      "name": "Sune：只有一个角朝上",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "b",
            "r",
            "u",
            "f"
          ],
          "img-day": "img/oll2/sune-v0-day-256x256.png",
          "img-night": "img/oll2/sune-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R U R' U R U2 R'",
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
            "u",
            "r",
            "l",
            "f"
          ],
          "img-day": "img/oll2/sune-v1-day-256x256.png",
          "img-night": "img/oll2/sune-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "b",
            "u",
            "l",
            "f"
          ],
          "img-day": "img/oll2/sune-v2-day-256x256.png",
          "img-night": "img/oll2/sune-v2-night-256x256.png",
          "algs": [
            {
              "no": 2,
              "alg": "L U L' U L U2 L'",
              "n": 7,
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
          "sig": [
            "b",
            "r",
            "l",
            "u"
          ],
          "img-day": "img/oll2/sune-v3-day-256x256.png",
          "img-night": "img/oll2/sune-v3-night-256x256.png",
          "algs": []
        }
      ],
      "label": "Sune"
    },
    {
      "id": "l",
      "no": 5,
      "name": "L：两个角朝上",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "u",
            "r",
            "f",
            "u"
          ],
          "img-day": "img/oll2/l-v0-day-256x256.png",
          "img-night": "img/oll2/l-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F R' F' R U R U' R'",
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
            "l",
            "u",
            "u",
            "f"
          ],
          "img-day": "img/oll2/l-v1-day-256x256.png",
          "img-night": "img/oll2/l-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "u",
            "b",
            "l",
            "u"
          ],
          "img-day": "img/oll2/l-v2-day-256x256.png",
          "img-night": "img/oll2/l-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "b",
            "u",
            "u",
            "r"
          ],
          "img-day": "img/oll2/l-v3-day-256x256.png",
          "img-night": "img/oll2/l-v3-night-256x256.png",
          "algs": []
        }
      ],
      "label": "L"
    },
    {
      "id": "t",
      "no": 6,
      "name": "T：两个角朝上",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "b",
            "u",
            "f",
            "u"
          ],
          "img-day": "img/oll2/t-v0-day-256x256.png",
          "img-night": "img/oll2/t-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "R U R' U' R' F R F'",
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
            "l",
            "r",
            "u",
            "u"
          ],
          "img-day": "img/oll2/t-v1-day-256x256.png",
          "img-night": "img/oll2/t-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "u",
            "b",
            "u",
            "f"
          ],
          "img-day": "img/oll2/t-v2-day-256x256.png",
          "img-night": "img/oll2/t-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "u",
            "u",
            "l",
            "r"
          ],
          "img-day": "img/oll2/t-v3-day-256x256.png",
          "img-night": "img/oll2/t-v3-night-256x256.png",
          "algs": []
        }
      ],
      "label": "T"
    },
    {
      "id": "u",
      "no": 7,
      "name": "U：两个角朝上",
      "prob": "",
      "descEn": "",
      "views": [
        {
          "view": 0,
          "frame": "",
          "sig": [
            "l",
            "u",
            "l",
            "u"
          ],
          "img-day": "img/oll2/u-v0-day-256x256.png",
          "img-night": "img/oll2/u-v0-night-256x256.png",
          "algs": [
            {
              "no": 1,
              "alg": "F R U R' U' F'",
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
            "b",
            "b",
            "u",
            "u"
          ],
          "img-day": "img/oll2/u-v1-day-256x256.png",
          "img-night": "img/oll2/u-v1-night-256x256.png",
          "algs": []
        },
        {
          "view": 2,
          "frame": "y2",
          "sig": [
            "u",
            "r",
            "u",
            "r"
          ],
          "img-day": "img/oll2/u-v2-day-256x256.png",
          "img-night": "img/oll2/u-v2-night-256x256.png",
          "algs": []
        },
        {
          "view": 3,
          "frame": "y'",
          "sig": [
            "u",
            "u",
            "f",
            "f"
          ],
          "img-day": "img/oll2/u-v3-day-256x256.png",
          "img-night": "img/oll2/u-v3-night-256x256.png",
          "algs": []
        }
      ],
      "label": "U"
    }
  ]
};
