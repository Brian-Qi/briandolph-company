// 杭州市拱墅区彼岸时墟游戏工作室 · 公开信息与内容
import works from './works.js'

const contact = import.meta.glob('./contact.local.js', { eager: true })['./contact.local.js']?.default || { phone: '', wechat: '' }

export default {
  name: '杭州市拱墅区彼岸时墟游戏工作室',
  form: '个体工商户',
  type: '独立工作室',
  short: '彼岸时墟',
  en: 'Lycoris Null',
  tagline: '游戏开发 · 数字内容 · 软件与数据',

  operator: '祁思皓',
  founded: '2026 年 5 月 11 日',
  address: '浙江省杭州市拱墅区',

  email: 'qisihao666@163.com',
  github: 'https://github.com/Brian-Qi',
  phone: contact.phone || '',
  wechat: contact.wechat || '',

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

  works
}
