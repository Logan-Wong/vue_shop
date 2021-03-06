import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/users/Users.vue'
const Users = () => import(/* webpackChunkName:"user" */ '../components/users/Users.vue')

// import Rights from '../components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName:"power" */ '../components/power/Rights.vue')
// import Roles from '../components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName:"power" */ '../components/power/Roles.vue')

// import GoodsCate from '../components/goods/Goods_cate.vue'
const GoodsCate = () => import(/* webpackChunkName:"goods" */ '../components/goods/Goods_cate.vue')
// import GoodsParams from '../components/goods/Goods_params.vue'
const GoodsParams = () => import(/* webpackChunkName:"goods" */ '../components/goods/Goods_params.vue')
// import GoodsList from '../components/goods/Goods_list.vue'
const GoodsList = () => import(/* webpackChunkName:"goods" */ '../components/goods/Goods_list.vue')
// import GoodsAdd from '../components/goods/Goods_add.vue'
const GoodsAdd = () => import(/* webpackChunkName:"goods" */ '../components/goods/Goods_add.vue')

// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName:"order_report" */ '../components/order/Order.vue')
// import Report from '../components/report/Report.vue'
const Report = () => import(/* webpackChunkName:"order_report" */ '../components/report/Report.vue')

Vue.use(VueRouter)

// 定义路由规则
const routes = [
  { path: '/', redirect: '/login' },
  // 注意：component 没有 s
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{ path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: GoodsCate },
      { path: '/params', component: GoodsParams },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to: 将要访问的路径
  // from: 代表从哪个路径跳转而来
  // next: 是一个函数，表示放行（加参数表示强制跳转）
  if (to.path === '/login') return next()
  // 获取 token
  const tokenStr = window.sessionStorage.getItem('token')
  // token 为空，强制跳转到登陆页面
  if (!tokenStr) return next('/login')
  // token 不为空，表示当前已登录，放行
  next()
})

export default router
