/* 由 tools/emit_pages.py 从 data/pbl2.json 生成 —— 不要手改：
   改公式请改数据库，然后重跑生成器。 */
var PBL2_DB = {
  "set": "pbl2",
  "v": 1,
  "generated": "data/pbl2.json",
  "cases": [
    {
      "id": "dd",
      "no": 1,
      "name": "Diag / Diag：上下两层都是对角换",
      "prob": "",
      "descEn": "",
      "state": {
        "u": [
          3,
          1,
          2,
          0
        ],
        "d": [
          3,
          1,
          2,
          0
        ]
      },
      "img-day": "img/pbl2/dd_day-256x197.png",
      "img-night": "img/pbl2/dd_night-256x197.png",
      "algs": [
        {
          "no": 1,
          "alg": "R2 B2 R2",
          "n": 3,
          "uses": [
            "2H"
          ],
          "tags": [
            "preferred"
          ]
        }
      ],
      "label": "dd",
      "kind": [
        "diagonal",
        "diagonal"
      ]
    },
    {
      "id": "ad",
      "no": 2,
      "name": "Adj / Diag：上层邻角换、下层对角换",
      "prob": "",
      "descEn": "",
      "state": {
        "u": [
          0,
          1,
          3,
          2
        ],
        "d": [
          3,
          1,
          2,
          0
        ]
      },
      "img-day": "img/pbl2/ad_day-256x197.png",
      "img-night": "img/pbl2/ad_night-256x197.png",
      "algs": [
        {
          "no": 1,
          "alg": "R' U R' B2 R U' R",
          "n": 7,
          "uses": [
            "2H"
          ],
          "tags": [
            "preferred"
          ]
        }
      ],
      "label": "ad",
      "kind": [
        "adjacent",
        "diagonal"
      ]
    },
    {
      "id": "aa",
      "no": 3,
      "name": "Adj / Adj：上下两层都是邻角换",
      "prob": "",
      "descEn": "",
      "state": {
        "u": [
          0,
          1,
          3,
          2
        ],
        "d": [
          0,
          1,
          3,
          2
        ]
      },
      "img-day": "img/pbl2/aa_day-256x197.png",
      "img-night": "img/pbl2/aa_night-256x197.png",
      "algs": [
        {
          "no": 1,
          "alg": "R2 U' R2 U2 F2 U' R2",
          "n": 7,
          "uses": [
            "2H"
          ],
          "tags": [
            "preferred"
          ]
        }
      ],
      "label": "aa",
      "kind": [
        "adjacent",
        "adjacent"
      ]
    },
    {
      "id": "a",
      "no": 4,
      "name": "Adj：一面已经完成，另一面邻角换",
      "prob": "",
      "descEn": "",
      "state": {
        "u": [
          0,
          3,
          2,
          1
        ],
        "d": [
          0,
          1,
          2,
          3
        ]
      },
      "img-day": "img/pbl2/a_day-256x197.png",
      "img-night": "img/pbl2/a_night-256x197.png",
      "algs": [
        {
          "no": 1,
          "alg": "R U2 R' U' R U2 L' U R' U' L",
          "n": 11,
          "uses": [
            "2H"
          ],
          "tags": [
            "preferred"
          ]
        }
      ],
      "label": "a",
      "kind": [
        "adjacent",
        "solved"
      ]
    },
    {
      "id": "d",
      "no": 5,
      "name": "Diag：一面已经完成，另一面对角换",
      "prob": "",
      "descEn": "",
      "state": {
        "u": [
          3,
          1,
          2,
          0
        ],
        "d": [
          0,
          1,
          2,
          3
        ]
      },
      "img-day": "img/pbl2/d_day-256x197.png",
      "img-night": "img/pbl2/d_night-256x197.png",
      "algs": [
        {
          "no": 1,
          "alg": "R U' R' U' F2 U' R U R' U F2",
          "n": 11,
          "uses": [
            "2H"
          ],
          "tags": [
            "preferred"
          ]
        }
      ],
      "label": "d",
      "kind": [
        "diagonal",
        "solved"
      ]
    }
  ]
};
