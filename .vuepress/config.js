module.exports = {
  title: 'SlopeCraft 教程',
  description: 'SlopeCraft 教程',
  base: '/SlopeCraftTutorial/',
  locales: {
    '/zh_CN/': {
      lang: 'zh-CN',
    },
    '/en_US/': {
      lang: 'en-US',
      title: 'SlopeCraft Tutorial',
      description: 'SlopeCraft Tutorial',
    }
  },
  themeConfig: {
    repo: 'ToKiNoBug/SlopeCraft',
    docsRepo: 'ToKiNoBug/SlopeCraftTutorial',
    repoLabel: 'Github',
    editLinks: true,
    locales: {
      '/zh_CN/': {
        selectText: '选择语言',
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        serviceWorker: {
          updatePopup: {
            message: "发现新内容可用.",
            buttonText: "刷新"
          }
        },
        lastUpdated: '最后更新时间',
        algolia: {},
        nav: [
          { text: '首页', link: '/zh_CN/' },
        ],
        sidebar: [
          {
            title: '教程',
            collapsable: false,
            children: [
              {
                path: '/zh_CN/v3.0/',
                title: 'v3.0傻瓜式教程'
              },
              {
                path: '/zh_CN/v3.1/',
                title: 'v3.1教程'
              }
            ]
          },
          {
            title: '原理',
            collapsable: false,
            children: [
              {
                path: '/BasicPrinciple/',
                title: '地图画原理'
              },
            ]
          },
        ]
      },
      '/en_US/': {
        selectText: 'Languages',
        label: 'English',
        ariaLabel: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        serviceWorker: {
          updatePopup: {
            message: "New content is available.",
            buttonText: "Refresh"
          }
        },
        lastUpdated: 'Last Updated',
        algolia: {},
        nav: [
          { text: 'Home', link: '/en_US/' },
        ],
        sidebar: [
          {
            title: 'Tutorials',
            collapsable: false,
            children: [
              {
                path: '/en_US/v3.1/',
                title: 'v3.1 Tutorials'
              }
            ]
          },
          {
            title: 'Principle',
            collapsable: false,
            children: [
              {
                path: '/en_US/BasicPrinciple/',
                title: 'Principle of Map Pixel Arts'
              },
            ]
          },
        ]
      }
    }
  },
  plugins: [
    [
      'vuepress-plugin-mathjax',
      {
        target: 'svg',
        macros: {
          '*': '\\times',
        },
      },
    ],
  ],
}