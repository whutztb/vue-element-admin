import { constantRoutes } from '@/router'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve) => {
      // console.log('generateRoutes   1')
      // 配置显示内容
      const accessedRoutes = [
        {
          path: '/views/wine/user_list',
          component: Layout,
          redirect: '/dashboard',
          // alwaysShow: true, // will always show the root menu
          children: [
            {
              path: '/views/wine/user_list',
              component: () => import('@/views/wine/user_list'),
              name: '用户管理',
              meta: {
                title: '用户管理',
                icon: 'dashboard',
                affix: true
                // roles: ['admin'] // or you can only set roles in sub nav
              }
            }
          ]
        },
        {
          path: '/views/wine/jar_list',
          component: Layout,
          redirect: '/dashboard',
          // alwaysShow: true, // will always show the root menu
          children: [
            {
              path: '/views/wine/jar_list',
              component: () => import('@/views/wine/jar_list'),
              name: '陶坛管理',
              meta: {
                title: '陶坛管理',
                icon: 'dashboard',
                affix: true
                // roles: ['admin'] // or you can only set roles in sub nav
              }
            }
          ]
        },
        {
          path: '/views/wine/device_list',
          component: Layout,
          redirect: '/dashboard',
          // alwaysShow: true, // will always show the root menu
          children: [
            {
              path: '/views/wine/device_list',
              component: () => import('@/views/wine/device_list'),
              name: '设备管理',
              meta: {
                title: '设备管理',
                icon: 'dashboard',
                affix: true
                // roles: ['admin'] // or you can only set roles in sub nav
              }
            }
          ]
        },
        {
          path: '/views/wine/plan_list',
          component: Layout,
          redirect: '/dashboard',
          // alwaysShow: true, // will always show the root menu
          children: [
            {
              path: '/views/wine/plan_list',
              component: () => import('@/views/wine/plan_list'),
              name: '方案管理',
              meta: {
                title: '方案管理',
                icon: 'dashboard',
                affix: true
                // roles: ['admin'] // or you can only set roles in sub nav
              }
            }
          ]
        }
      ]
      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
