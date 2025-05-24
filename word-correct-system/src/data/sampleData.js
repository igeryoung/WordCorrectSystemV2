export const initialPccesData = [
    {
      id: 'item-001',
      originalCode: '0305000000',
      originalDescription: '預拌混凝土材料費 (示範項目)',
      correctedCode: '',
      correctedDescription: '',
      stage1Recs: [],
      stage2Recs: [],
      selectedStage1: '',
      selectedStage2: '03050',
      suffixDigits: ['','','','',''],
      showAdvanced: true
    },
    {
      id: 'item-002',
      originalCode: '0111000000',
      originalDescription: '試驗性挖掘(土方)',
      correctedCode: '',
      correctedDescription: '',
      stage1Recs: [],
      stage2Recs: [],
      selectedStage1: '',
      selectedStage2: '',
      suffixDigits: ['','','','',''],
      showAdvanced: false
    },
    {
      id: 'item-003',
      originalCode: '02742ABCDE',
      originalDescription: '瀝青相關',
      correctedCode: '',
      correctedDescription: '',
      stage1Recs: [],
      stage2Recs: [],
      selectedStage1: '',
      selectedStage2: '',
      suffixDigits: ['','','','',''],
      showAdvanced: false
    },
  ];
  
  export const pccesFullDatabase = [
    { code: "0305010000", description: "預拌混凝土，140kgf/cm2，第1型水泥，一般，規格A，特性X (最終描述)", chapter: "03050" },
    { code: "0305010010", description: "預拌混凝土，140kgf/cm2，第1型水泥，一般，規格B (最終描述)", chapter: "03050" },
    { code: "0305022369", description: "預拌混凝土，175kgf/cm2，特殊水泥A，用途甲，尺寸1，細節α (最終描述)", chapter: "03050" },
    { code: "0305011000", description: "預拌混凝土，140kgf/cm2，第2型水泥 (最終描述)", chapter: "03050" },
    { code: "0111010010", description: "試驗性挖掘(土方) 詳細描述", chapter: "01110" },
    { code: "0274210000", description: "預拌瀝青混凝土舖面, AC-10", chapter: "02742" },
  ];
  
  export const pccesHierarchyDemo = { 
    "03050": { 
      name: "預拌混凝土材料費",
      digits: { 
        "1": { name: "140kgf/cm2", 
               next_digits: { 
                 "0": { name: "第1型水泥", 
                        next_digits: {
                          "0": { name: "一般", 
                                 next_digits: {
                                   "0": { name: "規格A", 
                                          next_digits: { "0": { name: "特性X", fullCodeEnd: "0305010000" } }
                                        },
                                   "1": { name: "規格B", fullCodeEnd: "0305010010" }
                                 }
                               },
                        }
                      },
                 "1": { name: "第2型水泥", fullCodeEnd: "0305011000"}
               }
             },
        "2": { name: "175kgf/cm2", 
               next_digits: {
                 "2": { name: "特殊水泥A", 
                        next_digits: {
                          "3": { name: "用途甲", 
                                 next_digits: {
                                   "6": { name: "尺寸1", 
                                          next_digits: { "9": { name: "細節α", fullCodeEnd: "0305022369" } }
                                        }
                                 }
                               }
                        }
                      }
               }
             }
      }
    },
    "01110": { name: "試驗與調查", digits: { /* 可擴充 */ } },
    "02742": { name: "瀝青混凝土", digits: { /* 可擴充 */ } }
  };
  