// 杭州市拱墅区彼岸时墟游戏工作室 · 公开信息与内容
export default {
  name: '杭州市拱墅区彼岸时墟游戏工作室',
  short: '彼岸时墟',
  en: 'Lycoris Null',
  tagline: '游戏开发 · 数字内容 · 软件与数据',

  type: '个体工商户',
  form: '个人经营',
  operator: '祁思皓',
  creditCode: '92330105MAKDBGY136',
  regNo: '330105601558403',
  founded: '2026 年 5 月 11 日',
  authority: '杭州市拱墅区市场监督管理局',
  status: '存续',
  address: '浙江省杭州市拱墅区',

  email: 'qisihao666@163.com',
  github: 'https://github.com/Brian-Qi',
  phone: '（待补充）',
  wechat: '（待补充）',

  scope: '一般项目：数字文化创意软件开发；数字文化创意内容应用服务；数字文化创意技术装备销售；数字内容制作服务（不含出版发行）；文化场馆用智能设备制造；计算机软硬件及外围设备制造；软件开发；大数据服务；数据处理和存储支持服务；信息技术咨询服务；动漫游戏开发；非物质文化遗产保护；软件销售；软件外包服务；人工智能基础软件开发；网络与信息安全软件开发；区块链技术相关软件和服务；人工智能应用软件开发；人工智能理论与算法软件开发；技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；建筑信息模型技术开发、技术咨询、技术服务',
  scopeNote: '（依法须经批准的项目，经相关部门批准后方可开展经营活动）',

  scopeGroups: [
    {
      key: 'game',
      title: '游戏与数字内容',
      desc: '从玩法原型到上线成品，一站式交付。',
      items: ['游戏策划与玩法原型', '游戏程序开发', '数字内容制作', '互动内容与数字创意应用']
    },
    {
      key: 'software',
      title: '软件与数据服务',
      desc: '定制开发与数据处理，交付可用、可维护的系统。',
      items: ['定制软件开发', 'Web / 小程序 / 管理系统', '数据处理与存储', '信息技术咨询', '软件外包与销售']
    },
    {
      key: 'ai',
      title: 'AI 与前沿技术',
      desc: '把 AI 能力落到真实产品里，而不是停在概念。',
      items: ['AI 应用开发', 'AI 基础与算法', '网络与信息安全', '区块链应用']
    },
    {
      key: 'service',
      title: '技术服务',
      desc: '围绕上述方向的技术协作与成果交付。',
      items: ['技术开发', '技术咨询', '技术转让与推广']
    }
  ],

  works: [
    {
      id: 'arg',
      name: '《第五张财签》',
      subtitle: '民俗解谜 ARG · 浏览器互动叙事',
      url: '/arg_01/',
      cover: '/case/arg-cover.webp',
      shots: ['/case/arg-home.webp', '/case/arg-ledger.webp', '/case/arg-search.webp'],
      year: '2026',
      role: '策划 · 程序 · 美术统筹',
      tags: ['Vue 3', '非线性叙事', 'Web Audio', '纯静态前端'],
    desc: '以杭州民俗为底色的网页互动解谜作品。玩家通过馆藏检索与线索拼合，逐步还原一段民国商号账簿背后的故事——四个谜题、四档结局，全程纯前端、打开即玩。',
      highlights: ['打开即玩 · 无需安装', '纯静态架构 · 零后端依赖', '四谜题 · 四结局 · 隐藏结局']
    },
    {
      id: 'personal',
      name: '个人网站 · Briandolph Qi',
      subtitle: '个人品牌站 · Vue 3',
      url: '/self/',
      cover: '/case/personal-home.webp',
      shots: [],
      year: '2026',
      role: '设计 · 前端',
      tags: ['Vue 3', 'Vue Router', '暗色主题', '主题切换'],
      desc: '个人品牌站：暗色主题、多页路由与彩蛋成就系统，独立构建，可作为子站点挂载到主站之下，持续建设中。',
      highlights: ['暗色主题 · 一键切换', '多页面路由 + 成就系统', '独立构建 · 子站挂载']
    }
  ]
}
