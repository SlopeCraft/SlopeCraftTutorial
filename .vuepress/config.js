module.exports = {
  title: 'SlopeCraft 教程',
  description: 'SlopeCraft 教程',
  base: '/SlopeCraftTutorial/',
  locales: {
    '/': {
      lang: 'zh-CN',
    },
    '/en/': {
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
      '/': {
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
          { text: '首页', link: '/' },
        ],
        sidebar: [
          {
            title: '教程',
            collapsable: false,
            children: [
              {
                path: '/v3.0/',
                title: 'v3.0傻瓜式教程'
              },
              {
                path: '/v3.1/',
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
      '/en/': {
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
          { text: 'Home', link: '/en/' },
        ],
        sidebar: [
          {
            title: 'Tutorials',
            collapsable: false,
            children: [
              {
                path: '/en/v3.1/',
                title: 'v3.1 Tutorials'
              }
            ]
          },
          {
            title: 'Principle',
            collapsable: false,
            children: [
              {
                path: '/en/BasicPrinciple/',
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